'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// Output geometry the worker should produce — mirrors the worker's target modes
export type Target =
  | { mode: 'cover'; w: number; h: number }
  | { mode: 'width'; w: number }
  | { mode: 'original' };

// User-adjustable enhancement parameters. sharp is 0–100, bri/con/sat are -50..50,
// focusX/focusY (0–1) position the crop window when the aspect ratio requires cropping.
export interface EditParams {
  sharp: number;
  bri: number;
  con: number;
  sat: number;
  focusX: number;
  focusY: number;
}

interface WorkerImage {
  buffer: ArrayBuffer;
  width: number;
  height: number;
}

interface LoadedMeta {
  outW: number;
  outH: number;
  cropAxis: 'x' | 'y' | null;
  autoSharpen: number;
}

interface Props {
  file: File;
  presetName: string;
  presetLabel: string;
  c1: string;
  c2: string;
  dim: string;
  target: Target;
  quality: number;
  outName: string;
  multi: boolean;
  initialParams: EditParams | null;
  onClose: () => void;
  onApplied: (url: string, size: number, params: EditParams) => void;
  onApplyAll?: (params: EditParams) => void;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

function drawImagePayload(canvas: HTMLCanvasElement | null, img: WorkerImage) {
  if (!canvas) return;
  canvas.width = img.width;
  canvas.height = img.height;
  const data = new ImageData(new Uint8ClampedArray(img.buffer), img.width, img.height);
  canvas.getContext('2d')?.putImageData(data, 0, 0);
}

function SliderRow({
  label, value, min, max, onChange,
}: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void;
}) {
  return (
    <div className="ed-slider">
      <div className="slider-row">
        <span>{label}</span>
        <span className="val">{value > 0 && min < 0 ? `+${value}` : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        aria-label={label}
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export default function PreviewEditor({
  file, presetName, presetLabel, c1, c2, dim, target, quality, outName, multi,
  initialParams, onClose, onApplied, onApplyAll,
}: Props) {
  const workerRef = useRef<Worker | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const beforeRef = useRef<HTMLCanvasElement>(null);
  const afterRef = useRef<HTMLCanvasElement>(null);

  const [meta, setMeta] = useState<LoadedMeta | null>(null);
  const [params, setParams] = useState<EditParams | null>(initialParams);
  const [divider, setDivider] = useState(50);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Latest-wins preview scheduling: never queue more than one pending render
  const busyRef = useRef(false);
  const queuedRef = useRef<{ params: EditParams; withBefore: boolean } | null>(null);
  const lastFocusRef = useRef({ x: 0.5, y: 0.5 });
  const paramsRef = useRef<EditParams | null>(params);
  const cropDragRef = useRef<{ x: number; y: number; fx: number; fy: number } | null>(null);
  const handleDragRef = useRef(false);

  const requestPreview = useCallback((p: EditParams, withBefore: boolean) => {
    const w = workerRef.current;
    if (!w) return;
    if (busyRef.current) {
      queuedRef.current = {
        params: p,
        withBefore: withBefore || queuedRef.current?.withBefore || false,
      };
      return;
    }
    busyRef.current = true;
    w.postMessage({ cmd: 'preview', params: { ...p, p3Fix: 'auto' }, withBefore, previewMax: 640 });
  }, []);

  // Spawn the worker once per editor session; it keeps the decoded image in memory
  useEffect(() => {
    const w = new Worker('/heic-worker.js');
    workerRef.current = w;
    w.onmessage = (e: MessageEvent) => {
      const d = e.data;
      if (d.type === 'loaded') {
        setMeta({ outW: d.outW, outH: d.outH, cropAxis: d.cropAxis, autoSharpen: d.autoSharpen });
        drawImagePayload(beforeRef.current, d.image);
        setParams(prev => prev ?? {
          sharp: d.autoSharpen, bri: 0, con: 0, sat: 0, focusX: 0.5, focusY: 0.5,
        });
      } else if (d.type === 'preview') {
        drawImagePayload(afterRef.current, d.image);
        if (d.before) drawImagePayload(beforeRef.current, d.before);
        busyRef.current = false;
        const q = queuedRef.current;
        if (q) {
          queuedRef.current = null;
          requestPreview(q.params, q.withBefore);
        }
      } else if (d.type === 'export') {
        const blob = new Blob([d.buffer], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = outName;
        a.click();
        setExporting(false);
        if (paramsRef.current) onApplied(url, blob.size, paramsRef.current);
      } else if (d.type === 'error') {
        setError(d.error || 'Something went wrong with this photo.');
        busyRef.current = false;
        setExporting(false);
      }
    };
    w.postMessage({ cmd: 'load', file, target, previewMax: 640 });
    return () => {
      w.terminate();
      workerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render the preview whenever a parameter changes
  useEffect(() => {
    paramsRef.current = params;
    if (!params || !meta) return;
    const focusMoved =
      params.focusX !== lastFocusRef.current.x || params.focusY !== lastFocusRef.current.y;
    lastFocusRef.current = { x: params.focusX, y: params.focusY };
    requestPreview(params, focusMoved);
  }, [params, meta, requestPreview]);

  /* ----- crop reposition drag (only when the aspect ratio forces a crop) ----- */
  const onStagePointerDown = (e: React.PointerEvent) => {
    if (!meta?.cropAxis || !params || handleDragRef.current) return;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    cropDragRef.current = { x: e.clientX, y: e.clientY, fx: params.focusX, fy: params.focusY };
  };
  const onStagePointerMove = (e: React.PointerEvent) => {
    const d = cropDragRef.current;
    const stage = stageRef.current;
    if (!d || !meta || !params || !stage) return;
    const rect = stage.getBoundingClientRect();
    if (meta.cropAxis === 'x') {
      const nf = clamp01(d.fx - (e.clientX - d.x) / rect.width);
      if (nf !== params.focusX) setParams({ ...params, focusX: nf });
    } else {
      const nf = clamp01(d.fy - (e.clientY - d.y) / rect.height);
      if (nf !== params.focusY) setParams({ ...params, focusY: nf });
    }
  };
  const onStagePointerUp = () => { cropDragRef.current = null; };

  /* ----- before/after divider drag ----- */
  const onHandleDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    handleDragRef.current = true;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  };
  const onHandleMove = (e: React.PointerEvent) => {
    if (!handleDragRef.current || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setDivider(pct < 0 ? 0 : pct > 100 ? 100 : pct);
  };
  const onHandleUp = () => { handleDragRef.current = false; };

  const reset = () => {
    if (!meta) return;
    setParams({ sharp: meta.autoSharpen, bri: 0, con: 0, sat: 0, focusX: 0.5, focusY: 0.5 });
    setDivider(50);
  };

  const exportNow = () => {
    if (!workerRef.current || !params || exporting) return;
    setExporting(true);
    workerRef.current.postMessage({
      cmd: 'export',
      params: { ...params, p3Fix: 'auto' },
      quality,
    });
  };

  return (
    <div className="ed-overlay" onClick={() => { if (!exporting) onClose(); }}>
      <div className="ed-card" onClick={e => e.stopPropagation()}>

        <div className="ed-head">
          <div
            className="preset-display ed-preset"
            style={{ '--pi1': c1, '--pi2': c2 } as React.CSSProperties}
          >
            <div className="pd-icon">{presetLabel}</div>
            <div>
              <div className="pd-name">{presetName}</div>
              <div className="pd-spec">{dim} · JPG q{quality} · sRGB</div>
            </div>
          </div>
          <button type="button" className="ed-close" onClick={onClose} aria-label="Close editor">
            <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {error ? (
          <div className="ed-error" role="alert">{error}</div>
        ) : (
          <>
            <div
              ref={stageRef}
              className={`ed-stage${meta?.cropAxis ? ' ed-stage-croppable' : ''}`}
              style={meta ? { aspectRatio: `${meta.outW} / ${meta.outH}` } : undefined}
              onPointerDown={onStagePointerDown}
              onPointerMove={onStagePointerMove}
              onPointerUp={onStagePointerUp}
              onPointerCancel={onStagePointerUp}
            >
              {!meta && <div className="ed-loading">Preparing preview…</div>}
              <canvas ref={beforeRef} className="ed-canvas" />
              <div className="ed-after-wrap" style={{ clipPath: `inset(0 0 0 ${divider}%)` }}>
                <canvas ref={afterRef} className="ed-canvas" />
              </div>
              {meta && (
                <>
                  <span className="ed-tag ed-tag-before" style={{ opacity: divider < 12 ? 0 : 1 }}>direct upload</span>
                  <span className="ed-tag ed-tag-after" style={{ opacity: divider > 88 ? 0 : 1 }}>imgora</span>
                  <div
                    className="ed-handle"
                    style={{ left: `${divider}%` }}
                    onPointerDown={onHandleDown}
                    onPointerMove={onHandleMove}
                    onPointerUp={onHandleUp}
                    onPointerCancel={onHandleUp}
                  >
                    <div className="ed-handle-grip">
                      <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
                        <path d="M5 3L2 7l3 4M9 3l3 4-3 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </>
              )}
            </div>

            {meta?.cropAxis && (
              <div className="ed-crop-hint">
                Drag the photo {meta.cropAxis === 'x' ? 'left / right' : 'up / down'} to choose what stays in frame.
              </div>
            )}

            {params && meta && (
              <div className="ed-controls">
                <SliderRow label="Sharpness" value={params.sharp} min={0} max={100}
                  onChange={v => setParams({ ...params, sharp: v })} />
                <SliderRow label="Brightness" value={params.bri} min={-50} max={50}
                  onChange={v => setParams({ ...params, bri: v })} />
                <SliderRow label="Contrast" value={params.con} min={-50} max={50}
                  onChange={v => setParams({ ...params, con: v })} />
                <SliderRow label="Saturation" value={params.sat} min={-50} max={50}
                  onChange={v => setParams({ ...params, sat: v })} />
              </div>
            )}

            <div className="ed-foot">
              <button type="button" className="btn" onClick={reset} disabled={!meta}>Reset</button>
              <div className="ed-foot-actions">
                {multi && onApplyAll && params && (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => onApplyAll(params)}
                    disabled={!meta || exporting}
                  >
                    Apply to all
                  </button>
                )}
                <button
                  type="button"
                  className="convert-btn ed-save"
                  onClick={exportNow}
                  disabled={!meta || exporting}
                >
                  {exporting ? 'Saving…' : 'Save & Download'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

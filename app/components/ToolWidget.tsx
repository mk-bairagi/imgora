'use client';

import { useCallback, useRef, useState } from 'react';
import { getDroppedFiles } from '../lib/getDroppedFiles';
import { track } from '../lib/analytics';

// One widget powers every simple tool page: format converters (drop → auto-convert
// → download) and compress-to-target-KB. Uses the htj-* styles from tool.css.

const ACCEPTS = {
  heic: {
    exts: ['.heic', '.heif'], mimes: ['image/heic', 'image/heif'],
    input: '.heic,.heif,image/heic,image/heif',
    message: 'Please drop .heic or .heif files — for other formats use our other tools.',
  },
  png: {
    exts: ['.png'], mimes: ['image/png'],
    input: '.png,image/png',
    message: 'Please drop .png files — for other formats use our other tools.',
  },
  webp: {
    exts: ['.webp'], mimes: ['image/webp'],
    input: '.webp,image/webp',
    message: 'Please drop .webp files — for other formats use our other tools.',
  },
  jpg: {
    exts: ['.jpg', '.jpeg'], mimes: ['image/jpeg'],
    input: '.jpg,.jpeg,image/jpeg',
    message: 'Please drop .jpg files — for other formats use our other tools.',
  },
  image: {
    exts: ['.heic', '.heif', '.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'], mimes: [],
    input: 'image/*,.heic,.heif',
    message: 'Please drop image files (HEIC, JPG, PNG, WebP…).',
  },
} as const;

const EXT_FOR: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export const QUALITY_PRESETS = [
  { label: 'Maximum', value: 95, hint: 'Best detail · largest file' },
  { label: 'High', value: 85, hint: 'Great quality · smaller file' },
  { label: 'Balanced', value: 75, hint: 'Good for sharing & email' },
  { label: 'Small', value: 60, hint: 'Smallest file · some loss' },
] as const;

interface FileEntry {
  id: string;
  file: File;
  name: string;
  origName: string;
  size: number;
  status: 'queued' | 'converting' | 'done' | 'error';
  url?: string;
  convertedSize?: number;
  note?: string;
  error?: string;
}

interface Props {
  toolId: string;
  accept: keyof typeof ACCEPTS;
  output: 'image/jpeg' | 'image/png';
  targetKB?: number;          // compress mode when set
  showQuality?: boolean;      // quality preset pills (JPEG convert mode)
  initialQuality?: number;
  dropTitle: string;
  dropHint: string;
}

function fmtSize(b: number) {
  if (b > 1024 * 1024) return (b / 1024 / 1024).toFixed(1) + ' MB';
  if (b > 1024) return (b / 1024).toFixed(0) + ' KB';
  return b + ' B';
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
      <path d="M7 2v8M3.5 7L7 10.5 10.5 7M2.5 12h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ToolWidget({
  toolId, accept, output, targetKB, showQuality, initialQuality = 95, dropTitle, dropHint,
}: Props) {
  const spec = ACCEPTS[accept];
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [quality, setQuality] = useState(initialQuality);
  const [dropError, setDropError] = useState<string | null>(null);
  const dropErrorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showDropError = useCallback((msg: string) => {
    setDropError(msg);
    if (dropErrorTimer.current) clearTimeout(dropErrorTimer.current);
    dropErrorTimer.current = setTimeout(() => setDropError(null), 5000);
  }, []);

  const convertEntries = useCallback((entries: FileEntry[], q: number) => {
    if (entries.length === 0) return;
    setIsConverting(true);

    Promise.all(
      entries.map(entry =>
        new Promise<void>(resolve => {
          setFiles(prev => prev.map(f => f.id === entry.id ? { ...f, status: 'converting' } : f));
          const worker = new Worker('/heic-worker.js');
          if (targetKB) {
            worker.postMessage({ cmd: 'compress', file: entry.file, targetKB });
          } else {
            worker.postMessage({
              file: entry.file, index: 0, quality: q,
              targetW: null, targetH: null, outputFormat: output,
            });
          }
          worker.onmessage = (e) => {
            const d = e.data;
            const error = d.type === 'error' ? d.error : d.error;
            if (error) {
              track('convert_error', { tool: toolId, message: String(error).slice(0, 80) });
              setFiles(prev => prev.map(f => f.id === entry.id ? { ...f, status: 'error', error } : f));
            } else {
              track('convert', { tool: toolId });
              const type = d.actualType || (targetKB ? 'image/jpeg' : output);
              const blob = new Blob([d.buffer], { type });
              const url = URL.createObjectURL(blob);
              const base = entry.origName.replace(/\.[^.]+$/, '');
              const note = targetKB
                ? `q${d.quality} · ${d.width} × ${d.height}`
                : undefined;
              setFiles(prev => prev.map(f => f.id === entry.id
                ? { ...f, status: 'done', url, name: base + (EXT_FOR[type] || '.jpg'), convertedSize: blob.size, note }
                : f
              ));
            }
            worker.terminate();
            resolve();
          };
          worker.onerror = () => {
            setFiles(prev => prev.map(f => f.id === entry.id ? { ...f, status: 'error', error: 'Conversion failed' } : f));
            worker.terminate();
            resolve();
          };
        })
      )
    ).then(() => setIsConverting(false));
  }, [output, targetKB, toolId]);

  const addFiles = useCallback((rawFiles: File[], q: number) => {
    const valid = rawFiles.filter(f => {
      const name = f.name.toLowerCase();
      return spec.exts.some(ext => name.endsWith(ext)) ||
        (spec.mimes as readonly string[]).includes(f.type) ||
        (accept === 'image' && f.type.startsWith('image/'));
    });
    if (valid.length === 0) {
      showDropError(spec.message);
      return;
    }
    setDropError(null);
    const newEntries: FileEntry[] = valid.map(f => ({
      id: crypto.randomUUID(),
      file: f,
      name: f.name,
      origName: f.name,
      size: f.size,
      status: 'queued' as const,
    }));
    setFiles(prev => [...prev, ...newEntries]);
    convertEntries(newEntries, q);
  }, [accept, spec, convertEntries, showDropError]);

  const activePreset = QUALITY_PRESETS.find(p => p.value === quality) ?? QUALITY_PRESETS[0];
  const hasFiles = files.length > 0;

  return (
    <>
      {showQuality && !targetKB && (
        <div className="htj-quality">
          <div className="htj-quality-label">
            <span>Output quality</span>
            <span className="htj-quality-hint">{activePreset.hint}</span>
          </div>
          <div className="htj-quality-pills">
            {QUALITY_PRESETS.map(p => (
              <button
                key={p.value}
                type="button"
                className={`htj-qpill${quality === p.value ? ' active' : ''}`}
                onClick={() => setQuality(p.value)}
              >
                <span className="htj-qpill-label">{p.label}</span>
                <span className="htj-qpill-value">q{p.value}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        className={`htj-drop${isDragOver ? ' over' : ''}${hasFiles ? ' compact' : ''}`}
        onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
        onDragEnter={e => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={e => {
          e.preventDefault();
          setIsDragOver(false);
          getDroppedFiles(e.dataTransfer).then(fs => addFiles(fs, quality));
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="htj-drop-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 3v14M5 10l7-7 7 7M3 21h18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2>{hasFiles ? 'Add more files' : dropTitle}</h2>
        <p>{hasFiles ? `${files.length} file${files.length > 1 ? 's' : ''} in queue · click to add more` : dropHint}</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={spec.input}
          aria-label="Choose files"
          style={{ display: 'none' }}
          onChange={e => { if (e.target.files) addFiles(Array.from(e.target.files), quality); e.target.value = ''; }}
        />
        <button
          type="button"
          className="btn primary"
          onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
        >
          Choose files
        </button>
        {!hasFiles && <p className="htj-privacy">Your photos never leave this device.</p>}
      </div>

      {dropError && (
        <div className="drop-error" role="alert">{dropError}</div>
      )}

      {hasFiles && (
        <div className="htj-files">
          {files.map(f => (
            <div key={f.id} className="htj-file" data-status={f.status}>
              <div className="htj-thumb">{f.origName.split('.').pop()?.toUpperCase().slice(0, 4)}</div>
              <div className="htj-info">
                <div className="htj-name">{f.name}</div>
                <div className="htj-meta">
                  {fmtSize(f.size)}
                  {f.status === 'done' && f.convertedSize != null && <> → {fmtSize(f.convertedSize)}</>}
                  {f.status === 'done' && f.note && <> · {f.note}</>}
                  {f.status === 'error' && f.error && <> · {f.error}</>}
                </div>
              </div>
              <div className={`htj-status ${f.status}`}>
                {f.status === 'converting' ? (
                  <span className="htj-spinner" aria-label="Converting" />
                ) : f.status}
              </div>
              {f.status === 'done' && f.url
                ? (
                  <a
                    href={f.url}
                    download={f.name}
                    className="htj-dl-btn"
                    aria-label={`Download ${f.name}`}
                    onClick={() => track('download', { tool: toolId })}
                  >
                    <DownloadIcon /> Download
                  </a>
                ) : (
                  <span className="htj-dl-btn disabled" aria-hidden="true">
                    <DownloadIcon /> Download
                  </span>
                )
              }
            </div>
          ))}
          <div className="htj-actions">
            <span className="htj-hint">
              {isConverting ? 'Converting…' : 'Done'}
              {targetKB ? <> · target ≤ {targetKB} KB</> : <> · q{quality}</>}
              {' '}· EXIF stripped
            </span>
          </div>
        </div>
      )}
    </>
  );
}

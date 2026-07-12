self.importScripts('/libheif-bundle.js');

let libheifInstance = null;

async function getLib() {
  if (!libheifInstance) {
    libheifInstance = await libheif();
  }
  return libheifInstance;
}

async function decodeHeic(file) {
  const lib = await getLib();
  const buffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(buffer);
  const decoder = new lib.HeifDecoder();
  const data = decoder.decode(uint8);
  if (!data || data.length === 0) throw new Error('Could not decode HEIC file');
  const image = data[0];
  const srcW = image.get_width();
  const srcH = image.get_height();
  const imageData = await new Promise((resolve, reject) => {
    image.display(
      { data: new Uint8ClampedArray(srcW * srcH * 4), width: srcW, height: srcH },
      (result) => { if (!result) reject(new Error('Display failed')); else resolve(result); }
    );
  });
  return { imageData, srcW, srcH };
}

async function decodeStandard(file) {
  const blob = new Blob([await file.arrayBuffer()], { type: file.type || 'image/jpeg' });
  // createImageBitmap colour-manages embedded ICC profiles to sRGB automatically
  const bitmap = await createImageBitmap(blob);
  const srcW = bitmap.width;
  const srcH = bitmap.height;
  const canvas = new OffscreenCanvas(srcW, srcH);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, srcW, srcH);
  bitmap.close();
  return { imageData, srcW, srcH };
}

function isHeic(file) {
  return (
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif') ||
    file.type === 'image/heic' ||
    file.type === 'image/heif'
  );
}

/* ================= pixel operations ================= */

// Lookup tables for gamma-aware colour math (sRGB transfer function)
const SRGB_TO_LINEAR = new Float32Array(256);
for (let i = 0; i < 256; i++) {
  const c = i / 255;
  SRGB_TO_LINEAR[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
const LINEAR_TO_SRGB = new Uint8ClampedArray(4096);
for (let i = 0; i < 4096; i++) {
  const c = i / 4095;
  const s = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  LINEAR_TO_SRGB[i] = Math.round(s * 255);
}
function lin2srgb(v) {
  if (v < 0) v = 0; else if (v > 1) v = 1;
  return LINEAR_TO_SRGB[(v * 4095) | 0];
}

// p3Fix: iPhone HEICs are Display-P3; libheif hands us the raw values without
// converting the primaries, which is why they look washed out as sRGB.
// This applies the standard linear P3(D65) → sRGB matrix.
// bri/con/sat are -50..50 slider values, 0 = no change.
function applyAdjust(px, opts) {
  const { p3Fix, bri, con, sat } = opts;
  const doB = bri !== 0, doC = con !== 0, doS = sat !== 0;
  if (!p3Fix && !doB && !doC && !doS) return;
  let lut = null;
  if (doB || doC) {
    lut = new Uint8ClampedArray(256);
    const bm = 1 + bri / 100, cm = 1 + con / 100;
    for (let i = 0; i < 256; i++) lut[i] = (i * bm - 128) * cm + 128;
  }
  const s = 1 + sat / 100;
  for (let i = 0; i < px.length; i += 4) {
    let r = px[i], g = px[i + 1], b = px[i + 2];
    if (p3Fix) {
      const R = SRGB_TO_LINEAR[r], G = SRGB_TO_LINEAR[g], B = SRGB_TO_LINEAR[b];
      r = lin2srgb(1.2249401 * R - 0.2249404 * G);
      g = lin2srgb(-0.0420569 * R + 1.0420571 * G);
      b = lin2srgb(-0.0196376 * R - 0.0786361 * G + 1.0982735 * B);
    }
    if (lut) { r = lut[r]; g = lut[g]; b = lut[b]; }
    if (doS) {
      const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      r = l + (r - l) * s; g = l + (g - l) * s; b = l + (b - l) * s;
    }
    px[i] = r; px[i + 1] = g; px[i + 2] = b;
  }
}

// Unsharp mask: out = orig + (orig - gaussianBlur) * amount.
// Separable 3×3 gaussian ([1,2,1]/4 per axis). amount 0..~1.2.
function unsharp(px, w, h, amount) {
  if (amount <= 0) return;
  const tmp = new Uint8ClampedArray(px.length);
  const blur = new Uint8ClampedArray(px.length);
  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      const i = (row + x) * 4;
      const xl = x > 0 ? i - 4 : i, xr = x < w - 1 ? i + 4 : i;
      tmp[i]     = (px[xl]     + 2 * px[i]     + px[xr]     + 2) >> 2;
      tmp[i + 1] = (px[xl + 1] + 2 * px[i + 1] + px[xr + 1] + 2) >> 2;
      tmp[i + 2] = (px[xl + 2] + 2 * px[i + 2] + px[xr + 2] + 2) >> 2;
    }
  }
  const stride = w * 4;
  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      const i = (row + x) * 4;
      const iu = y > 0 ? i - stride : i, id = y < h - 1 ? i + stride : i;
      blur[i]     = (tmp[iu]     + 2 * tmp[i]     + tmp[id]     + 2) >> 2;
      blur[i + 1] = (tmp[iu + 1] + 2 * tmp[i + 1] + tmp[id + 1] + 2) >> 2;
      blur[i + 2] = (tmp[iu + 2] + 2 * tmp[i + 2] + tmp[id + 2] + 2) >> 2;
    }
  }
  for (let i = 0; i < px.length; i += 4) {
    px[i]     = px[i]     + (px[i]     - blur[i])     * amount;
    px[i + 1] = px[i + 1] + (px[i + 1] - blur[i + 1]) * amount;
    px[i + 2] = px[i + 2] + (px[i + 2] - blur[i + 2]) * amount;
  }
}

/* ================= geometry ================= */

// target: {mode:'cover', w, h} exact platform dims (crop to fill)
//         {mode:'width', w}    resize to width, keep aspect
//         {mode:'original'}    keep source dims
// Never upscales: if the source is smaller than the target the output keeps
// the exact target aspect ratio at the largest size the source allows.
function computeGeometry(srcW, srcH, target) {
  if (target.mode === 'cover' && target.w && target.h) {
    const aspect = target.w / target.h;
    let cw = srcW, ch = Math.round(srcW / aspect);
    if (ch > srcH) { ch = srcH; cw = Math.round(srcH * aspect); }
    let outW, outH;
    if (cw >= target.w) { outW = target.w; outH = target.h; }
    else { outW = cw; outH = Math.round(cw / aspect); }
    const cropAxis = cw < srcW ? 'x' : ch < srcH ? 'y' : null;
    return { cw, ch, outW, outH, cropAxis };
  }
  if (target.mode === 'width' && target.w) {
    const scale = Math.min(target.w / srcW, 1);
    return { cw: srcW, ch: srcH, outW: Math.round(srcW * scale), outH: Math.round(srcH * scale), cropAxis: null };
  }
  return { cw: srcW, ch: srcH, outW: srcW, outH: srcH, cropAxis: null };
}

// UI sharpness (0–100) chosen from how much the image was shrunk:
// no resize → 0 (already-sharp photos are never touched).
function autoSharpen(scale) {
  if (scale >= 0.95) return 0;
  return Math.round(Math.min(55, (1 - scale) * 75));
}

/* ================= render pipeline ================= */

// Renders crop → progressive high-quality downscale → colour adjust → sharpen.
// maxSide (optional) shrinks the output proportionally for fast previews.
function renderCanvas(state, params, maxSide) {
  const { srcW, srcH, target } = state;
  const g = computeGeometry(srcW, srcH, target);
  let outW = g.outW, outH = g.outH;
  if (maxSide) {
    const k = Math.min(1, maxSide / Math.max(outW, outH));
    outW = Math.max(1, Math.round(outW * k));
    outH = Math.max(1, Math.round(outH * k));
  }
  const fx = params.focusX == null ? 0.5 : params.focusX;
  const fy = params.focusY == null ? 0.5 : params.focusY;
  const sx = Math.round((srcW - g.cw) * fx);
  const sy = Math.round((srcH - g.ch) * fy);

  if (!state.srcCanvas) {
    state.srcCanvas = new OffscreenCanvas(srcW, srcH);
    state.srcCanvas.getContext('2d')
      .putImageData(new ImageData(state.imageData.data, srcW, srcH), 0, 0);
  }

  // Progressive halving: repeated 2× downscales look much better than one big jump
  let stage = state.srcCanvas;
  let region = { sx, sy, sw: g.cw, sh: g.ch };
  let w = g.cw, h = g.ch;
  while (w * 0.5 > outW && h * 0.5 > outH) {
    const nw = Math.max(outW, Math.round(w / 2));
    const nh = Math.max(outH, Math.round(h / 2));
    const c = new OffscreenCanvas(nw, nh);
    const cx = c.getContext('2d');
    cx.imageSmoothingQuality = 'high';
    cx.drawImage(stage, region.sx, region.sy, region.sw, region.sh, 0, 0, nw, nh);
    stage = c; region = { sx: 0, sy: 0, sw: nw, sh: nh }; w = nw; h = nh;
  }
  const out = new OffscreenCanvas(outW, outH);
  const ctx = out.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(stage, region.sx, region.sy, region.sw, region.sh, 0, 0, outW, outH);

  const id = ctx.getImageData(0, 0, outW, outH);
  const p3Fix = params.p3Fix === 'auto' ? state.isHeic : !!params.p3Fix;
  applyAdjust(id.data, { p3Fix, bri: params.bri | 0, con: params.con | 0, sat: params.sat | 0 });
  const scale = g.outW / g.cw;
  const sharpUI = params.sharp === 'auto' ? autoSharpen(scale) : (params.sharp || 0);
  unsharp(id.data, outW, outH, (sharpUI / 100) * 1.2);
  ctx.putImageData(id, 0, 0);
  return { canvas: out, imageData: id, outW, outH, geometry: g, sharpUI, p3Fix };
}

const AUTO_PARAMS = { sharp: 'auto', bri: 0, con: 0, sat: 0, focusX: 0.5, focusY: 0.5, p3Fix: 'auto' };

async function decodeToState(file, target) {
  let decoded;
  const heic = isHeic(file);
  if (heic) decoded = await decodeHeic(file);
  else decoded = await decodeStandard(file);
  return {
    imageData: decoded.imageData,
    srcW: decoded.srcW,
    srcH: decoded.srcH,
    isHeic: heic,
    target: target || { mode: 'original' },
    srcCanvas: null,
  };
}

function postImagePayload(type, extra, imageData) {
  const buf = imageData.data.buffer;
  self.postMessage(
    { type, ...extra, image: { buffer: buf, width: imageData.width, height: imageData.height } },
    [buf]
  );
}

/* ================= legacy one-shot (used by /heif-to-jpg) ================= */

async function legacyConvert(d) {
  const { file, index, quality, targetW, targetH } = d;
  try {
    let srcW, srcH, imageData;
    if (isHeic(file)) {
      ({ imageData, srcW, srcH } = await decodeHeic(file));
    } else {
      ({ imageData, srcW, srcH } = await decodeStandard(file));
    }
    let outW = srcW, outH = srcH;
    if (targetW && targetH) {
      const scale = Math.min(targetW / srcW, targetH / srcH, 1);
      outW = Math.round(srcW * scale);
      outH = Math.round(srcH * scale);
    } else if (targetW && !targetH) {
      const scale = Math.min(targetW / srcW, 1);
      outW = Math.round(srcW * scale);
      outH = Math.round(srcH * scale);
    }
    const src = new OffscreenCanvas(srcW, srcH);
    src.getContext('2d').putImageData(new ImageData(imageData.data, srcW, srcH), 0, 0);
    const canvas = new OffscreenCanvas(outW, outH);
    canvas.getContext('2d').drawImage(src, 0, 0, outW, outH);
    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: quality / 100 });
    const arrayBuffer = await blob.arrayBuffer();
    self.postMessage({ index, buffer: arrayBuffer, width: outW, height: outH }, [arrayBuffer]);
  } catch (err) {
    self.postMessage({ index, error: err.message });
  }
}

/* ================= message protocol ================= */

// Editor sessions keep the decoded image in worker memory between messages
let editorState = null;

self.onmessage = async function (e) {
  const d = e.data;
  if (!d.cmd) { legacyConvert(d); return; }

  try {
    if (d.cmd === 'oneshot') {
      // Full pipeline in one go with auto (or supplied) params — used by batch convert
      const state = await decodeToState(d.file, d.target);
      const params = { ...AUTO_PARAMS, ...(d.params || {}) };
      const r = renderCanvas(state, params);
      const blob = await r.canvas.convertToBlob({ type: 'image/jpeg', quality: (d.quality || 85) / 100 });
      const buffer = await blob.arrayBuffer();
      self.postMessage({ type: 'oneshot', buffer, width: r.outW, height: r.outH }, [buffer]);
      return;
    }

    if (d.cmd === 'load') {
      // Start an editor session: decode once, report geometry + the "before" preview
      editorState = await decodeToState(d.file, d.target);
      const g = computeGeometry(editorState.srcW, editorState.srcH, editorState.target);
      const auto = autoSharpen(g.outW / g.cw);
      const before = renderCanvas(
        editorState,
        { sharp: 0, bri: 0, con: 0, sat: 0, focusX: 0.5, focusY: 0.5, p3Fix: false },
        d.previewMax || 640
      );
      postImagePayload('loaded', {
        srcW: editorState.srcW,
        srcH: editorState.srcH,
        outW: g.outW,
        outH: g.outH,
        cropAxis: g.cropAxis,
        autoSharpen: auto,
        isHeic: editorState.isHeic,
      }, before.imageData);
      return;
    }

    if (d.cmd === 'preview') {
      if (!editorState) throw new Error('No image loaded');
      const r = renderCanvas(editorState, d.params, d.previewMax || 640);
      if (d.withBefore) {
        // Focus point moved — re-render the unenhanced side with the same crop
        const before = renderCanvas(
          editorState,
          { sharp: 0, bri: 0, con: 0, sat: 0, focusX: d.params.focusX, focusY: d.params.focusY, p3Fix: false },
          d.previewMax || 640
        );
        const bbuf = before.imageData.data.buffer;
        const abuf = r.imageData.data.buffer;
        self.postMessage({
          type: 'preview',
          seq: d.seq,
          image: { buffer: abuf, width: r.imageData.width, height: r.imageData.height },
          before: { buffer: bbuf, width: before.imageData.width, height: before.imageData.height },
        }, [abuf, bbuf]);
      } else {
        postImagePayload('preview', { seq: d.seq }, r.imageData);
      }
      return;
    }

    if (d.cmd === 'export') {
      if (!editorState) throw new Error('No image loaded');
      const r = renderCanvas(editorState, d.params);
      const blob = await r.canvas.convertToBlob({ type: 'image/jpeg', quality: (d.quality || 85) / 100 });
      const buffer = await blob.arrayBuffer();
      self.postMessage({ type: 'export', buffer, width: r.outW, height: r.outH }, [buffer]);
      return;
    }
  } catch (err) {
    self.postMessage({ type: 'error', cmd: d.cmd, error: err.message });
  }
};

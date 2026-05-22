// Web Worker: runs in a background thread so HEIC decoding doesn't block the UI.
// The main thread spawns one worker per file and communicates via postMessage.
self.importScripts('/libheif-bundle.js');

// Reuse the same libheif WASM instance across multiple conversions in one worker lifetime
let libheifInstance = null;

async function getLib() {
  if (!libheifInstance) {
    // libheif() initialises the WASM module — only pay this cost once
    libheifInstance = await libheif();
  }
  return libheifInstance;
}

// Main entry point — called by the main thread with one file per worker
self.onmessage = async function (e) {
  // stripExif is received but not needed — canvas re-encode through raw RGBA pixels
  // inherently discards all EXIF metadata, so stripping happens automatically
  const { file, index, quality, targetW, targetH, stripExif } = e.data; // eslint-disable-line no-unused-vars

  try {
    const lib = await getLib();

    // Read the raw file bytes into a typed array for the HEIC decoder
    const buffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(buffer);

    const decoder = new lib.HeifDecoder();
    const data = decoder.decode(uint8);

    if (!data || data.length === 0) {
      self.postMessage({ index, error: 'Could not decode HEIC file' });
      return;
    }

    // Take the first image in the HEIF container (most files only have one)
    const image = data[0];
    const srcW = image.get_width();
    const srcH = image.get_height();

    // Rasterise the HEIC image into an RGBA pixel buffer
    const imageData = await new Promise((resolve, reject) => {
      image.display(
        { data: new Uint8ClampedArray(srcW * srcH * 4), width: srcW, height: srcH },
        (result) => {
          if (!result) reject(new Error('Display failed'));
          else resolve(result);
        }
      );
    });

    // Compute output dimensions — scale down to fit target, never upscale
    let outW = srcW;
    let outH = srcH;
    if (targetW && targetH) {
      // Both dimensions given: fit inside the bounding box, keeping aspect ratio
      const scale = Math.min(targetW / srcW, targetH / srcH, 1);
      outW = Math.round(srcW * scale);
      outH = Math.round(srcH * scale);
    } else if (targetW && !targetH) {
      // Width-only constraint (e.g. "1920 wide"): scale proportionally
      const scale = Math.min(targetW / srcW, 1);
      outW = Math.round(srcW * scale);
      outH = Math.round(srcH * scale);
    }

    // Draw source at original size first, then scale to output canvas
    // Two-step draw avoids quality loss from direct downscale in some browsers
    const src = new OffscreenCanvas(srcW, srcH);
    src.getContext('2d').putImageData(new ImageData(imageData.data, srcW, srcH), 0, 0);

    const canvas = new OffscreenCanvas(outW, outH);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(src, 0, 0, outW, outH);

    // Encode to JPEG at the requested quality (0–1 range expected by the API)
    const blob = await canvas.convertToBlob({
      type: 'image/jpeg',
      quality: quality / 100,
    });

    // Transfer the ArrayBuffer back to avoid copying — main thread takes ownership
    const arrayBuffer = await blob.arrayBuffer();
    self.postMessage({ index, buffer: arrayBuffer, width: outW, height: outH }, [arrayBuffer]);

  } catch (err) {
    self.postMessage({ index, error: err.message });
  }
};

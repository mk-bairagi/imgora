self.importScripts('/libheif-bundle.js');

let libheifInstance = null;

async function getLib() {
  if (!libheifInstance) {
    libheifInstance = await libheif();
  }
  return libheifInstance;
}

self.onmessage = async function (e) {
  const { file, index, quality, targetW, targetH } = e.data;

  try {
    const lib = await getLib();
    const buffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(buffer);

    const decoder = new lib.HeifDecoder();
    const data = decoder.decode(uint8);

    if (!data || data.length === 0) {
      self.postMessage({ index, error: 'Could not decode HEIC file' });
      return;
    }

    const image = data[0];
    const srcW = image.get_width();
    const srcH = image.get_height();

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
      const scale = Math.min(targetW / srcW, targetH / srcH, 1);
      outW = Math.round(srcW * scale);
      outH = Math.round(srcH * scale);
    } else if (targetW && !targetH) {
      const scale = Math.min(targetW / srcW, 1);
      outW = Math.round(srcW * scale);
      outH = Math.round(srcH * scale);
    }

    // Draw source at original size first, then scale to output canvas
    const src = new OffscreenCanvas(srcW, srcH);
    src.getContext('2d').putImageData(new ImageData(imageData.data, srcW, srcH), 0, 0);

    const canvas = new OffscreenCanvas(outW, outH);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(src, 0, 0, outW, outH);

    const blob = await canvas.convertToBlob({
      type: 'image/jpeg',
      quality: quality / 100,
    });

    const arrayBuffer = await blob.arrayBuffer();
    self.postMessage({ index, buffer: arrayBuffer, width: outW, height: outH }, [arrayBuffer]);

  } catch (err) {
    self.postMessage({ index, error: err.message });
  }
};

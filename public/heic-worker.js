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
  const bitmap = await createImageBitmap(blob);
  const srcW = bitmap.width;
  const srcH = bitmap.height;
  const canvas = new OffscreenCanvas(srcW, srcH);
  const ctx = canvas.getContext('2d');
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

self.onmessage = async function (e) {
  const { file, index, quality, targetW, targetH } = e.data;
  try {
    let srcW, srcH, imageData;
    if (isHeic(file)) {
      ({ imageData, srcW, srcH } = await decodeHeic(file));
    } else {
      ({ imageData, srcW, srcH } = await decodeStandard(file));
    }
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
};

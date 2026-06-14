self.importScripts('/libheif-bundle.js');

const PLATFORM_SETTINGS = {
  instagram:  { maxBytes: 900 * 1024,  startQ: 78 },
  'ig-story': { maxBytes: 900 * 1024,  startQ: 78 },
  whatsapp:   { maxBytes: 900 * 1024,  startQ: 75 },
  'wa-dp':    { maxBytes: 900 * 1024,  startQ: 80 },
  twitter:    { maxBytes: 4000 * 1024, startQ: 85 },
  facebook:   { maxBytes: 900 * 1024,  startQ: 80 },
  linkedin:   { maxBytes: 900 * 1024,  startQ: 80 },
  email:      { maxBytes: 900 * 1024,  startQ: 72 },
  web:        { maxBytes: 450 * 1024,  startQ: 75 },
  custom:     { maxBytes: 9000 * 1024, startQ: 90 },
};

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


async function findBestQuality(canvas, maxBytes, startQ) {
  let blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: startQ / 100 });
  if (blob.size <= maxBytes) {
    let bestBlob = blob, bestQ = startQ;
    for (let q = startQ + 5; q <= 95; q += 5) {
      blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: q / 100 });
      if (blob.size <= maxBytes) { bestBlob = blob; bestQ = q; }
      else break;
    }
    return { blob: bestBlob, quality: bestQ };
  }
  let lo = 40, hi = startQ - 1, bestBlob = null, bestQ = 40;
  while (lo <= hi) {
    const mid = Math.round((lo + hi) / 2);
    blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: mid / 100 });
    if (blob.size <= maxBytes) {
      bestBlob = blob; bestQ = mid; lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  if (!bestBlob) {
    bestBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.4 });
  }
  return { blob: bestBlob, quality: bestQ };
}

self.onmessage = async function (e) {
  const { file, index, quality, targetW, targetH, platform } = e.data;
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
    const srcCtx = src.getContext('2d', { colorSpace: 'srgb' });
    srcCtx.putImageData(new ImageData(imageData.data, srcW, srcH), 0, 0);

    const canvas = new OffscreenCanvas(outW, outH);
    const ctx = canvas.getContext('2d', { colorSpace: 'srgb' });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(src, 0, 0, outW, outH);

    const settings = PLATFORM_SETTINGS[platform] || PLATFORM_SETTINGS.custom;
    const maxBytes = settings.maxBytes;
    const startQ = platform === 'custom' ? quality : settings.startQ;

    const { blob, quality: actualQuality } = await findBestQuality(canvas, maxBytes, startQ);
    const arrayBuffer = await blob.arrayBuffer();
    self.postMessage({ index, buffer: arrayBuffer, width: outW, height: outH, actualQuality }, [arrayBuffer]);
  } catch (err) {
    self.postMessage({ index, error: err.message });
  }
};

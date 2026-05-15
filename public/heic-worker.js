self.importScripts('/libheif-bundle.js');

let libheifInstance = null;

async function getLib() {
  if (!libheifInstance) {
    libheifInstance = await libheif();
  }
  return libheifInstance;
}

self.onmessage = async function (e) {
  const { file, index, quality } = e.data;

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
    const width = image.get_width();
    const height = image.get_height();

    const imageData = await new Promise((resolve, reject) => {
      image.display(
        { data: new Uint8ClampedArray(width * height * 4), width, height },
        (result) => {
          if (!result) reject(new Error('Display failed'));
          else resolve(result);
        }
      );
    });

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(new ImageData(imageData.data, width, height), 0, 0);

    const blob = await canvas.convertToBlob({
      type: 'image/jpeg',
      quality: quality / 100,
    });

    const arrayBuffer = await blob.arrayBuffer();
    self.postMessage({ index, buffer: arrayBuffer, width, height }, [arrayBuffer]);

  } catch (err) {
    self.postMessage({ index, error: err.message });
  }
};
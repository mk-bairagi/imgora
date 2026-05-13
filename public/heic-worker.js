self.importScripts('/libheif-bundle.js');

// libheif-bundle exports an ES module object with a default factory function.
// We must call libheif.default({}) to get the actual API with HeifDecoder.
const heifLib = libheif.default({});

self.onmessage = async function (e) {
  const { file, index, quality } = e.data;

  try {
    const buffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(buffer);

    const decoder = new heifLib.HeifDecoder();
    const data = decoder.decode(uint8);

    if (!data || data.length === 0) {
      self.postMessage({ index, error: 'Could not decode HEIC file' });
      return;
    }

    const image = data[0];
    const width = image.get_width();
    const height = image.get_height();

    const imageData = await new Promise((resolve, reject) => {
      image.display({ data: new Uint8ClampedArray(width * height * 4), width, height }, (result) => {
        if (!result) reject(new Error('Display failed'));
        else resolve(result);
      });
    });

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const imgData = new ImageData(imageData.data, width, height);
    ctx.putImageData(imgData, 0, 0);

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

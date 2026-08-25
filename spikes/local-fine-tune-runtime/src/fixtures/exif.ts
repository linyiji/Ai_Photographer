const ORIENTATION_TAG = 0x0112;

export const injectExifOrientation = (jpeg: Uint8Array, orientation: 1 | 6 | 8): Uint8Array => {
  if (jpeg[0] !== 0xff || jpeg[1] !== 0xd8) throw new Error("Expected JPEG SOI marker");
  const payload = new Uint8Array([
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
    0x4d, 0x4d, 0x00, 0x2a, 0x00, 0x00, 0x00, 0x08,
    0x00, 0x01,
    (ORIENTATION_TAG >> 8) & 0xff, ORIENTATION_TAG & 0xff,
    0x00, 0x03, 0x00, 0x00, 0x00, 0x01,
    0x00, orientation, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
  ]);
  const segmentLength = payload.length + 2;
  const app1 = new Uint8Array(payload.length + 4);
  app1.set([0xff, 0xe1, (segmentLength >> 8) & 0xff, segmentLength & 0xff]); app1.set(payload, 4);
  const output = new Uint8Array(jpeg.length + app1.length);
  output.set(jpeg.subarray(0, 2)); output.set(app1, 2); output.set(jpeg.subarray(2), 2 + app1.length);
  return output;
};

export const readExifOrientation = (jpeg: Uint8Array): number | undefined => {
  for (let index = 2; index + 31 < jpeg.length; index += 1) {
    if (jpeg[index] === 0xff && jpeg[index + 1] === 0xe1 && jpeg[index + 4] === 0x45 && jpeg[index + 5] === 0x78) {
      const little = jpeg[index + 10] === 0x49;
      const tagOffset = index + 20;
      const tag = little ? (jpeg[tagOffset] ?? 0) | ((jpeg[tagOffset + 1] ?? 0) << 8) : ((jpeg[tagOffset] ?? 0) << 8) | (jpeg[tagOffset + 1] ?? 0);
      if (tag !== ORIENTATION_TAG) return undefined;
      return little ? (jpeg[tagOffset + 8] ?? 0) | ((jpeg[tagOffset + 9] ?? 0) << 8) : ((jpeg[tagOffset + 8] ?? 0) << 8) | (jpeg[tagOffset + 9] ?? 0);
    }
  }
  return undefined;
};

export const createAsymmetricExifJpeg = async (orientation: 1 | 6 | 8): Promise<Blob> => {
  const canvas = document.createElement("canvas"); canvas.width = 160; canvas.height = 96;
  const context = canvas.getContext("2d"); if (!context) throw new Error("Canvas2D unavailable for EXIF fixture");
  context.fillStyle = "#17211d"; context.fillRect(0, 0, 160, 96);
  context.fillStyle = "#ff5c62"; context.fillRect(0, 0, 48, 96);
  context.fillStyle = "#67d99b"; context.fillRect(112, 0, 48, 96);
  context.fillStyle = "white"; context.font = "bold 22px sans-serif"; context.fillText("TOP ↑", 52, 30); context.fillText("L", 14, 58); context.fillText("R", 132, 58);
  const base = await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("JPEG fixture encode failed")), "image/jpeg", 0.9));
  const injected = injectExifOrientation(new Uint8Array(await base.arrayBuffer()), orientation);
  const bytes = new Uint8Array(injected.byteLength); bytes.set(injected);
  return new Blob([bytes.buffer], { type: "image/jpeg" });
};

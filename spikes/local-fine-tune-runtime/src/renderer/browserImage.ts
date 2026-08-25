import type { SourceImage } from "../types/model";

export const imageDataToSource = (image: ImageData, assetId: string): SourceImage => ({
  width: image.width,
  height: image.height,
  data: new Uint8ClampedArray(image.data),
  assetId,
});

export const decodeImageFile = async (file: Blob, assetId: string): Promise<SourceImage> => {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Canvas2D unavailable for image decode");
    context.drawImage(bitmap, 0, 0);
    return imageDataToSource(context.getImageData(0, 0, bitmap.width, bitmap.height), assetId);
  } finally {
    bitmap.close();
  }
};

export const downsampleSource = (source: SourceImage, maxLongEdge = 640): SourceImage => {
  const scale = Math.min(1, maxLongEdge / Math.max(source.width, source.height));
  if (scale === 1) return { ...source, data: new Uint8ClampedArray(source.data) };
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));
  const input = document.createElement("canvas");
  input.width = source.width;
  input.height = source.height;
  const inputContext = input.getContext("2d");
  if (!inputContext) throw new Error("Canvas2D unavailable for preview source");
  inputContext.putImageData(new ImageData(source.data, source.width, source.height), 0, 0);
  const output = document.createElement("canvas");
  output.width = width;
  output.height = height;
  const outputContext = output.getContext("2d", { willReadFrequently: true });
  if (!outputContext) throw new Error("Canvas2D unavailable for preview resize");
  outputContext.imageSmoothingEnabled = true;
  outputContext.imageSmoothingQuality = "high";
  outputContext.drawImage(input, 0, 0, width, height);
  return imageDataToSource(outputContext.getImageData(0, 0, width, height), source.assetId);
};

export const drawSource = (canvas: HTMLCanvasElement, source: SourceImage): void => {
  canvas.width = source.width;
  canvas.height = source.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas2D unavailable for preview");
  context.putImageData(new ImageData(source.data, source.width, source.height), 0, 0);
};

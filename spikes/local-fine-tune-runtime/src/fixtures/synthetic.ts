import type { SourceImage } from "../types/model";

export type VisualFixtureCategory =
  | "gradient"
  | "neutral-gray"
  | "skin-like-color-patch"
  | "high-contrast"
  | "fine-texture"
  | "hair-like-lines"
  | "bright-highlights"
  | "dark-shadows"
  | "busy-background"
  | "local-region-boundary";

const byte = (value: number): number => Math.max(0, Math.min(255, Math.round(value)));

export const createSyntheticFixture = (
  category: VisualFixtureCategory,
  width = 96,
  height = 64,
): SourceImage => {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const nx = x / Math.max(1, width - 1);
      const ny = y / Math.max(1, height - 1);
      let r = 128;
      let g = 128;
      let b = 128;
      if (category === "gradient") [r, g, b] = [255 * nx, 255 * ny, 255 * (1 - nx)];
      else if (category === "skin-like-color-patch") [r, g, b] = [205 + 22 * nx, 146 + 18 * ny, 116 + 10 * nx];
      else if (category === "high-contrast") [r, g, b] = (x + y) % 12 < 6 ? [242, 242, 235] : [12, 17, 24];
      else if (category === "fine-texture") [r, g, b] = (x + y) % 2 === 0 ? [188, 202, 211] : [68, 78, 89];
      else if (category === "hair-like-lines") [r, g, b] = x % 7 < 2 ? [28, 22, 18] : [190, 164, 132];
      else if (category === "bright-highlights") [r, g, b] = [220 + 35 * nx, 222 + 30 * ny, 218 + 34 * nx];
      else if (category === "dark-shadows") [r, g, b] = [4 + 35 * nx, 7 + 29 * ny, 10 + 32 * nx];
      else if (category === "busy-background") {
        const wave = Math.sin(nx * 44) * Math.cos(ny * 31);
        [r, g, b] = [105 + 90 * wave, 125 + 75 * Math.sin(nx * 28 + ny * 9), 145 + 70 * Math.cos(ny * 35)];
      } else if (category === "local-region-boundary") [r, g, b] = nx < 0.5 ? [50, 95, 155] : [220, 158, 62];
      const index = (y * width + x) * 4;
      data[index] = byte(r);
      data[index + 1] = byte(g);
      data[index + 2] = byte(b);
      data[index + 3] = 255;
    }
  }
  return { width, height, data, assetId: `synthetic-${category}-${width}x${height}` };
};

export type MaskFixtureName =
  | "full-mask"
  | "empty-mask"
  | "soft-person-like-mask"
  | "background-like-mask"
  | "local-center"
  | "local-edge"
  | "local-corner"
  | "boundary-crossing";

export const createMaskFixture = (name: MaskFixtureName, width: number, height: number): Float32Array => {
  const result = new Float32Array(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const nx = (x + 0.5) / width;
      const ny = (y + 0.5) / height;
      const index = y * width + x;
      if (name === "full-mask") result[index] = 1;
      else if (name === "empty-mask") result[index] = 0;
      else if (name === "soft-person-like-mask") {
        const dx = (nx - 0.5) / 0.24;
        const dy = (ny - 0.5) / 0.43;
        result[index] = Math.max(0, Math.min(1, 1.2 - Math.sqrt(dx * dx + dy * dy)));
      } else if (name === "background-like-mask") {
        const dx = (nx - 0.5) / 0.24;
        const dy = (ny - 0.5) / 0.43;
        result[index] = 1 - Math.max(0, Math.min(1, 1.2 - Math.sqrt(dx * dx + dy * dy)));
      } else if (name === "local-center") result[index] = nx > 0.25 && nx < 0.75 && ny > 0.25 && ny < 0.75 ? 1 : 0;
      else if (name === "local-edge") result[index] = nx < 0.32 && ny > 0.2 && ny < 0.8 ? 1 : 0;
      else if (name === "local-corner") result[index] = nx < 0.35 && ny < 0.35 ? 1 : 0;
      else result[index] = Math.abs(nx - ny) < 0.12 ? 1 : 0;
    }
  }
  return result;
};

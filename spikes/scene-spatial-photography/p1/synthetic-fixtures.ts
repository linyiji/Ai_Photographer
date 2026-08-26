import type { PixelFrame } from './types.js';

export type SyntheticFixtureName = 'clean-balanced' | 'high-clutter' | 'overexposed' | 'underexposed' | 'blurred' | 'center-edge' | 'clean-left' | 'clean-right' | 'uniform-low-detail' | 'moderate-balanced';
const makeFrame = (width: number, height: number, pixel: (x: number, y: number) => [number, number, number]): PixelFrame => {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) { const index = (y * width + x) * 4, [r, g, b] = pixel(x, y); data[index] = r; data[index + 1] = g; data[index + 2] = b; data[index + 3] = 255; }
  return { width, height, data };
};
const W = 96, H = 72;
const noise = (x: number, y: number): number => ((x * 37 + y * 61 + x * y * 13) % 97) / 96;
const stripe = (x: number, period = 8): number => Math.floor(x / period) % 2;

export const syntheticVisualFixtures: Record<SyntheticFixtureName, PixelFrame> = {
  'clean-balanced': makeFrame(W, H, (x, y) => { const value = 118 + Math.round(18 * x / W + 8 * y / H); return [value, value + 2, value - 2]; }),
  'high-clutter': makeFrame(W, H, (x, y) => { const value = Math.round(25 + 220 * (noise(x, y) > 0.48 ? 1 : 0)); return [value, 255 - value, (x * 29 + y * 11) % 256]; }),
  'overexposed': makeFrame(W, H, (x, y) => { const value = (x + y) % 17 === 0 ? 220 : 255; return [value, value, value]; }),
  'underexposed': makeFrame(W, H, (x, y) => { const value = (x + y) % 19 === 0 ? 28 : 0; return [value, value, value]; }),
  'blurred': makeFrame(W, H, (x, y) => { const value = 116 + Math.round(10 * x / W + 5 * y / H); return [value, value, value]; }),
  'center-edge': makeFrame(W, H, (x, y) => { const edge = Math.abs(x - W / 2) < 3 || (y > 14 && y < 58 && Math.abs(x - W / 2 - 9) < 2); const value = edge ? 245 : 105 + Math.round(18 * y / H); return [value, value, value]; }),
  'clean-left': makeFrame(W, H, (x, y) => { const busy = x > W * 0.45; const value = busy ? (stripe(x + y, 3) ? 235 : 25) : 120 + Math.round(12 * y / H); return [value, value, value]; }),
  'clean-right': makeFrame(W, H, (x, y) => { const busy = x < W * 0.55; const value = busy ? (stripe(x + y, 3) ? 235 : 25) : 120 + Math.round(12 * y / H); return [value, value, value]; }),
  'uniform-low-detail': makeFrame(W, H, () => [128, 128, 128]),
  'moderate-balanced': makeFrame(W, H, (x, y) => { const value = 90 + Math.round(55 * noise(Math.floor(x / 4), Math.floor(y / 4))); return [value, value + 3, value - 3]; }),
};

export const clonePixelFrame = (frame: PixelFrame): PixelFrame => ({ width: frame.width, height: frame.height, data: new Uint8ClampedArray(frame.data) });

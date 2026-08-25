import type { AdjustmentParameter } from "../types/model";

export interface SafeRange {
  neutral: number;
  safeMin: number;
  safeMax: number;
  unit: string;
  map(value: number): number;
}

export const clampNormalized = (value: number): number =>
  Number.isFinite(value) ? Math.max(-1, Math.min(1, value)) : 0;

export const SAFE_RANGES: Readonly<Record<"BRIGHTNESS" | "WARMTH" | "SATURATION" | "SOFTNESS" | "BLUR", SafeRange>> = {
  BRIGHTNESS: {
    neutral: 0,
    safeMin: -0.32,
    safeMax: 0.32,
    unit: "exposure-curve exponent stop",
    map: (value) => clampNormalized(value) * 0.32,
  },
  WARMTH: {
    neutral: 0,
    safeMin: -1,
    safeMax: 1,
    unit: "bounded color-balance factor",
    map: clampNormalized,
  },
  SATURATION: {
    neutral: 1,
    safeMin: 0.72,
    safeMax: 1.28,
    unit: "chroma scale",
    map: (value) => 1 + clampNormalized(value) * 0.28,
  },
  SOFTNESS: {
    neutral: 0,
    safeMin: -0.12,
    safeMax: 0.28,
    unit: "detail mix",
    map: (value) => {
      const safe = clampNormalized(value);
      return safe >= 0 ? safe * 0.28 : safe * 0.12;
    },
  },
  BLUR: {
    neutral: 0,
    safeMin: 0,
    safeMax: 0.84,
    unit: "background defocus mix",
    map: (value) => Math.max(0, clampNormalized(value)) * 0.84,
  },
};

export const isImplementedParameter = (
  parameter: AdjustmentParameter,
): parameter is keyof typeof SAFE_RANGES => parameter in SAFE_RANGES;

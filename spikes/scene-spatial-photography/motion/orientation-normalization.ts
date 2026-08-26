import type { ScreenPosture } from './orientation-provider.js';

export const readScreenPosture = (angle?: number): ScreenPosture => {
  const resolved = angle ?? (typeof screen !== 'undefined' ? screen.orientation?.angle : 0) ?? 0;
  const normalized = ((resolved % 360) + 360) % 360;
  if (normalized === 0 || normalized === 180) return 'PORTRAIT_PRIMARY';
  if (normalized === 90 || normalized === 270) return 'LANDSCAPE_PRIMARY';
  return 'UNSUPPORTED';
};

export const normalizeHeadingForScreen = (alpha: number, posture: ScreenPosture, angle = 0): number | null => {
  if (posture === 'UNSUPPORTED') return null;
  // DeviceOrientation alpha is around the device z-axis. Compensating the display
  // rotation keeps physical sweep direction stable when the screen rotates.
  return ((alpha + angle) % 360 + 360) % 360;
};

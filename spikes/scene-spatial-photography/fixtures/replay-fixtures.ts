export interface ReplayPoint { t: number; yaw: number; quality?: 'sharp' | 'blurred' | 'underexposed' | 'overexposed' | 'duplicate'; }
const path = (start: number, end: number, step: number, qualityAt: Record<number, ReplayPoint['quality']> = {}): ReplayPoint[] => { const values: ReplayPoint[] = []; const direction = end >= start ? 1 : -1; let index = 0; for (let yaw = start; direction > 0 ? yaw <= end : yaw >= end; yaw += direction * step) values.push({ t: index++ * 100, yaw, ...(qualityAt[Math.round(yaw)] ? { quality: qualityAt[Math.round(yaw)] } : {}) }); return values; };
export const replayFixtures = {
  steady120: path(0, 120, 6), reverse120: path(0, -120, 6), wide180: path(-90, 90, 6),
  wrapForward: [358, 359, 360, 361, 362].map((yaw, i) => ({ t: i * 100, yaw })), wrapBackward: [2, 1, 0, -1, -2].map((yaw, i) => ({ t: i * 100, yaw })),
  reversal: [...path(0, 70, 7), ...path(63, -50, 7).map((p, i) => ({ ...p, t: 1200 + i * 100 }))], pause: [{ t: 0, yaw: 0 }, { t: 1000, yaw: 0 }, { t: 2000, yaw: 20 }],
  jitter: [0, .2, -.1, .3, 10, 9.8, 20].map((yaw, i) => ({ t: i * 100, yaw })), spike: [0, 10, 20, 170, 30, 40].map((yaw, i) => ({ t: i * 100, yaw })),
  imperfect: path(0, 120, 6, { 24: 'blurred', 48: 'underexposed', 72: 'overexposed' }),
  duplicate: [{ t: 0, yaw: 0 }, { t: 100, yaw: 12 }, { t: 200, yaw: 12 }]
} as const;

import type { SemanticGroupTypeV01 } from './types.js';

export const V4_LANDMARK_GROUP_TYPES=Object.freeze({
  HEAD_CORE:'MULTI_POINT',
  SHOULDERS:'BILATERAL_PAIR',
  HIPS:'BILATERAL_PAIR',
  KNEES:'BILATERAL_PAIR',
  ANKLES:'BILATERAL_PAIR',
} as const satisfies Readonly<Record<'HEAD_CORE'|'SHOULDERS'|'HIPS'|'KNEES'|'ANKLES',SemanticGroupTypeV01>>);

import type { SceneSweepKeyframe } from '../sweep/types.js';
import { P1_RANKING_CONFIG, framingRect } from './config.js';
import type { DescriptorGridCell, KeyframeVisualDescriptor, NormalizedRect, PixelFrame, PlacementAnchor, PlacementClearanceScores } from './types.js';

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));
const round = (value: number): number => Number(value.toFixed(6));
const lumaPlane = (frame: PixelFrame): Float32Array => {
  const out = new Float32Array(frame.width * frame.height);
  for (let pixel = 0, index = 0; pixel < out.length; pixel++, index += 4) out[pixel] = 0.2126 * (frame.data[index] ?? 0) + 0.7152 * (frame.data[index + 1] ?? 0) + 0.0722 * (frame.data[index + 2] ?? 0);
  return out;
};
const regionStats = (luma: Float32Array, width: number, height: number, rect: NormalizedRect): Omit<DescriptorGridCell, 'row' | 'column'> => {
  const x0 = Math.max(0, Math.floor(rect.x * width)), y0 = Math.max(0, Math.floor(rect.y * height));
  const x1 = Math.min(width, Math.max(x0 + 1, Math.ceil((rect.x + rect.width) * width)));
  const y1 = Math.min(height, Math.max(y0 + 1, Math.ceil((rect.y + rect.height) * height)));
  let count = 0, sum = 0, sumSq = 0, shadows = 0, highlights = 0, edgeCount = 0, strongEdges = 0, gradientSum = 0, horizontal = 0, vertical = 0;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const index = y * width + x, value = luma[index] ?? 0; count++; sum += value; sumSq += value * value;
    if (value <= 8) shadows++; if (value >= 247) highlights++;
    if (x > x0 && y > y0) {
      const gx = Math.abs(value - (luma[index - 1] ?? value)), gy = Math.abs(value - (luma[index - width] ?? value));
      gradientSum += gx + gy; horizontal += gx; vertical += gy; edgeCount += 2;
      if (gx >= P1_RANKING_CONFIG.edge_threshold) strongEdges++;
      if (gy >= P1_RANKING_CONFIG.edge_threshold) strongEdges++;
    }
  }
  const safeCount = Math.max(1, count), mean = sum / safeCount, variance = Math.max(0, sumSq / safeCount - mean * mean);
  const contrast = clamp01(Math.sqrt(variance) / 64), edgeDensity = strongEdges / Math.max(1, edgeCount);
  const orientationVariability = gradientSum === 0 ? 0 : 1 - Math.abs(horizontal - vertical) / Math.max(1, horizontal + vertical);
  const highFrequency = clamp01(gradientSum / Math.max(1, edgeCount) / 32);
  return { mean_luma: round(mean), contrast: round(contrast), edge_density: round(edgeDensity), shadow_clip_ratio: round(shadows / safeCount), highlight_clip_ratio: round(highlights / safeCount), clutter: round(clamp01(0.48 * edgeDensity + 0.27 * contrast + 0.15 * orientationVariability + 0.10 * highFrequency)) };
};
const gridFor = (luma: Float32Array, width: number, height: number): DescriptorGridCell[] => {
  const cells: DescriptorGridCell[] = [], size = P1_RANKING_CONFIG.grid_size;
  for (let row = 0; row < size; row++) for (let column = 0; column < size; column++) cells.push({ row, column, ...regionStats(luma, width, height, { x: column / size, y: row / size, width: 1 / size, height: 1 / size }) });
  return cells;
};
const matrix = (cells: DescriptorGridCell[], field: 'mean_luma' | 'contrast' | 'edge_density'): number[][] => Array.from({ length: P1_RANKING_CONFIG.grid_size }, (_, row) => cells.filter((cell) => cell.row === row).map((cell) => cell[field]));
const thirdStats = (luma: Float32Array, width: number, height: number, anchor: PlacementAnchor) => regionStats(luma, width, height, framingRect('ENVIRONMENTAL', anchor));
const clearance = (rect: NormalizedRect): number => clamp01(Math.min(rect.x, rect.y, 1 - rect.x - rect.width, 1 - rect.y - rect.height) / 0.15);

export const describeKeyframe = (keyframe: SceneSweepKeyframe, frame: PixelFrame): KeyframeVisualDescriptor => {
  if (frame.width <= 0 || frame.height <= 0 || frame.data.length < frame.width * frame.height * 4) throw new Error('INVALID_PIXEL_FRAME');
  const luma = lumaPlane(frame), full = regionStats(luma, frame.width, frame.height, { x: 0, y: 0, width: 1, height: 1 }), cells = gridFor(luma, frame.width, frame.height);
  const left = thirdStats(luma, frame.width, frame.height, 'LEFT_THIRD'), center = thirdStats(luma, frame.width, frame.height, 'CENTER'), right = thirdStats(luma, frame.width, frame.height, 'RIGHT_THIRD');
  const exposureBalanced = clamp01(1 - Math.abs(full.mean_luma - 128) / 110 - 1.4 * (full.shadow_clip_ratio + full.highlight_clip_ratio));
  const sharpness = clamp01((full.edge_density * 0.65) + Math.min(1, keyframe.blur_score / 22) * 0.35);
  const quality = P1_RANKING_CONFIG.frame_quality_weights;
  const placement: PlacementClearanceScores = {
    LEFT_THIRD: round(clearance(framingRect('ENVIRONMENTAL', 'LEFT_THIRD')) * (1 - left.clutter)),
    CENTER: round(clearance(framingRect('ENVIRONMENTAL', 'CENTER')) * (1 - center.clutter)),
    RIGHT_THIRD: round(clearance(framingRect('ENVIRONMENTAL', 'RIGHT_THIRD')) * (1 - right.clutter)),
  };
  return {
    descriptor_version: '0.1', keyframe_id: keyframe.keyframe_id, relative_yaw_deg: keyframe.yaw_deg,
    sharpness_score: round(sharpness), exposure: { mean_luma: full.mean_luma, shadow_clip_ratio: full.shadow_clip_ratio, highlight_clip_ratio: full.highlight_clip_ratio, balanced_score: round(exposureBalanced) },
    contrast_score: full.contrast, edge_density: full.edge_density,
    local_edge_density_grid: matrix(cells, 'edge_density'), local_luma_grid: matrix(cells, 'mean_luma'), local_contrast_grid: matrix(cells, 'contrast'), grid: cells,
    visual_clutter_score: full.clutter, center_clutter_score: center.clutter, left_third_clutter_score: left.clutter, right_third_clutter_score: right.clutter,
    placement_clearance_scores: placement,
    photography_frame_quality_score: round(quality.sharpness * sharpness + quality.exposure * exposureBalanced + quality.contrast * (1 - Math.abs(full.contrast - 0.48))),
    quality_confidence: round(clamp01(0.55 + Math.min(0.35, frame.width * frame.height / 90000) - 0.25 * (full.shadow_clip_ratio + full.highlight_clip_ratio))),
  };
};

export const descriptorDistance = (a: KeyframeVisualDescriptor, b: KeyframeVisualDescriptor): number => round(
  0.30 * Math.abs(a.exposure.mean_luma - b.exposure.mean_luma) / 255 +
  0.22 * Math.abs(a.contrast_score - b.contrast_score) +
  0.30 * Math.abs(a.visual_clutter_score - b.visual_clutter_score) +
  0.18 * Math.abs(a.edge_density - b.edge_density)
);

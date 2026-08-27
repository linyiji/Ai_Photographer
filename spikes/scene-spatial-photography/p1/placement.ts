import { framingRect, P1_RANKING_CONFIG } from './config.js';
import type { CompositionAnchorZoneV01, FramingProfile, KeyframeVisualDescriptor, NormalizedRect, PixelFrame, PlacementAnchor } from './types.js';

const anchors: PlacementAnchor[] = ['LEFT_THIRD', 'CENTER', 'RIGHT_THIRD'];
const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));
const round = (value: number): number => Number(value.toFixed(6));
const lumaAt = (frame: PixelFrame, x: number, y: number): number => {
  const index = (y * frame.width + x) * 4;
  return 0.2126 * (frame.data[index] ?? 0) + 0.7152 * (frame.data[index + 1] ?? 0) + 0.0722 * (frame.data[index + 2] ?? 0);
};
const zoneStats = (frame: PixelFrame, rect: NormalizedRect): { clutter: number; exposure: number; edgeConflict: number; } => {
  const x0 = Math.max(0, Math.floor(rect.x * frame.width)), y0 = Math.max(0, Math.floor(rect.y * frame.height));
  const x1 = Math.min(frame.width, Math.ceil((rect.x + rect.width) * frame.width)), y1 = Math.min(frame.height, Math.ceil((rect.y + rect.height) * frame.height));
  let count = 0, sum = 0, clipped = 0, edges = 0, strong = 0, conflict = 0, conflictCount = 0;
  const headBottom = y0 + Math.max(1, Math.floor((y1 - y0) * 0.32));
  const torsoBottom = y0 + Math.max(1, Math.floor((y1 - y0) * 0.72));
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const value = lumaAt(frame, x, y); count++; sum += value; if (value <= 8 || value >= 247) clipped++;
    if (x > x0 && y > y0) {
      const magnitude = Math.abs(value - lumaAt(frame, x - 1, y)) + Math.abs(value - lumaAt(frame, x, y - 1));
      edges++; if (magnitude >= P1_RANKING_CONFIG.edge_threshold * 1.6) strong++;
      if (y <= torsoBottom) { conflictCount++; if (magnitude >= P1_RANKING_CONFIG.edge_threshold * (y <= headBottom ? 1.25 : 1.6)) conflict++; }
    }
  }
  const mean = sum / Math.max(1, count), clipRatio = clipped / Math.max(1, count);
  return { clutter: clamp01(strong / Math.max(1, edges) * 1.7), exposure: clamp01(1 - Math.abs(mean - 128) / 110 - clipRatio * 1.4), edgeConflict: clamp01(conflict / Math.max(1, conflictCount) * 2.2) };
};
const edgeClearance = (rect: NormalizedRect): number => clamp01(Math.min(rect.x, rect.y, 1 - rect.x - rect.width, 1 - rect.y - rect.height) / 0.14);

export const evaluateCompositionAnchorZones = (descriptor: KeyframeVisualDescriptor, frame: PixelFrame, profile: FramingProfile): CompositionAnchorZoneV01[] => anchors.map((anchor) => {
  const rect = framingRect(profile, anchor), stats = zoneStats(frame, rect), clearance = edgeClearance(rect);
  const descriptorClutter = anchor === 'LEFT_THIRD' ? descriptor.left_third_clutter_score : anchor === 'RIGHT_THIRD' ? descriptor.right_third_clutter_score : descriptor.center_clutter_score;
  const clutter = clamp01(0.55 * stats.clutter + 0.45 * descriptorClutter);
  const score = clamp01(0.34 * (1 - clutter) + 0.26 * stats.exposure + 0.18 * clearance + 0.22 * (1 - stats.edgeConflict));
  return { zone_id: `${descriptor.keyframe_id}-${profile.toLowerCase()}-${anchor.toLowerCase()}`, normalized_rect: rect, anchor, framing_profile: profile, clutter_score: round(clutter), exposure_score: round(stats.exposure), clearance_score: round(clearance), edge_conflict_score: round(stats.edgeConflict), placement_score: round(score), confidence: round(clamp01(0.55 + 0.35 * descriptor.quality_confidence)) };
}).sort((a, b) => b.placement_score - a.placement_score || anchors.indexOf(a.anchor) - anchors.indexOf(b.anchor));

/** @deprecated V0.2 canonical name is evaluateCompositionAnchorZones. */
export const evaluatePlacementZones = evaluateCompositionAnchorZones;

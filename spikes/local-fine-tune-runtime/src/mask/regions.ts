import { clampRegion } from "./feather";
import type { SpikeLocalRegionDescriptor } from "../types/model";

export const MAX_LOCAL_REGIONS = 3;

export const createDefaultRegion = (index: number): SpikeLocalRegionDescriptor =>
  clampRegion({
    id: `local-${index + 1}`,
    x: 0.24 + index * 0.08,
    y: 0.22 + index * 0.06,
    width: 0.42,
    height: 0.44,
    feather: 0.22,
  });

export const addRegion = (
  regions: readonly SpikeLocalRegionDescriptor[],
): readonly SpikeLocalRegionDescriptor[] => {
  if (regions.length >= MAX_LOCAL_REGIONS) {
    throw new Error(`最多创建 ${MAX_LOCAL_REGIONS} 个局部区域`);
  }
  const used = new Set(regions.map((region) => region.id));
  const slot = [0, 1, 2].find((candidate) => !used.has(`local-${candidate + 1}`)) ?? regions.length;
  return [...regions, createDefaultRegion(slot)];
};

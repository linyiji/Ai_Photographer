import type { SpikeLocalRegionDescriptor } from "../types/model";

export const clampRegion = (region: SpikeLocalRegionDescriptor): SpikeLocalRegionDescriptor => {
  const width = Math.max(0.04, Math.min(1, region.width));
  const height = Math.max(0.04, Math.min(1, region.height));
  return {
    ...region,
    width,
    height,
    x: Math.max(0, Math.min(1 - width, region.x)),
    y: Math.max(0, Math.min(1 - height, region.y)),
    feather: Math.max(0.04, Math.min(0.45, region.feather)),
  };
};

const smoothstep = (value: number): number => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

export const regionWeightClamped = (
  normalizedX: number,
  normalizedY: number,
  region: SpikeLocalRegionDescriptor,
): number => {
  if (
    normalizedX < region.x ||
    normalizedX > region.x + region.width ||
    normalizedY < region.y ||
    normalizedY > region.y + region.height
  ) {
    return 0;
  }

  const localX = (normalizedX - region.x) / region.width;
  const localY = (normalizedY - region.y) / region.height;
  const edgeDistance = Math.min(localX, 1 - localX, localY, 1 - localY);
  return smoothstep(edgeDistance / region.feather);
};

export const regionWeight = (normalizedX: number, normalizedY: number, descriptor: SpikeLocalRegionDescriptor): number =>
  regionWeightClamped(normalizedX, normalizedY, clampRegion(descriptor));

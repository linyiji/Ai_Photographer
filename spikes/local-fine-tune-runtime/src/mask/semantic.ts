import type {
  MaskLifecycle,
  MaskProvider,
  MaskProviderResult,
  MaskQualityMetrics,
  OptionalMaskSet,
  SemanticMask,
  SemanticMaskKind,
  SemanticMaskSet,
  SourceImage,
} from "../types/model";

const assertDimensions = (width: number, height: number): void => {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
    throw new Error("Mask dimensions must be positive integers");
  }
};

export const normalizeValues = (values: ArrayLike<number>, width: number, height: number): Float32Array => {
  assertDimensions(width, height);
  if (values.length !== width * height) throw new Error("Mask length does not match dimensions");
  const result = new Float32Array(values.length);
  for (let index = 0; index < values.length; index += 1) {
    const value = Number(values[index]);
    if (!Number.isFinite(value)) throw new Error(`Mask contains a non-finite value at ${index}`);
    result[index] = Math.max(0, Math.min(1, value));
  }
  return result;
};

export const resizeMask = (mask: SemanticMask, width: number, height: number): SemanticMask => {
  assertDimensions(width, height);
  if (mask.width === width && mask.height === height) return { ...mask, data: new Float32Array(mask.data) };
  const data = new Float32Array(width * height);
  for (let y = 0; y < height; y += 1) {
    const sy = ((y + 0.5) * mask.height / height) - 0.5;
    const y0 = Math.max(0, Math.min(mask.height - 1, Math.floor(sy)));
    const y1 = Math.min(mask.height - 1, y0 + 1);
    const fy = Math.max(0, sy - y0);
    for (let x = 0; x < width; x += 1) {
      const sx = ((x + 0.5) * mask.width / width) - 0.5;
      const x0 = Math.max(0, Math.min(mask.width - 1, Math.floor(sx)));
      const x1 = Math.min(mask.width - 1, x0 + 1);
      const fx = Math.max(0, sx - x0);
      const top = (mask.data[y0 * mask.width + x0] ?? 0) * (1 - fx) + (mask.data[y0 * mask.width + x1] ?? 0) * fx;
      const bottom = (mask.data[y1 * mask.width + x0] ?? 0) * (1 - fx) + (mask.data[y1 * mask.width + x1] ?? 0) * fx;
      data[y * width + x] = top * (1 - fy) + bottom * fy;
    }
  }
  return { kind: mask.kind, width, height, data };
};

export const refineMask = (mask: SemanticMask, passes = 1): SemanticMask => {
  let data = new Float32Array(mask.data);
  for (let pass = 0; pass < Math.max(0, passes); pass += 1) {
    const next = new Float32Array(data.length);
    for (let y = 0; y < mask.height; y += 1) for (let x = 0; x < mask.width; x += 1) {
      let weighted = (data[y * mask.width + x] ?? 0) * 4;
      let weight = 4;
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
        const nx = x + dx; const ny = y + dy;
        if (nx >= 0 && nx < mask.width && ny >= 0 && ny < mask.height) {
          weighted += data[ny * mask.width + nx] ?? 0; weight += 1;
        }
      }
      next[y * mask.width + x] = weighted / weight;
    }
    data = next;
  }
  return { ...mask, data };
};

export const complementMask = (mask: SemanticMask, kind: SemanticMaskKind): SemanticMask => ({
  kind, width: mask.width, height: mask.height, data: Float32Array.from(mask.data, (value) => 1 - value),
});

export const createMaskSet = (
  source: SourceImage,
  personValues: ArrayLike<number>,
  providerId: string,
  providerVersion: string,
): SemanticMaskSet => {
  const person: SemanticMask = { kind: "PERSON", width: source.width, height: source.height, data: normalizeValues(personValues, source.width, source.height) };
  return {
    sourceAssetId: source.assetId, sourceWidth: source.width, sourceHeight: source.height,
    coordinateSpace: "DECODED_UPRIGHT_SOURCE", providerId, providerVersion,
    createdAt: "1970-01-01T00:00:00.000Z",
    masks: { PERSON: person, BACKGROUND: complementMask(person, "BACKGROUND") },
  };
};

export const toRendererMasks = (set: SemanticMaskSet | undefined, width: number, height: number): OptionalMaskSet | undefined => {
  if (!set) return undefined;
  return {
    person: resizeMask(set.masks.PERSON, width, height).data,
    background: resizeMask(set.masks.BACKGROUND, width, height).data,
  };
};

export const maskIoU = (actual: SemanticMask, expected: SemanticMask, threshold = 0.5): number => {
  if (actual.width !== expected.width || actual.height !== expected.height) throw new Error("IoU dimensions differ");
  let intersection = 0; let union = 0;
  for (let index = 0; index < actual.data.length; index += 1) {
    const a = (actual.data[index] ?? 0) >= threshold; const b = (expected.data[index] ?? 0) >= threshold;
    if (a && b) intersection += 1; if (a || b) union += 1;
  }
  return union === 0 ? 1 : intersection / union;
};

export const measureMaskQuality = (actual: SemanticMask, expected: SemanticMask): MaskQualityMetrics => {
  const iou = maskIoU(actual, expected);
  let leakage = 0; let outside = 0; let boundaryError = 0; let boundaryCount = 0;
  for (let y = 0; y < actual.height; y += 1) for (let x = 0; x < actual.width; x += 1) {
    const index = y * actual.width + x; const target = expected.data[index] ?? 0; const value = actual.data[index] ?? 0;
    if (target < 0.5) { leakage += value; outside += 1; }
    const right = x + 1 < actual.width ? expected.data[index + 1] ?? target : target;
    const down = y + 1 < actual.height ? expected.data[index + actual.width] ?? target : target;
    if ((target >= 0.5) !== (right >= 0.5) || (target >= 0.5) !== (down >= 0.5)) {
      boundaryError += Math.abs(value - target); boundaryCount += 1;
    }
  }
  return { iou, leakage: outside ? leakage / outside : 0, boundaryError: boundaryCount ? boundaryError / boundaryCount : 0 };
};

export class FixtureMaskProvider implements MaskProvider {
  readonly id = "fixture-semantic-mask"; readonly version = "1.0.0";
  async create(source: SourceImage): Promise<SemanticMaskSet> {
    const values = new Float32Array(source.width * source.height);
    for (let y = 0; y < source.height; y += 1) for (let x = 0; x < source.width; x += 1) {
      const nx = (x + 0.5) / source.width; const ny = (y + 0.5) / source.height;
      const head = ((nx - 0.5) / 0.10) ** 2 + ((ny - 0.27) / 0.15) ** 2;
      const body = ((nx - 0.5) / 0.23) ** 2 + ((ny - 0.68) / 0.40) ** 2;
      const distance = Math.min(head, body);
      values[y * source.width + x] = Math.max(0, Math.min(1, 1.4 - distance * 0.7));
    }
    return createMaskSet(source, values, this.id, this.version);
  }
}

export class ExternalMaskSetProvider implements MaskProvider {
  readonly id = "external-mask-set"; readonly version = "1.0.0";
  constructor(private readonly resolve: (source: SourceImage) => Promise<ArrayLike<number>> | ArrayLike<number>) {}
  async create(source: SourceImage): Promise<SemanticMaskSet> {
    return createMaskSet(source, await this.resolve(source), this.id, this.version);
  }
}

export class MaskRuntime {
  lifecycle: MaskLifecycle = "NOT_REQUESTED";
  error?: string;
  inferenceCount = 0;
  private readonly cache = new Map<string, SemanticMaskSet>();
  constructor(private readonly provider?: MaskProvider) { if (!provider) this.lifecycle = "UNAVAILABLE"; }
  async request(source: SourceImage, options: Readonly<Record<string, unknown>> = {}): Promise<MaskProviderResult | undefined> {
    if (!this.provider) { this.lifecycle = "UNAVAILABLE"; return undefined; }
    const key = JSON.stringify([source.assetId, source.width, source.height, this.provider.id, this.provider.version, options]);
    const cached = this.cache.get(key);
    if (cached) { this.lifecycle = "READY"; return { masks: cached, cacheHit: true, inferenceMs: 0 }; }
    this.lifecycle = "LOADING"; const started = performance.now();
    try {
      const masks = await this.provider.create(source, options); this.inferenceCount += 1;
      if (masks.sourceAssetId !== source.assetId || masks.sourceWidth !== source.width || masks.sourceHeight !== source.height) throw new Error("Provider returned mismatched source identity");
      this.cache.set(key, masks); this.lifecycle = "READY"; this.error = undefined;
      return { masks, cacheHit: false, inferenceMs: performance.now() - started };
    } catch (error) { this.lifecycle = "ERROR"; this.error = (error as Error).message; return undefined; }
  }
  invalidate(sourceAssetId?: string): void {
    if (!sourceAssetId) this.cache.clear(); else for (const [key, value] of this.cache) if (value.sourceAssetId === sourceAssetId) this.cache.delete(key);
    this.lifecycle = this.provider ? "NOT_REQUESTED" : "UNAVAILABLE";
  }
}

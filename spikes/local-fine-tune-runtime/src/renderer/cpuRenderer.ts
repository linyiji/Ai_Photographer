import { clampRegion, regionWeightClamped } from "../mask/feather";
import { SAFE_RANGES, clampNormalized, isImplementedParameter } from "./safeRanges";
import type {
  Adjustment,
  AdjustmentRecipe,
  FinalRenderResult,
  FineTuneRenderer,
  OptionalMaskSet,
  RenderOptions,
  RenderResult,
  SourceImage,
} from "../types/model";

const clampByte = (value: number): number =>
  Number.isFinite(value) ? Math.max(0, Math.min(255, Math.round(value))) : 0;

const smoothBrightness = (channel: number, stops: number): number => {
  const normalized = Math.max(0, Math.min(1, channel / 255));
  return (1 - Math.pow(1 - normalized, Math.pow(2, stops))) * 255;
};

const createSeparableBoxBlur = (
  input: Uint8ClampedArray<ArrayBuffer>,
  width: number,
  height: number,
): Uint8ClampedArray<ArrayBuffer> => {
  const horizontal = new Uint8ClampedArray(input.length);
  const output = new Uint8ClampedArray(input.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const left = (y * width + Math.max(0, x - 1)) * 4;
      const right = (y * width + Math.min(width - 1, x + 1)) * 4;
      for (let channel = 0; channel < 3; channel += 1) {
        horizontal[index + channel] = ((input[left + channel] ?? 0) + (input[index + channel] ?? 0) + (input[right + channel] ?? 0)) / 3;
      }
      horizontal[index + 3] = input[index + 3] ?? 255;
    }
  }
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const above = (Math.max(0, y - 1) * width + x) * 4;
      const below = (Math.min(height - 1, y + 1) * width + x) * 4;
      for (let channel = 0; channel < 3; channel += 1) {
        output[index + channel] = ((horizontal[above + channel] ?? 0) + (horizontal[index + channel] ?? 0) + (horizontal[below + channel] ?? 0)) / 3;
      }
      output[index + 3] = input[index + 3] ?? 255;
    }
  }
  return output;
};

const createMaskedBackgroundBlur = (
  input: Uint8ClampedArray<ArrayBuffer>,
  mask: Float32Array,
  width: number,
  height: number,
): Uint8ClampedArray<ArrayBuffer> => {
  const horizontal = new Uint8ClampedArray(input.length);
  const output = new Uint8ClampedArray(input.length);
  const radius = Math.max(2, Math.min(48, Math.round(Math.min(width, height) * 0.008)));

  for (let y = 0; y < height; y += 1) {
    const sums: [number, number, number, number] = [0, 0, 0, 0];
    const add = (x: number, direction: 1 | -1): void => {
      const pixel = y * width + x;
      const index = pixel * 4;
      const weight = Math.max(0, Math.min(1, mask[pixel] ?? 0));
      sums[0] += direction * (input[index] ?? 0) * weight;
      sums[1] += direction * (input[index + 1] ?? 0) * weight;
      sums[2] += direction * (input[index + 2] ?? 0) * weight;
      sums[3] += direction * weight * 255;
    };
    for (let x = 0; x <= Math.min(width - 1, radius); x += 1) add(x, 1);
    for (let x = 0; x < width; x += 1) {
      if (x > 0) {
        const removeX = x - radius - 1;
        const addX = x + radius;
        if (removeX >= 0) add(removeX, -1);
        if (addX < width) add(addX, 1);
      }
      const count = Math.min(width - 1, x + radius) - Math.max(0, x - radius) + 1;
      const index = (y * width + x) * 4;
      horizontal[index] = sums[0] / count;
      horizontal[index + 1] = sums[1] / count;
      horizontal[index + 2] = sums[2] / count;
      horizontal[index + 3] = sums[3] / count;
    }
  }

  for (let x = 0; x < width; x += 1) {
    const sums: [number, number, number, number] = [0, 0, 0, 0];
    const add = (y: number, direction: 1 | -1): void => {
      const index = (y * width + x) * 4;
      sums[0] += direction * (horizontal[index] ?? 0);
      sums[1] += direction * (horizontal[index + 1] ?? 0);
      sums[2] += direction * (horizontal[index + 2] ?? 0);
      sums[3] += direction * (horizontal[index + 3] ?? 0);
    };
    for (let y = 0; y <= Math.min(height - 1, radius); y += 1) add(y, 1);
    for (let y = 0; y < height; y += 1) {
      if (y > 0) {
        const removeY = y - radius - 1;
        const addY = y + radius;
        if (removeY >= 0) add(removeY, -1);
        if (addY < height) add(addY, 1);
      }
      const count = Math.min(height - 1, y + radius) - Math.max(0, y - radius) + 1;
      const index = (y * width + x) * 4;
      const alpha = sums[3] / count;
      if (alpha > 0.5) {
        output[index] = (sums[0] / count) * 255 / alpha;
        output[index + 1] = (sums[1] / count) * 255 / alpha;
        output[index + 2] = (sums[2] / count) * 255 / alpha;
      } else {
        output[index] = input[index] ?? 0;
        output[index + 1] = input[index + 1] ?? 0;
        output[index + 2] = input[index + 2] ?? 0;
      }
      output[index + 3] = input[index + 3] ?? 255;
    }
  }
  return output;
};

const validateAdjustments = (recipe: AdjustmentRecipe): Adjustment[] =>
  recipe.adjustments.map((adjustment) => {
    if (!isImplementedParameter(adjustment.parameter)) {
      throw new Error(`${adjustment.parameter} is deferred in the Local Fine Tune track`);
    }
    if (adjustment.parameter === "BLUR" && adjustment.scope !== "BACKGROUND") {
      throw new Error("BLUR is admitted only for BACKGROUND scope");
    }
    return adjustment.scope === "LOCAL_REGION" && adjustment.region
      ? { ...adjustment, region: clampRegion(adjustment.region) }
      : adjustment;
  });

type ParameterValues = [brightness: number, warmth: number, saturation: number, softness: number, blur: number];
interface LocalValues { region: NonNullable<Adjustment["region"]>; values: ParameterValues }

const emptyValues = (): ParameterValues => [0, 0, 0, 0, 0];
const parameterIndex = (parameter: Adjustment["parameter"]): 0 | 1 | 2 | 3 | 4 =>
  parameter === "BRIGHTNESS" ? 0
    : parameter === "WARMTH" ? 1
      : parameter === "SATURATION" ? 2
        : parameter === "SOFTNESS" ? 3 : 4;

const compileAdjustments = (adjustments: readonly Adjustment[]): {
  all: ParameterValues;
  person: ParameterValues;
  background: ParameterValues;
  local: LocalValues[];
} => {
  const all = emptyValues(); const person = emptyValues(); const background = emptyValues();
  const localById = new Map<string, LocalValues>();
  for (const adjustment of adjustments) {
    const index = parameterIndex(adjustment.parameter);
    if (adjustment.scope === "ALL") all[index] = all[index] + adjustment.value;
    else if (adjustment.scope === "PERSON") person[index] = person[index] + adjustment.value;
    else if (adjustment.scope === "BACKGROUND") background[index] = background[index] + adjustment.value;
    else if (adjustment.region) {
      let entry = localById.get(adjustment.region.id);
      if (!entry) { entry = { region: adjustment.region, values: emptyValues() }; localById.set(adjustment.region.id, entry); }
      entry.values[index] = entry.values[index] + adjustment.value;
    }
  }
  return { all, person, background, local: [...localById.values()] };
};

/**
 * Canonical order is BRIGHTNESS → WARMTH → SATURATION → SOFTNESS → BACKGROUND BLUR.
 * Same-parameter values are additively composed per pixel and clamped.
 * Recipe array order is intentionally not semantic authority.
 */
export class Canvas2DFineTuneRenderer implements FineTuneRenderer {
  private readonly blurCache = new WeakMap<SourceImage, Uint8ClampedArray<ArrayBuffer>>();
  blurComputations = 0;

  private blurredSource(source: SourceImage): Uint8ClampedArray<ArrayBuffer> {
    const cached = this.blurCache.get(source);
    if (cached) return cached;
    const blurred = createSeparableBoxBlur(source.data, source.width, source.height);
    this.blurCache.set(source, blurred); this.blurComputations += 1;
    return blurred;
  }

  render(
    source: SourceImage,
    recipe: AdjustmentRecipe,
    masks: OptionalMaskSet | undefined,
    _options: RenderOptions,
  ): RenderResult {
    const started = performance.now();
    const adjustments = validateAdjustments(recipe);
    const compiled = compileAdjustments(adjustments);
    const output = new Uint8ClampedArray(source.data.length);
    const needsSoftness = adjustments.some((adjustment) => adjustment.parameter === "SOFTNESS" && adjustment.value !== 0);
    const blurred = needsSoftness ? this.blurredSource(source) : source.data;

    for (let y = 0; y < source.height; y += 1) {
      for (let x = 0; x < source.width; x += 1) {
        const index = (y * source.width + x) * 4;
        const personWeight = masks?.person?.[y * source.width + x] ?? 0;
        const backgroundWeight = masks?.background?.[y * source.width + x] ?? 0;
        let brightness = compiled.all[0] + compiled.person[0] * personWeight + compiled.background[0] * backgroundWeight;
        let warmth = compiled.all[1] + compiled.person[1] * personWeight + compiled.background[1] * backgroundWeight;
        let saturation = compiled.all[2] + compiled.person[2] * personWeight + compiled.background[2] * backgroundWeight;
        let softness = compiled.all[3] + compiled.person[3] * personWeight + compiled.background[3] * backgroundWeight;
        if (compiled.local.length) {
          const nx = (x + 0.5) / source.width; const ny = (y + 0.5) / source.height;
          for (const local of compiled.local) {
            const weight = regionWeightClamped(nx, ny, local.region);
            brightness += local.values[0] * weight; warmth += local.values[1] * weight;
            saturation += local.values[2] * weight; softness += local.values[3] * weight;
          }
        }
        let r = source.data[index] ?? 0;
        let g = source.data[index + 1] ?? 0;
        let b = source.data[index + 2] ?? 0;

        const stops = SAFE_RANGES.BRIGHTNESS.map(clampNormalized(brightness));
        if (stops !== 0) {
          r = smoothBrightness(r, stops);
          g = smoothBrightness(g, stops);
          b = smoothBrightness(b, stops);
        }

        const warmthFactor = SAFE_RANGES.WARMTH.map(clampNormalized(warmth));
        r += warmthFactor * 14;
        g += warmthFactor * 2;
        b -= warmthFactor * 16;

        const saturationScale = SAFE_RANGES.SATURATION.map(clampNormalized(saturation));
        if (saturationScale !== 1) {
          const luma = r * 0.2126 + g * 0.7152 + b * 0.0722;
          r = luma + (r - luma) * saturationScale;
          g = luma + (g - luma) * saturationScale;
          b = luma + (b - luma) * saturationScale;
        }

        const softnessMix = SAFE_RANGES.SOFTNESS.map(clampNormalized(softness));
        if (softnessMix !== 0) {
          const blurR = blurred[index] ?? r;
          const blurG = blurred[index + 1] ?? g;
          const blurB = blurred[index + 2] ?? b;
          const factor = Math.abs(softnessMix);
          if (softnessMix > 0) {
            r += (blurR - r) * factor;
            g += (blurG - g) * factor;
            b += (blurB - b) * factor;
          } else {
            r += (r - blurR) * factor;
            g += (g - blurG) * factor;
            b += (b - blurB) * factor;
          }
        }

        output[index] = clampByte(r);
        output[index + 1] = clampByte(g);
        output[index + 2] = clampByte(b);
        output[index + 3] = source.data[index + 3] ?? 255;
      }
    }

    const blurMix = SAFE_RANGES.BLUR.map(clampNormalized(compiled.background[4]));
    const backgroundMask = masks?.background;
    if (blurMix > 0 && backgroundMask?.length === source.width * source.height) {
      const backgroundBlur = createMaskedBackgroundBlur(output, backgroundMask, source.width, source.height);
      for (let pixel = 0; pixel < source.width * source.height; pixel += 1) {
        const factor = blurMix * Math.max(0, Math.min(1, backgroundMask[pixel] ?? 0));
        if (factor <= 0) continue;
        const index = pixel * 4;
        output[index] = clampByte((output[index] ?? 0) + ((backgroundBlur[index] ?? 0) - (output[index] ?? 0)) * factor);
        output[index + 1] = clampByte((output[index + 1] ?? 0) + ((backgroundBlur[index + 1] ?? 0) - (output[index + 1] ?? 0)) * factor);
        output[index + 2] = clampByte((output[index + 2] ?? 0) + ((backgroundBlur[index + 2] ?? 0) - (output[index + 2] ?? 0)) * factor);
      }
    }

    return {
      width: source.width,
      height: source.height,
      data: output,
      assetId: source.assetId,
      renderMs: performance.now() - started,
      backend: "CANVAS2D_IMAGE_DATA",
    };
  }

  async exportJpeg(source: SourceImage, recipe: AdjustmentRecipe, masks?: OptionalMaskSet, quality = 0.92): Promise<FinalRenderResult> {
    const rendered = this.render(source, recipe, masks, { mode: "final" });
    const canvas = document.createElement("canvas");
    canvas.width = rendered.width;
    canvas.height = rendered.height;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Canvas2D unavailable for JPEG export");
    context.putImageData(new ImageData(rendered.data, rendered.width, rendered.height), 0, 0);
    const encodeStarted = performance.now();
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (candidate) => (candidate ? resolve(candidate) : reject(new Error("JPEG encoding failed"))),
        "image/jpeg",
        Math.max(0.5, Math.min(1, quality)),
      ),
    );
    return {
      ...rendered,
      blob,
      mime: "image/jpeg",
      byteSize: blob.size,
      encodeMs: performance.now() - encodeStarted,
    };
  }
}

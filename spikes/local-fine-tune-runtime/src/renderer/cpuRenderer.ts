import { regionWeight } from "../mask/feather";
import { SAFE_RANGES, clampNormalized, isP0Parameter } from "./safeRanges";
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

const scopeWeight = (
  adjustment: Adjustment,
  x: number,
  y: number,
  width: number,
  height: number,
  masks?: OptionalMaskSet,
): number => {
  if (adjustment.scope === "ALL") return 1;
  if (adjustment.scope === "LOCAL_REGION") {
    return adjustment.region
      ? regionWeight((x + 0.5) / width, (y + 0.5) / height, adjustment.region)
      : 0;
  }
  const index = y * width + x;
  if (adjustment.scope === "PERSON") return masks?.person?.[index] ?? 0;
  if (adjustment.scope === "BACKGROUND") return masks?.background?.[index] ?? 0;
  return 0;
};

const validateAdjustments = (recipe: AdjustmentRecipe): Adjustment[] =>
  recipe.adjustments.map((adjustment) => {
    if (!isP0Parameter(adjustment.parameter)) {
      throw new Error(`${adjustment.parameter} is deferred in FT-P0`);
    }
    return adjustment;
  });

/**
 * Canonical order is BRIGHTNESS → WARMTH → SATURATION → SOFTNESS.
 * Same-parameter values are additively composed per pixel and clamped.
 * Recipe array order is intentionally not semantic authority.
 */
export class Canvas2DFineTuneRenderer implements FineTuneRenderer {
  render(
    source: SourceImage,
    recipe: AdjustmentRecipe,
    masks: OptionalMaskSet | undefined,
    _options: RenderOptions,
  ): RenderResult {
    const started = performance.now();
    const adjustments = validateAdjustments(recipe);
    const output = new Uint8ClampedArray(source.data.length);
    const needsSoftness = adjustments.some((adjustment) => adjustment.parameter === "SOFTNESS" && adjustment.value !== 0);
    const blurred = needsSoftness ? createSeparableBoxBlur(source.data, source.width, source.height) : source.data;

    for (let y = 0; y < source.height; y += 1) {
      for (let x = 0; x < source.width; x += 1) {
        let brightness = 0;
        let warmth = 0;
        let saturation = 0;
        let softness = 0;
        for (const adjustment of adjustments) {
          const contribution = adjustment.value * scopeWeight(adjustment, x, y, source.width, source.height, masks);
          if (adjustment.parameter === "BRIGHTNESS") brightness += contribution;
          else if (adjustment.parameter === "WARMTH") warmth += contribution;
          else if (adjustment.parameter === "SATURATION") saturation += contribution;
          else if (adjustment.parameter === "SOFTNESS") softness += contribution;
        }

        const index = (y * source.width + x) * 4;
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

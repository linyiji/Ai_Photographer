import { describe, expect, it } from "vitest";
import { createSyntheticFixture } from "../src/fixtures/synthetic";
import { createMaskFixture } from "../src/mask/fixtures";
import { createRecipe, setAdjustment } from "../src/recipe/recipe";
import { Canvas2DFineTuneRenderer } from "../src/renderer/cpuRenderer";
import { SAFE_RANGES } from "../src/renderer/safeRanges";
import type { AdjustmentRecipe, SourceImage } from "../src/types/model";

const neutral = () => createRecipe({ recipe_id: "blur", created_at: "2026-08-25T00:00:00.000Z" });
const blurRecipe = (value = 1): AdjustmentRecipe => setAdjustment(neutral(), "BACKGROUND", "BLUR", value);
const render = (source: SourceImage, recipe: AdjustmentRecipe, background?: Float32Array) =>
  new Canvas2DFineTuneRenderer().render(source, recipe, background ? { background } : undefined, { mode: "preview" });
const rgbAt = (source: SourceImage, x: number, y: number): readonly number[] => {
  const index = (y * source.width + x) * 4;
  return [source.data[index] ?? 0, source.data[index + 1] ?? 0, source.data[index + 2] ?? 0];
};
const detailEnergy = (source: SourceImage): number => {
  let total = 0;
  for (let y = 0; y < source.height; y += 1) for (let x = 1; x < source.width; x += 1) {
    const current = rgbAt(source, x, y); const prior = rgbAt(source, x - 1, y);
    total += Math.abs((current[0] ?? 0) - (prior[0] ?? 0));
  }
  return total;
};

describe("admitted BACKGROUND BLUR", () => {
  it("has a neutral no-op and bounded positive safe range", () => {
    expect(SAFE_RANGES.BLUR.map(-1)).toBe(0);
    expect(SAFE_RANGES.BLUR.map(0)).toBe(0);
    expect(SAFE_RANGES.BLUR.map(1)).toBe(0.84);
  });

  it("is a no-op when the background mask is unavailable", () => {
    const source = createSyntheticFixture("fine-texture", 48, 32);
    expect(render(source, blurRecipe()).data).toEqual(source.data);
  });

  it("is a controlled no-op for a dimensionally invalid mask", () => {
    const source = createSyntheticFixture("fine-texture", 48, 32);
    expect(render(source, blurRecipe(), new Float32Array(3)).data).toEqual(source.data);
  });

  it("is a no-op for an empty background mask", () => {
    const source = createSyntheticFixture("fine-texture", 48, 32);
    expect(render(source, blurRecipe(), createMaskFixture("empty-mask", 48, 32)).data).toEqual(source.data);
  });

  it("reduces high-frequency background detail", () => {
    const source = createSyntheticFixture("fine-texture", 64, 40);
    const result = render(source, blurRecipe(), createMaskFixture("full-mask", 64, 40));
    expect(detailEnergy(result)).toBeLessThan(detailEnergy(source) * 0.5);
  });

  it("leaves binary foreground pixels byte-exact", () => {
    const source = createSyntheticFixture("busy-background", 64, 48);
    const mask = createMaskFixture("background-like-mask", 64, 48);
    const result = render(source, blurRecipe(), mask);
    for (let pixel = 0; pixel < mask.length; pixel += 1) {
      if ((mask[pixel] ?? 0) !== 0) continue;
      const index = pixel * 4;
      expect(result.data.slice(index, index + 4)).toEqual(source.data.slice(index, index + 4));
    }
  });

  it("does not bleed foreground red into a blue background", () => {
    const width = 40; const height = 24;
    const source = createSyntheticFixture("neutral-gray", width, height);
    const mask = new Float32Array(width * height);
    for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const background = x >= width / 2;
      source.data[index] = background ? 0 : 255;
      source.data[index + 1] = 0;
      source.data[index + 2] = background ? 255 : 0;
      mask[y * width + x] = background ? 1 : 0;
    }
    const result = render(source, blurRecipe(), mask);
    expect(rgbAt(result, width / 2, height / 2)[0]).toBe(0);
    expect(rgbAt(result, width / 2, height / 2)[2]).toBe(255);
  });

  it("is bit deterministic", () => {
    const source = createSyntheticFixture("busy-background", 53, 37);
    const mask = createMaskFixture("background-like-mask", 53, 37);
    expect(render(source, blurRecipe(0.73), mask).data).toEqual(render(source, blurRecipe(0.73), mask).data);
  });

  it("preserves source bytes, dimensions, alpha and identity", () => {
    const source = createSyntheticFixture("busy-background", 37, 23);
    source.data[3] = 121;
    const before = new Uint8ClampedArray(source.data);
    const result = render(source, blurRecipe(), createMaskFixture("full-mask", 37, 23));
    expect(source.data).toEqual(before);
    expect([result.width, result.height, result.assetId]).toEqual([37, 23, source.assetId]);
    expect(result.data[3]).toBe(121);
  });

  it("composes after canonical color adjustments", () => {
    const source = createSyntheticFixture("busy-background", 48, 32);
    const mask = createMaskFixture("full-mask", 48, 32);
    let recipe = setAdjustment(neutral(), "ALL", "WARMTH", 0.5);
    recipe = setAdjustment(recipe, "BACKGROUND", "BLUR", 0.7);
    const combined = render(source, recipe, mask);
    const blurOnly = render(source, blurRecipe(0.7), mask);
    expect(combined.data).not.toEqual(blurOnly.data);
    expect((rgbAt(combined, 20, 16)[0] ?? 0) - (rgbAt(combined, 20, 16)[2] ?? 0))
      .toBeGreaterThan((rgbAt(blurOnly, 20, 16)[0] ?? 0) - (rgbAt(blurOnly, 20, 16)[2] ?? 0));
  });

  it("responds monotonically to blur mix", () => {
    const source = createSyntheticFixture("fine-texture", 64, 40);
    const mask = createMaskFixture("full-mask", 64, 40);
    const low = render(source, blurRecipe(0.25), mask);
    const high = render(source, blurRecipe(1), mask);
    expect(detailEnergy(high)).toBeLessThan(detailEnergy(low));
  });

  it("keeps preview work bounded on the synthetic gate", () => {
    const source = createSyntheticFixture("busy-background", 512, 288);
    const mask = createMaskFixture("background-like-mask", 512, 288);
    const result = render(source, blurRecipe(), mask);
    expect(result.renderMs).toBeLessThan(2_000);
  });

  it("rejects schema-valid but unsupported loaded scope at render time", () => {
    const source = createSyntheticFixture("neutral-gray", 8, 8);
    const recipe = neutral();
    recipe.adjustments.push({ scope: "PERSON", parameter: "BLUR", value: 0.5 });
    expect(() => render(source, recipe, createMaskFixture("full-mask", 8, 8))).toThrow("only for BACKGROUND");
  });
});

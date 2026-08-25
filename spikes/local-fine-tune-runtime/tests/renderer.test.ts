import { describe, expect, it } from "vitest";
import { createSyntheticFixture } from "../src/fixtures/synthetic";
import { createMaskFixture } from "../src/mask/fixtures";
import { createDefaultRegion } from "../src/mask/regions";
import { regionWeight } from "../src/mask/feather";
import { createRecipe, setAdjustment } from "../src/recipe/recipe";
import { Canvas2DFineTuneRenderer } from "../src/renderer/cpuRenderer";
import { SAFE_RANGES, clampNormalized } from "../src/renderer/safeRanges";
import type { AdjustmentRecipe, SourceImage } from "../src/types/model";

const renderer = new Canvas2DFineTuneRenderer();
const neutral = () => createRecipe({ recipe_id: "render", created_at: "2026-08-25T00:00:00.000Z" });
const render = (source: SourceImage, recipe: AdjustmentRecipe) => renderer.render(source, recipe, undefined, { mode: "preview" });
const rgbAt = (source: SourceImage, x: number, y: number) => {
  const index = (y * source.width + x) * 4;
  return [source.data[index], source.data[index + 1], source.data[index + 2]] as const;
};
const detailEnergy = (source: SourceImage): number => {
  let total = 0;
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 1; x < source.width; x += 1) {
      const current = rgbAt(source, x, y);
      const prior = rgbAt(source, x - 1, y);
      total += Math.abs((current[0] ?? 0) - (prior[0] ?? 0));
    }
  }
  return total;
};

describe("safe parameter mapping", () => {
  it.each([-Infinity, -8, -1, 0, 1, 8, Infinity, Number.NaN])("clamps unsafe normalized value %s", (value) => {
    expect(clampNormalized(value)).toBeGreaterThanOrEqual(-1);
    expect(clampNormalized(value)).toBeLessThanOrEqual(1);
    expect(Number.isFinite(clampNormalized(value))).toBe(true);
  });

  it("keeps explicit neutral points", () => {
    expect(SAFE_RANGES.BRIGHTNESS.map(0)).toBe(0);
    expect(SAFE_RANGES.WARMTH.map(0)).toBe(0);
    expect(SAFE_RANGES.SATURATION.map(0)).toBe(1);
    expect(SAFE_RANGES.SOFTNESS.map(0)).toBe(0);
  });
});

describe("deterministic P0 renderer math", () => {
  it("BRIGHTNESS raises midtones without clipping all highlights", () => {
    const source = createSyntheticFixture("gradient", 32, 16);
    const result = render(source, setAdjustment(neutral(), "ALL", "BRIGHTNESS", 1));
    expect(rgbAt(result, 15, 8)[0]).toBeGreaterThan(rgbAt(source, 15, 8)[0] ?? 0);
    expect(rgbAt(result, 28, 8)[0]).toBeLessThan(255);
  });

  it("negative BRIGHTNESS preserves nonzero shadow detail", () => {
    const source = createSyntheticFixture("dark-shadows", 32, 16);
    const result = render(source, setAdjustment(neutral(), "ALL", "BRIGHTNESS", -1));
    expect(rgbAt(result, 16, 8)[0]).toBeGreaterThan(0);
  });

  it("WARMTH deterministically raises red and lowers blue", () => {
    const source = createSyntheticFixture("neutral-gray", 8, 8);
    const result = render(source, setAdjustment(neutral(), "ALL", "WARMTH", 1));
    expect(rgbAt(result, 4, 4)[0]).toBeGreaterThan(128);
    expect(rgbAt(result, 4, 4)[2]).toBeLessThan(128);
  });

  it("SATURATION increases bounded chroma", () => {
    const source = createSyntheticFixture("skin-like-color-patch", 8, 8);
    const result = render(source, setAdjustment(neutral(), "ALL", "SATURATION", 1));
    const before = rgbAt(source, 4, 4);
    const after = rgbAt(result, 4, 4);
    expect((after[0] ?? 0) - (after[2] ?? 0)).toBeGreaterThan((before[0] ?? 0) - (before[2] ?? 0));
  });

  it("SOFTNESS reduces bounded high-frequency detail", () => {
    const source = createSyntheticFixture("fine-texture", 32, 20);
    const result = render(source, setAdjustment(neutral(), "ALL", "SOFTNESS", 1));
    expect(detailEnergy(result)).toBeLessThan(detailEnergy(source));
    expect(detailEnergy(result)).toBeGreaterThan(detailEnergy(source) * 0.5);
  });

  it("negative SOFTNESS applies bounded clarity", () => {
    const source = createSyntheticFixture("hair-like-lines", 32, 20);
    const result = render(source, setAdjustment(neutral(), "ALL", "SOFTNESS", -1));
    expect(detailEnergy(result)).toBeGreaterThanOrEqual(detailEnergy(source));
  });

  it("same source and same recipe are bit deterministic", () => {
    const source = createSyntheticFixture("busy-background", 48, 32);
    let recipe = setAdjustment(neutral(), "ALL", "BRIGHTNESS", 0.32);
    recipe = setAdjustment(recipe, "ALL", "WARMTH", -0.22);
    recipe = setAdjustment(recipe, "ALL", "SATURATION", 0.19);
    expect(render(source, recipe).data).toEqual(render(source, recipe).data);
  });

  it("normalizes recipe array order to canonical parameter order", () => {
    const source = createSyntheticFixture("gradient", 16, 16);
    let first = setAdjustment(neutral(), "ALL", "BRIGHTNESS", 0.8);
    first = setAdjustment(first, "ALL", "WARMTH", 0.8);
    let second = setAdjustment(neutral(), "ALL", "WARMTH", 0.8);
    second = setAdjustment(second, "ALL", "BRIGHTNESS", 0.8);
    expect(render(source, first).data).toEqual(render(source, second).data);
  });

  it("never mutates source bytes and preserves final dimensions", () => {
    const source = createSyntheticFixture("gradient", 37, 23);
    const before = new Uint8ClampedArray(source.data);
    const result = renderer.render(source, setAdjustment(neutral(), "ALL", "BRIGHTNESS", 0.7), undefined, { mode: "final" });
    expect(source.data).toEqual(before);
    expect([result.width, result.height]).toEqual([37, 23]);
  });

  it("produces only finite byte channels", () => {
    const source = createSyntheticFixture("bright-highlights", 32, 24);
    let recipe = setAdjustment(neutral(), "ALL", "BRIGHTNESS", 1);
    recipe = setAdjustment(recipe, "ALL", "SATURATION", 1);
    const result = render(source, recipe);
    expect([...result.data].every((channel) => Number.isFinite(channel) && channel >= 0 && channel <= 255)).toBe(true);
  });
});

describe("scope and feather composition", () => {
  it("ALL scope changes both corners and center", () => {
    const source = createSyntheticFixture("neutral-gray", 24, 24);
    const result = render(source, setAdjustment(neutral(), "ALL", "BRIGHTNESS", 0.5));
    expect(rgbAt(result, 0, 0)).not.toEqual(rgbAt(source, 0, 0));
    expect(rgbAt(result, 12, 12)).not.toEqual(rgbAt(source, 12, 12));
  });

  it("LOCAL_REGION leaves outside pixels unchanged", () => {
    const source = createSyntheticFixture("neutral-gray", 40, 40);
    const region = createDefaultRegion(0);
    const result = render(source, setAdjustment(neutral(), "LOCAL_REGION", "WARMTH", 1, region));
    expect(rgbAt(result, 0, 0)).toEqual(rgbAt(source, 0, 0));
    expect(rgbAt(result, 20, 20)).not.toEqual(rgbAt(source, 20, 20));
  });

  it("feather has zero edge, smooth interior falloff, and full center", () => {
    const region = { ...createDefaultRegion(0), x: 0.2, y: 0.2, width: 0.6, height: 0.6, feather: 0.25 };
    expect(regionWeight(0.2, 0.5, region)).toBe(0);
    expect(regionWeight(0.25, 0.5, region)).toBeGreaterThan(0);
    expect(regionWeight(0.25, 0.5, region)).toBeLessThan(1);
    expect(regionWeight(0.5, 0.5, region)).toBe(1);
    expect(regionWeight(0.05, 0.5, region)).toBe(0);
  });

  it("accepts deterministic optional mask fixtures without semantic detection", () => {
    const source = createSyntheticFixture("neutral-gray", 12, 12);
    const recipe = neutral();
    recipe.adjustments.push({ scope: "PERSON", parameter: "BRIGHTNESS", value: 1 });
    const empty = renderer.render(source, recipe, { person: createMaskFixture("empty-mask", 12, 12) }, { mode: "preview" });
    const full = renderer.render(source, recipe, { person: createMaskFixture("full-mask", 12, 12) }, { mode: "preview" });
    expect(empty.data).toEqual(source.data);
    expect(full.data).not.toEqual(source.data);
  });
});

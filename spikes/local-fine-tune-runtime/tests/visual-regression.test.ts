import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createSyntheticFixture } from "../src/fixtures/synthetic";
import { createDefaultRegion } from "../src/mask/regions";
import { createMaskFixture } from "../src/mask/fixtures";
import { createRecipe, setAdjustment } from "../src/recipe/recipe";
import { Canvas2DFineTuneRenderer } from "../src/renderer/cpuRenderer";

const metrics = (left: Uint8ClampedArray, right: Uint8ClampedArray) => {
  let absolute = 0;
  let max = 0;
  for (let index = 0; index < left.length; index += 1) {
    const difference = Math.abs((left[index] ?? 0) - (right[index] ?? 0));
    absolute += difference;
    max = Math.max(max, difference);
  }
  return { mae: absolute / left.length, max };
};

describe("automated pixel visual regression", () => {
  it("matches the locked CPU reference output exactly", () => {
    const source = createSyntheticFixture("local-region-boundary", 48, 32);
    const region = { ...createDefaultRegion(0), x: 0.18, y: 0.16, width: 0.61, height: 0.67, feather: 0.22 };
    let recipe = createRecipe({ recipe_id: "visual", created_at: "2026-08-25T00:00:00.000Z" });
    recipe = setAdjustment(recipe, "ALL", "BRIGHTNESS", 0.27);
    recipe = setAdjustment(recipe, "ALL", "SATURATION", -0.16);
    recipe = setAdjustment(recipe, "LOCAL_REGION", "WARMTH", 0.41, region);
    recipe = setAdjustment(recipe, "LOCAL_REGION", "SOFTNESS", 0.36, region);
    const renderer = new Canvas2DFineTuneRenderer();
    const first = renderer.render(source, recipe, undefined, { mode: "preview" });
    const second = renderer.render(source, recipe, undefined, { mode: "preview" });
    expect(metrics(first.data, second.data)).toEqual({ mae: 0, max: 0 });
    expect(createHash("sha256").update(first.data).digest("hex")).toBe("0d614e1807c312e6a5846f401a94b4317d628ce9ab7b28973e964cda59d578fd");
  });

  it("matches the locked edge-safe BACKGROUND BLUR output", () => {
    const source = createSyntheticFixture("busy-background", 64, 48);
    const mask = createMaskFixture("background-like-mask", 64, 48);
    let recipe = createRecipe({ recipe_id: "visual-blur", created_at: "2026-08-25T00:00:00.000Z" });
    recipe = setAdjustment(recipe, "ALL", "WARMTH", 0.17);
    recipe = setAdjustment(recipe, "BACKGROUND", "BLUR", 0.72);
    const result = new Canvas2DFineTuneRenderer().render(source, recipe, { background: mask }, { mode: "preview" });
    expect(createHash("sha256").update(result.data).digest("hex")).toBe("f100f6d8e0c313cbcccf0a542be2a1c4e1eb9ed9f773b72d77f633c80201298a");
  });
});

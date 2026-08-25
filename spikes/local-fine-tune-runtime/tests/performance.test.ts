import { describe, expect, it } from "vitest";
import { createSyntheticFixture } from "../src/fixtures/synthetic";
import { createDefaultRegion } from "../src/mask/regions";
import { createRecipe, setAdjustment } from "../src/recipe/recipe";
import { Canvas2DFineTuneRenderer } from "../src/renderer/cpuRenderer";

describe("desktop synthetic render evidence", () => {
  it("records 1080p and higher-resolution CPU final render times", () => {
    const renderer = new Canvas2DFineTuneRenderer();
    const region = createDefaultRegion(0);
    let recipe = createRecipe({ recipe_id: "performance", created_at: "2026-08-25T00:00:00.000Z" });
    recipe = setAdjustment(recipe, "ALL", "BRIGHTNESS", 0.18);
    recipe = setAdjustment(recipe, "ALL", "WARMTH", -0.12);
    recipe = setAdjustment(recipe, "ALL", "SATURATION", 0.14);
    recipe = setAdjustment(recipe, "ALL", "SOFTNESS", 0.1);
    recipe = setAdjustment(recipe, "LOCAL_REGION", "BRIGHTNESS", 0.2, region);

    const fixtureA = createSyntheticFixture("busy-background", 1920, 1080);
    const fixtureB = createSyntheticFixture("busy-background", 2560, 1440);
    const resultA = renderer.render(fixtureA, recipe, undefined, { mode: "final" });
    const resultB = renderer.render(fixtureB, recipe, undefined, { mode: "final" });

    console.info(`FT_P0_PERFORMANCE ${JSON.stringify({
      fixtureA: { resolution: "1920x1080", renderMs: Number(resultA.renderMs.toFixed(1)) },
      fixtureB: { resolution: "2560x1440", renderMs: Number(resultB.renderMs.toFixed(1)) },
      backend: resultA.backend,
    })}`);
    expect([resultA.width, resultA.height]).toEqual([1920, 1080]);
    expect([resultB.width, resultB.height]).toEqual([2560, 1440]);
    expect(resultA.renderMs).toBeLessThan(10_000);
    expect(resultB.renderMs).toBeLessThan(15_000);
  }, 30_000);
});

import { describe, expect, it } from "vitest";
import {
  createRecipe,
  reloadRecipe,
  serializeRecipe,
  setAdjustment,
  updateRegionGeometry,
  validateRecipe,
} from "../src/recipe/recipe";
import { createDefaultRegion } from "../src/mask/regions";

const fixedRecipe = () => createRecipe({
  recipe_id: "recipe-test",
  session_id: "session-test",
  source_asset_id: "asset-test",
  created_at: "2026-08-25T00:00:00.000Z",
});

describe("M01 AdjustmentRecipe mapping", () => {
  it("validates a neutral recipe against the canonical schema", () => {
    expect(validateRecipe(fixedRecipe())).toEqual({ valid: true, errors: [] });
  });

  it("always emits semantic_edit_allowed=false", () => {
    expect(fixedRecipe().semantic_edit_allowed).toBe(false);
  });

  it.each(["BRIGHTNESS", "WARMTH", "SATURATION", "SOFTNESS"] as const)("persists P0 parameter %s", (parameter) => {
    const recipe = setAdjustment(fixedRecipe(), "ALL", parameter, 0.4);
    expect(recipe.adjustments[0]).toEqual({ scope: "ALL", parameter, value: 0.4 });
    expect(validateRecipe(recipe).valid).toBe(true);
  });

  it.each(["MOOD", "SKIN_TONE", "SKIN_RETOUCH", "BLUR"] as const)("rejects deferred P0 parameter %s", (parameter) => {
    expect(() => setAdjustment(fixedRecipe(), "ALL", parameter, 0.4)).toThrow("deferred");
  });

  it("clamps canonical values to [-1, 1]", () => {
    const recipe = setAdjustment(fixedRecipe(), "ALL", "BRIGHTNESS", 8);
    expect(recipe.adjustments[0]?.value).toBe(1);
  });

  it("removes neutral adjustments instead of hiding mutable state", () => {
    const changed = setAdjustment(fixedRecipe(), "ALL", "WARMTH", 0.5);
    expect(setAdjustment(changed, "ALL", "WARMTH", 0).adjustments).toEqual([]);
  });

  it("serializes and reloads without semantic loss", () => {
    const region = createDefaultRegion(0);
    const changed = setAdjustment(fixedRecipe(), "LOCAL_REGION", "SATURATION", -0.34, region);
    expect(reloadRecipe(serializeRecipe(changed))).toEqual(changed);
  });

  it("rejects semantic edit authority on reload", () => {
    const unsafe = { ...fixedRecipe(), semantic_edit_allowed: true };
    expect(() => reloadRecipe(JSON.stringify(unsafe))).toThrow("M01 schema");
  });

  it("persists bounded normalized local geometry in schema-valid region", () => {
    const region = { ...createDefaultRegion(0), x: -2, y: 4, width: 3, height: -1, feather: 8 };
    const withLocal = setAdjustment(fixedRecipe(), "LOCAL_REGION", "BRIGHTNESS", 0.3, region);
    const moved = updateRegionGeometry(withLocal, region);
    expect(moved.adjustments[0]?.region).toMatchObject({ x: 0, y: 0.96, width: 1, height: 0.04, feather: 0.45 });
    expect(validateRecipe(moved).valid).toBe(true);
  });
});

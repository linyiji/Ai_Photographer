import { describe, expect, it } from "vitest";
import { RecipeHistory } from "../src/history/recipeHistory";
import { addRegion, MAX_LOCAL_REGIONS } from "../src/mask/regions";
import { createRecipe, setAdjustment } from "../src/recipe/recipe";
import { CompareState } from "../src/ui/compareState";

const neutral = () => createRecipe({ recipe_id: "history", created_at: "2026-08-25T00:00:00.000Z" });

describe("recipe command history", () => {
  it("undoes and redoes recipe changes", () => {
    const history = new RecipeHistory(neutral());
    history.commit(setAdjustment(history.current(), "ALL", "BRIGHTNESS", 0.2));
    expect(history.undo().adjustments).toHaveLength(0);
    expect(history.redo().adjustments[0]?.value).toBe(0.2);
  });

  it("invalidates redo after a new edit", () => {
    const history = new RecipeHistory(neutral());
    history.commit(setAdjustment(history.current(), "ALL", "BRIGHTNESS", 0.2));
    history.undo();
    history.commit(setAdjustment(history.current(), "ALL", "WARMTH", 0.3));
    expect(history.canRedo()).toBe(false);
  });

  it("resets to neutral through recipe history", () => {
    const base = neutral();
    const history = new RecipeHistory(base);
    history.commit(setAdjustment(history.current(), "ALL", "SATURATION", 0.7));
    expect(history.reset(base).adjustments).toEqual([]);
    expect(history.undo().adjustments[0]?.parameter).toBe("SATURATION");
  });

  it("returns clones instead of mutable history authority", () => {
    const history = new RecipeHistory(neutral());
    const leaked = history.current();
    leaked.adjustments.push({ scope: "ALL", parameter: "BRIGHTNESS", value: 1 });
    expect(history.current().adjustments).toEqual([]);
  });
});

describe("local region product limit", () => {
  it("allows exactly three local regions", () => {
    let regions = addRegion([]);
    regions = addRegion(regions);
    regions = addRegion(regions);
    expect(regions).toHaveLength(MAX_LOCAL_REGIONS);
    expect(new Set(regions.map((region) => region.id)).size).toBe(3);
  });

  it("rejects a fourth region", () => {
    const three = addRegion(addRegion(addRegion([])));
    expect(() => addRegion(three)).toThrow("最多创建 3 个局部区域");
  });
});

describe("compare state", () => {
  it("does not mutate AdjustmentRecipe", () => {
    const recipe = setAdjustment(neutral(), "ALL", "WARMTH", 0.2);
    const before = JSON.stringify(recipe);
    const compare = new CompareState();
    expect(compare.begin(recipe)).toEqual(recipe);
    expect(compare.isComparing()).toBe(true);
    expect(compare.end(recipe)).toEqual(recipe);
    expect(compare.isComparing()).toBe(false);
    expect(JSON.stringify(recipe)).toBe(before);
  });
});

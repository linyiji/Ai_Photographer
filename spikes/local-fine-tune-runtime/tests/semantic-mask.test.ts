import { describe, expect, it } from "vitest";
import { createSyntheticFixture } from "../src/fixtures/synthetic";
import {
  ExternalMaskSetProvider,
  FixtureMaskProvider,
  MaskRuntime,
  complementMask,
  createMaskSet,
  maskIoU,
  measureMaskQuality,
  normalizeValues,
  refineMask,
  resizeMask,
  toRendererMasks,
} from "../src/mask/semantic";
import { createRecipe, reloadRecipe, serializeRecipe, setAdjustment, validateRecipe } from "../src/recipe/recipe";
import { Canvas2DFineTuneRenderer } from "../src/renderer/cpuRenderer";
import type { SemanticMask } from "../src/types/model";

const source = (width = 8, height = 6, assetId = "mask-source") => ({ ...createSyntheticFixture("neutral-gray", width, height), assetId });
const mask = (width: number, height: number, values: number[]): SemanticMask => ({ kind: "PERSON", width, height, data: Float32Array.from(values) });

describe("semantic mask normalization", () => {
  it.each([
    { input: -2, expected: 0 }, { input: -0.1, expected: 0 }, { input: 0, expected: 0 },
    { input: 0.25, expected: 0.25 }, { input: 0.5, expected: 0.5 }, { input: 1, expected: 1 },
    { input: 1.1, expected: 1 }, { input: 9, expected: 1 },
  ])("clamps $input to $expected", ({ input, expected }) => {
    expect(normalizeValues([input], 1, 1)[0]).toBe(expected);
  });

  it.each([Number.NaN, Infinity, -Infinity])("rejects non-finite %s", (value) => {
    expect(() => normalizeValues([value], 1, 1)).toThrow(/non-finite/);
  });

  it("rejects mismatched dimensions", () => expect(() => normalizeValues([0], 2, 2)).toThrow(/length/));
  it("rejects zero dimensions", () => expect(() => normalizeValues([], 0, 1)).toThrow(/positive/));
  it("does not alias provider input", () => { const values = new Float32Array([0.2]); const result = normalizeValues(values, 1, 1); values[0] = 1; expect(result[0]).toBeCloseTo(0.2); });
});

describe("resize and refinement", () => {
  it("preserves dimensions and values for identity resize", () => {
    const input = mask(2, 2, [0, 1, 1, 0]); const output = resizeMask(input, 2, 2);
    expect(output.data).toEqual(input.data); expect(output.data).not.toBe(input.data);
  });
  it("bilinearly upsamples within range", () => {
    const output = resizeMask(mask(2, 2, [0, 1, 1, 0]), 5, 5);
    expect([...output.data].every((value) => value >= 0 && value <= 1)).toBe(true);
    expect(output.data[12]).toBeCloseTo(0.5);
  });
  it("downsamples to requested size", () => expect(resizeMask(mask(2, 2, [0, 1, 1, 0]), 1, 1).data).toHaveLength(1));
  it("keeps full mask full", () => expect([...resizeMask(mask(2, 2, [1, 1, 1, 1]), 7, 3).data].every((v) => v === 1)).toBe(true));
  it("keeps empty mask empty", () => expect([...resizeMask(mask(2, 2, [0, 0, 0, 0]), 7, 3).data].every((v) => v === 0)).toBe(true));
  it("zero refinement passes is lossless", () => expect(refineMask(mask(2, 2, [0, 1, 1, 0]), 0).data).toEqual(Float32Array.from([0, 1, 1, 0])));
  it("softens a jagged impulse without erasing it", () => { const output = refineMask(mask(3, 3, [0,0,0,0,1,0,0,0,0])); expect(output.data[4]).toBeGreaterThan(0.4); expect(output.data[4]).toBeLessThan(1); });
  it("preserves a one-pixel thin line signal", () => { const output = refineMask(mask(3, 3, [0,1,0,0,1,0,0,1,0])); expect(output.data[4]).toBeGreaterThan(0.5); });
  it("complement is exact", () => expect(complementMask(mask(2, 1, [0.2, 0.75]), "BACKGROUND").data).toEqual(Float32Array.from([0.8, 0.25])));
});

describe("providers, identity, lifecycle, and cache", () => {
  it("fixture provides required PERSON and BACKGROUND masks", async () => {
    const result = await new FixtureMaskProvider().create(source());
    expect(Object.keys(result.masks).sort()).toEqual(["BACKGROUND", "PERSON"]);
  });
  it("uses decoded-upright source coordinates", async () => expect((await new FixtureMaskProvider().create(source())).coordinateSpace).toBe("DECODED_UPRIGHT_SOURCE"));
  it("person and background sum to one", async () => { const set = await new FixtureMaskProvider().create(source()); for (let i = 0; i < set.masks.PERSON.data.length; i += 1) expect((set.masks.PERSON.data[i] ?? 0) + (set.masks.BACKGROUND.data[i] ?? 0)).toBeCloseTo(1); });
  it("external provider normalizes values", async () => expect((await new ExternalMaskSetProvider(() => [-1, 2]).create(source(2, 1))).masks.PERSON.data).toEqual(Float32Array.from([0, 1])));
  it("starts NOT_REQUESTED with a provider", () => expect(new MaskRuntime(new FixtureMaskProvider()).lifecycle).toBe("NOT_REQUESTED"));
  it("starts UNAVAILABLE without a provider", () => expect(new MaskRuntime().lifecycle).toBe("UNAVAILABLE"));
  it("transitions to READY", async () => { const runtime = new MaskRuntime(new FixtureMaskProvider()); await runtime.request(source()); expect(runtime.lifecycle).toBe("READY"); });
  it("does not infer on cache hit", async () => { const runtime = new MaskRuntime(new FixtureMaskProvider()); await runtime.request(source()); const second = await runtime.request(source()); expect(second?.cacheHit).toBe(true); expect(runtime.inferenceCount).toBe(1); });
  it("invalidates by source identity", async () => { const runtime = new MaskRuntime(new FixtureMaskProvider()); await runtime.request(source()); runtime.invalidate("mask-source"); expect((await runtime.request(source()))?.cacheHit).toBe(false); expect(runtime.inferenceCount).toBe(2); });
  it("separates cache by options", async () => { const runtime = new MaskRuntime(new FixtureMaskProvider()); await runtime.request(source(), { refine: 0 }); await runtime.request(source(), { refine: 1 }); expect(runtime.inferenceCount).toBe(2); });
  it("captures provider errors", async () => { const runtime = new MaskRuntime(new ExternalMaskSetProvider(() => [Number.NaN])); expect(await runtime.request(source(1, 1))).toBeUndefined(); expect(runtime.lifecycle).toBe("ERROR"); expect(runtime.error).toMatch(/non-finite/); });
  it("rejects mismatched provider source identity", async () => { const provider = new FixtureMaskProvider(); const bad = { ...provider, create: async () => createMaskSet(source(1, 1, "wrong"), [1], "bad", "1") }; const runtime = new MaskRuntime(bad); await runtime.request(source(1, 1)); expect(runtime.lifecycle).toBe("ERROR"); });
});

describe("quality and renderer scope integration", () => {
  it.each(["PERSON", "BACKGROUND"] as const)("keeps %s AdjustmentRecipe M01-valid across save/reload", (scope) => {
    const recipe = setAdjustment(createRecipe(), scope, "WARMTH", 0.4);
    expect(validateRecipe(recipe).valid).toBe(true);
    const reloaded = reloadRecipe(serializeRecipe(recipe));
    expect(reloaded).toEqual(recipe); expect(reloaded.semantic_edit_allowed).toBe(false);
  });
  it("identical masks have IoU 1", () => expect(maskIoU(mask(2, 1, [1, 0]), mask(2, 1, [1, 0]))).toBe(1));
  it("disjoint masks have IoU 0", () => expect(maskIoU(mask(2, 1, [1, 0]), mask(2, 1, [0, 1]))).toBe(0));
  it("empty masks define IoU as 1", () => expect(maskIoU(mask(2, 1, [0, 0]), mask(2, 1, [0, 0]))).toBe(1));
  it("perfect quality has zero leakage and boundary error", () => expect(measureMaskQuality(mask(2, 1, [1, 0]), mask(2, 1, [1, 0]))).toEqual({ iou: 1, leakage: 0, boundaryError: 0 }));
  it("reports leakage outside expected foreground", () => expect(measureMaskQuality(mask(2, 1, [1, 0.5]), mask(2, 1, [1, 0])).leakage).toBe(0.5));
  it("converts full-resolution masks to preview dimensions", () => { const set = createMaskSet(source(8, 6), new Float32Array(48).fill(1), "fixture", "1"); expect(toRendererMasks(set, 4, 3)?.person).toHaveLength(12); });
  it.each(["PERSON", "BACKGROUND"] as const)("renders %s scope only through its mask", async (scope) => {
    const input = source(12, 8); const set = await new FixtureMaskProvider().create(input);
    const recipe = setAdjustment(createRecipe({ source_asset_id: input.assetId }), scope, "BRIGHTNESS", 1);
    const output = new Canvas2DFineTuneRenderer().render(input, recipe, toRendererMasks(set, 12, 8), { mode: "preview" });
    expect(output.data).not.toEqual(input.data);
  });
  it("combined PERSON and BACKGROUND scopes are recipe-order deterministic", async () => {
    const input = source(12, 8); const masks = toRendererMasks(await new FixtureMaskProvider().create(input), 12, 8);
    let first = setAdjustment(createRecipe(), "PERSON", "BRIGHTNESS", 0.4); first = setAdjustment(first, "BACKGROUND", "WARMTH", -0.3);
    let second = setAdjustment(createRecipe(), "BACKGROUND", "WARMTH", -0.3); second = setAdjustment(second, "PERSON", "BRIGHTNESS", 0.4);
    const renderer = new Canvas2DFineTuneRenderer(); expect(renderer.render(input, first, masks, { mode: "preview" }).data).toEqual(renderer.render(input, second, masks, { mode: "preview" }).data);
  });
});

describe("orientation contract", () => {
  it.each([1, 6, 8])("records EXIF %s expectation as decoded-upright source space", async (orientation) => {
    const set = await new FixtureMaskProvider().create(source(6, 8, `exif-${String(orientation)}`));
    expect(set.coordinateSpace).toBe("DECODED_UPRIGHT_SOURCE"); expect(set.sourceWidth).toBe(6); expect(set.sourceHeight).toBe(8);
  });
});

import { describe, expect, it } from "vitest";
import { injectExifOrientation, readExifOrientation } from "../src/fixtures/exif";
import {
  ExportGuard,
  LatestStateRenderScheduler,
  MobileMetrics,
  classifyBenchmarkPath,
  expectedUprightDimensions,
  percentile,
  selectPreviewBackend,
  selectPreviewLongEdge,
  summarize,
} from "../src/performance/mobileRuntime";
import { createSyntheticFixture } from "../src/fixtures/synthetic";
import { FixtureMaskProvider } from "../src/mask/semantic";
import { CompareState } from "../src/ui/compareState";
import { createRecipe, setAdjustment } from "../src/recipe/recipe";
import { Canvas2DFineTuneRenderer } from "../src/renderer/cpuRenderer";

describe("latest-state-wins scheduling", () => {
  it("coalesces queued updates and executes only final state", () => {
    const frames: Array<() => void> = []; const rendered: number[] = [];
    const scheduler = new LatestStateRenderScheduler("A", (callback) => frames.push(callback));
    scheduler.schedule({ sourceToken: "A", inputStarted: 1, run: () => rendered.push(1) });
    scheduler.schedule({ sourceToken: "A", inputStarted: 2, run: () => rendered.push(2) });
    scheduler.schedule({ sourceToken: "A", inputStarted: 3, run: () => rendered.push(3) });
    expect(frames).toHaveLength(1); frames[0]?.(); expect(rendered).toEqual([3]);
    expect(scheduler.counters()).toEqual({ scheduled: 3, executed: 1, coalesced: 2, stale: 0 });
  });
  it("source switch invalidates a queued render", () => {
    const frames: Array<() => void> = []; let painted = false;
    const scheduler = new LatestStateRenderScheduler("A", (callback) => frames.push(callback));
    scheduler.schedule({ sourceToken: "A", inputStarted: 1, run: () => { painted = true; } }); scheduler.switchSource("B"); frames[0]?.();
    expect(painted).toBe(false); expect(scheduler.executed).toBe(0);
  });
  it("stale source token can never overwrite newest source", () => {
    const frames: Array<() => void> = []; const rendered: string[] = [];
    const scheduler = new LatestStateRenderScheduler("B", (callback) => frames.push(callback));
    scheduler.schedule({ sourceToken: "A", inputStarted: 1, run: () => rendered.push("A") }); frames[0]?.();
    expect(rendered).toEqual([]); expect(scheduler.stale).toBe(1);
  });
  it("accepts a new render after source switch", () => {
    const frames: Array<() => void> = []; const rendered: string[] = [];
    const scheduler = new LatestStateRenderScheduler("A", (callback) => frames.push(callback)); scheduler.switchSource("B");
    scheduler.schedule({ sourceToken: "B", inputStarted: 1, run: () => rendered.push("B") }); frames[0]?.(); expect(rendered).toEqual(["B"]);
  });
});

describe("mobile metric policy", () => {
  it("calculates nearest-rank floor percentiles deterministically", () => { expect(percentile([40, 10, 30, 20], 0.5)).toBe(20); expect(percentile([40, 10, 30, 20], 0.95)).toBe(30); });
  it("returns undefined percentiles for no samples", () => expect(summarize([])).toEqual({ count: 0, p50: undefined, p95: undefined, max: undefined }));
  it("reports count p50 p95 and max", () => expect(summarize([1, 2, 3, 4, 100])).toEqual({ count: 5, p50: 3, p95: 4, max: 100 }));
  it("keeps benchmark paths separate", () => { const metrics = new MobileMetrics(); metrics.record("ALL", { inputToPresent: 10, renderCompute: 4, canvasWrite: 1 }); metrics.record("LOCAL", { inputToPresent: 90, renderCompute: 50, canvasWrite: 2 }); expect(metrics.summary("ALL").max).toBe(10); expect(metrics.summary("LOCAL").max).toBe(90); });
  it("rejects negative and non-finite metrics", () => { const metrics = new MobileMetrics(); expect(() => metrics.record("ALL", { inputToPresent: -1, renderCompute: 1, canvasWrite: 1 })).toThrow(); expect(() => metrics.record("ALL", { inputToPresent: Infinity, renderCompute: 1, canvasWrite: 1 })).toThrow(); });
  it.each([
    { scopes: [], expected: "ALL" }, { scopes: ["ALL"], expected: "ALL" }, { scopes: ["PERSON"], expected: "SEMANTIC" },
    { scopes: ["BACKGROUND"], expected: "SEMANTIC" }, { scopes: ["LOCAL_REGION"], expected: "LOCAL" }, { scopes: ["ALL", "PERSON"], expected: "COMBINED" },
  ])("classifies $scopes as $expected", ({ scopes, expected }) => expect(classifyBenchmarkPath(scopes)).toBe(expected));
});

describe("adaptive preview and fallback", () => {
  it.each([
    { viewportWidth: 390, deviceMemory: 8, sourceLongEdge: 4000, expected: 512 },
    { viewportWidth: 900, deviceMemory: 4, sourceLongEdge: 4000, expected: 512 },
    { viewportWidth: 900, deviceMemory: 8, sourceLongEdge: 4000, expected: 640 },
    { viewportWidth: 1500, deviceMemory: 8, sourceLongEdge: 4000, expected: 768 },
    { viewportWidth: 390, deviceMemory: 4, sourceLongEdge: 320, expected: 320 },
  ])("selects $expected for viewport $viewportWidth", ({ expected, ...environment }) => expect(selectPreviewLongEdge(environment)).toBe(expected));
  it("keeps Canvas2D as optimized-backend fallback/reference", () => expect(selectPreviewBackend()).toBe("CANVAS2D_IMAGE_DATA"));
  it("final renderer input can remain the original source independent of preview", () => { const full = createSyntheticFixture("gradient", 40, 30); const preview = createSyntheticFixture("gradient", 20, 15); expect(full.data).not.toBe(preview.data); expect([full.width, full.height]).toEqual([40, 30]); });
  it("caches immutable softness buffers per source", () => {
    const renderer = new Canvas2DFineTuneRenderer(); const first = createSyntheticFixture("fine-texture", 20, 12); const second = createSyntheticFixture("fine-texture", 20, 12);
    const recipe = setAdjustment(createRecipe(), "ALL", "SOFTNESS", 0.5);
    renderer.render(first, recipe, undefined, { mode: "preview" }); renderer.render(first, recipe, undefined, { mode: "preview" }); expect(renderer.blurComputations).toBe(1);
    renderer.render(second, recipe, undefined, { mode: "preview" }); expect(renderer.blurComputations).toBe(2);
  });
});

describe("export, EXIF, mask alignment and compare cancellation", () => {
  it("blocks duplicate export while the first is pending", async () => {
    const guard = new ExportGuard<number>(); let resolve!: (value: number) => void; const pending = new Promise<number>((done) => { resolve = done; });
    const first = guard.run(() => pending); const duplicate = await guard.run(async () => 2); expect(duplicate).toBeUndefined(); expect(guard.blocked).toBe(1);
    resolve(1); expect(await first).toBe(1); expect(guard.busy).toBe(false);
    expect(await guard.run(async () => 3)).toBe(3); expect(guard.blocked).toBe(1);
  });
  it.each([1, 6, 8] as const)("writes and reads EXIF orientation %s", (orientation) => {
    const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xd9]); const result = injectExifOrientation(jpeg, orientation);
    expect(readExifOrientation(result)).toBe(orientation); expect(result[0]).toBe(0xff); expect(result[1]).toBe(0xd8);
  });
  it("rejects non-JPEG EXIF input", () => expect(() => injectExifOrientation(Uint8Array.from([0, 1]), 1)).toThrow(/JPEG/));
  it.each([{ orientation: 1 as const, expected: [160, 96] }, { orientation: 6 as const, expected: [96, 160] }, { orientation: 8 as const, expected: [96, 160] }])("maps EXIF $orientation upright dimensions", ({ orientation, expected }) => expect(expectedUprightDimensions(160, 96, orientation)).toEqual(expected));
  it.each([1, 6, 8] as const)("binds masks after decoded EXIF %s orientation", async (orientation) => {
    const [width, height] = expectedUprightDimensions(16, 10, orientation); const source = createSyntheticFixture("neutral-gray", width, height);
    const set = await new FixtureMaskProvider().create(source); expect([set.sourceWidth, set.sourceHeight]).toEqual([width, height]); expect(set.coordinateSpace).toBe("DECODED_UPRIGHT_SOURCE");
  });
  it("pointer cancel releases Compare without recipe mutation", () => {
    const recipe = setAdjustment(createRecipe(), "ALL", "BRIGHTNESS", 0.2); const before = JSON.stringify(recipe); const compare = new CompareState(); compare.begin(recipe); compare.cancel(recipe);
    expect(compare.isComparing()).toBe(false); expect(JSON.stringify(recipe)).toBe(before);
  });
});

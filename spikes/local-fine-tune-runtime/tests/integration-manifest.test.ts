import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const manifest = JSON.parse(readFileSync(new URL("../integration/integration-manifest.json", import.meta.url), "utf8")) as Record<string, unknown>;

describe("production integration manifest", () => {
  it("declares the accepted track and runtime version", () => {
    expect(manifest).toMatchObject({ track_id: "LOCAL_FINE_TUNE", runtime_version: "0.1.0" });
  });

  it("is baseline integration-ready without hidden blockers", () => {
    expect(manifest.integration_ready).toBe(true);
    expect(manifest.integration_blockers).toEqual([]);
  });

  it("keeps semantic generation prohibited", () => {
    expect(manifest.auto_semantic_mask_status).toBe("NOT_YET_PASS");
    expect(manifest.M01_mapping).toMatchObject({ semantic_edit_allowed: false });
  });

  it("requires provider-neutral Main seams", () => {
    expect(manifest.required_main_interfaces).toEqual(expect.arrayContaining([
      "SourceAssetResolver", "AdjustmentRecipeRepository", "FineTuneRuntimeAdapter", "MaskCapabilityResolver", "DerivedAssetWriter",
    ]));
  });

  it("keeps Worker optional with a main-thread fallback", () => {
    expect(manifest.final_export_backend).toEqual({ preferred: "WORKER_OFFSCREENCANVAS", fallback: "MAIN_THREAD_CANVAS2D" });
    expect(manifest.optional_platform_capabilities).toEqual(expect.arrayContaining(["WORKER", "OFFSCREEN_CANVAS"]));
  });

  it("does not claim deferred product semantics", () => {
    expect(manifest.deferred_parameters).toMatchObject({
      MOOD: "CONTRACT_PRODUCT_GAP",
      SKIN_TONE: "DEFERRED_MASK_DEPENDENCY",
      SKIN_RETOUCH: "REALITY_PLUS_OWNED_OR_FINE_TUNE_LATER",
    });
  });
});

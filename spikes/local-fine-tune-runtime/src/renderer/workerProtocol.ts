import type { AdjustmentRecipe, OptionalMaskSet, SourceImage } from "../types/model";

export interface WorkerExportArtifact {
  width: number;
  height: number;
  assetId: string;
  renderMs: number;
  encodeMs: number;
  backend: "CANVAS2D_IMAGE_DATA";
  blob: Blob;
  mime: "image/jpeg";
  byteSize: number;
}

export type WorkerExportRequest = {
  id: number;
  recipe: AdjustmentRecipe;
  quality: number;
  source?: SourceImage;
  masks?: OptionalMaskSet;
  synthetic?: { width: number; height: number; needsSemanticMask: boolean };
};

export type WorkerExportResponse =
  | { id: number; ok: true; result: WorkerExportArtifact }
  | { id: number; ok: false; error: string };

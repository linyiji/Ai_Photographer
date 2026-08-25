export type AdjustmentScope = "ALL" | "PERSON" | "BACKGROUND" | "LOCAL_REGION";
export type AdjustmentParameter =
  | "BRIGHTNESS"
  | "WARMTH"
  | "MOOD"
  | "SATURATION"
  | "SKIN_TONE"
  | "SKIN_RETOUCH"
  | "BLUR"
  | "SOFTNESS";

export interface SpikeLocalRegionDescriptor {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  feather: number;
}

export interface Adjustment {
  scope: AdjustmentScope;
  parameter: AdjustmentParameter;
  value: number;
  region?: SpikeLocalRegionDescriptor | null;
}

export interface AdjustmentRecipe {
  schema_version: "1.0.0";
  recipe_id: string;
  session_id: string;
  source_asset_id: string;
  created_at: string;
  semantic_edit_allowed: false;
  adjustments: Adjustment[];
}

export interface SourceImage {
  width: number;
  height: number;
  data: Uint8ClampedArray<ArrayBuffer>;
  assetId: string;
}

export interface OptionalMaskSet {
  person?: Float32Array;
  background?: Float32Array;
  face?: Float32Array;
  skin?: Float32Array;
}

export interface RenderOptions {
  mode: "preview" | "final";
}

export interface RenderResult extends SourceImage {
  renderMs: number;
  backend: "CANVAS2D_IMAGE_DATA";
}

export interface FinalRenderResult extends RenderResult {
  blob: Blob;
  mime: "image/jpeg";
  byteSize: number;
  encodeMs: number;
}

export interface FineTuneRenderer {
  render(
    source: SourceImage,
    recipe: AdjustmentRecipe,
    masks: OptionalMaskSet | undefined,
    options: RenderOptions,
  ): RenderResult;
  exportJpeg(source: SourceImage, recipe: AdjustmentRecipe, quality?: number): Promise<FinalRenderResult>;
}

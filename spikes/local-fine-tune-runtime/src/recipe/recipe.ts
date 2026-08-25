import Ajv2020, { type ErrorObject } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import adjustmentRecipeSchema from "../../../../packages/contracts/schemas/AdjustmentRecipe.schema.json";
import type {
  Adjustment,
  AdjustmentParameter,
  AdjustmentRecipe,
  AdjustmentScope,
  SpikeLocalRegionDescriptor,
} from "../types/model";
import { clampRegion } from "../mask/feather";
import { clampNormalized, isP0Parameter } from "../renderer/safeRanges";

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validateCanonical = ajv.compile(adjustmentRecipeSchema);

export const cloneRecipe = (recipe: AdjustmentRecipe): AdjustmentRecipe =>
  structuredClone(recipe);

export const createRecipe = (metadata?: Partial<Pick<AdjustmentRecipe, "recipe_id" | "session_id" | "source_asset_id" | "created_at">>): AdjustmentRecipe => ({
  schema_version: "1.0.0",
  recipe_id: metadata?.recipe_id ?? `recipe-${crypto.randomUUID()}`,
  session_id: metadata?.session_id ?? "fine-tune-spike-session",
  source_asset_id: metadata?.source_asset_id ?? "synthetic-landscape-v1",
  created_at: metadata?.created_at ?? new Date().toISOString(),
  semantic_edit_allowed: false,
  adjustments: [],
});

export interface ValidationResult {
  valid: boolean;
  errors: ErrorObject[];
}

export const validateRecipe = (candidate: unknown): ValidationResult => {
  const valid = validateCanonical(candidate);
  return { valid: Boolean(valid), errors: [...(validateCanonical.errors ?? [])] };
};

const sameTarget = (
  adjustment: Adjustment,
  scope: AdjustmentScope,
  parameter: AdjustmentParameter,
  region?: SpikeLocalRegionDescriptor,
): boolean =>
  adjustment.scope === scope &&
  adjustment.parameter === parameter &&
  (scope !== "LOCAL_REGION" || adjustment.region?.id === region?.id);

export const setAdjustment = (
  recipe: AdjustmentRecipe,
  scope: AdjustmentScope,
  parameter: AdjustmentParameter,
  value: number,
  region?: SpikeLocalRegionDescriptor,
): AdjustmentRecipe => {
  if (!isP0Parameter(parameter)) {
    throw new Error(`${parameter} is deferred in FT-P0`);
  }
  if (scope === "LOCAL_REGION" && !region) {
    throw new Error("LOCAL_REGION adjustment requires persisted geometry");
  }

  const next = cloneRecipe(recipe);
  next.semantic_edit_allowed = false;
  next.adjustments = next.adjustments.filter(
    (adjustment) => !sameTarget(adjustment, scope, parameter, region),
  );
  const normalized = clampNormalized(value);
  if (Math.abs(normalized) > 0.0001) {
    next.adjustments.push({
      scope,
      parameter,
      value: normalized,
      ...(scope === "LOCAL_REGION" ? { region: clampRegion(region!) } : {}),
    });
  }
  return next;
};

export const removeRegion = (recipe: AdjustmentRecipe, regionId: string): AdjustmentRecipe => {
  const next = cloneRecipe(recipe);
  next.adjustments = next.adjustments.filter(
    (adjustment) => adjustment.scope !== "LOCAL_REGION" || adjustment.region?.id !== regionId,
  );
  return next;
};

export const updateRegionGeometry = (
  recipe: AdjustmentRecipe,
  region: SpikeLocalRegionDescriptor,
): AdjustmentRecipe => {
  const next = cloneRecipe(recipe);
  const bounded = clampRegion(region);
  next.adjustments = next.adjustments.map((adjustment) =>
    adjustment.scope === "LOCAL_REGION" && adjustment.region?.id === region.id
      ? { ...adjustment, region: bounded }
      : adjustment,
  );
  return next;
};

export const serializeRecipe = (recipe: AdjustmentRecipe): string => {
  const validation = validateRecipe(recipe);
  if (!validation.valid) {
    throw new Error(`Recipe violates M01 schema: ${JSON.stringify(validation.errors)}`);
  }
  return JSON.stringify(recipe, null, 2);
};

export const reloadRecipe = (serialized: string): AdjustmentRecipe => {
  const candidate: unknown = JSON.parse(serialized);
  const validation = validateRecipe(candidate);
  if (!validation.valid) {
    throw new Error(`Saved recipe violates M01 schema: ${JSON.stringify(validation.errors)}`);
  }
  return cloneRecipe(candidate as AdjustmentRecipe);
};

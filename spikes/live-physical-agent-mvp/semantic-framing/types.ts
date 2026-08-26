import type { PoseMeasurement } from '../perception/types.js';

export type BodyMode = 'HEAD_ONLY' | 'HEAD_SHOULDERS' | 'UPPER_BODY' | 'THREE_QUARTER' | 'FULL_BODY' | 'PARTIAL_OR_AMBIGUOUS';
export type SemanticGroupName = 'HEAD_CORE' | 'SHOULDERS' | 'ELBOWS' | 'WRISTS' | 'HIPS' | 'KNEES' | 'ANKLES';
export type ScaleMetricType = 'HEAD_SHOULDER_SCALE' | 'TORSO_COMPOSITE_SCALE' | 'THREE_QUARTER_COMPOSITE_SCALE' | 'FULL_BODY_ROBUST_SCALE';
export type AnchorXSource = 'SHOULDER_HIP_FUSION' | 'SHOULDER_PAIR' | 'HIP_PAIR' | 'HEAD_FALLBACK' | 'UNAVAILABLE';
export type FramingFilterType = 'EMA' | 'ONE_EURO';

export interface SensorPoint { x: number; y: number }
export interface VisibleSensorRect { left: number; top: number; right: number; bottom: number }
export interface CroppedEdges { top: boolean; bottom: boolean; left: boolean; right: boolean }

export interface LandmarkGroupEvidence {
  valid: boolean;
  bilateral_valid: boolean;
  confidence: number;
  visible_count: number;
  pair_center: SensorPoint | null;
  pair_width: number | null;
}

export type LandmarkGroupEvidenceMap = Readonly<Record<SemanticGroupName, LandmarkGroupEvidence>>;

export interface BodyVisibilityState {
  mode: BodyMode;
  confidence: number;
  visible_groups: Readonly<Record<'head' | 'shoulders' | 'hips' | 'knees' | 'ankles', boolean>>;
  bilateral_groups: Readonly<Record<'shoulders' | 'hips' | 'knees' | 'ankles', boolean>>;
  cropped_edges: CroppedEdges;
  candidate_mode: BodyMode;
  candidate_since_ms: number;
  stable_mode_since_ms: number;
  body_mode_transition_count: number;
  body_mode_flicker_count: number;
}

export interface FramingScaleMeasurement {
  value: number | null;
  metric_type: ScaleMetricType | null;
  component_values: Readonly<Partial<Record<'shoulder_width' | 'head_shoulder_span' | 'torso_length' | 'hip_knee_span' | 'head_ankle_span', number>>>;
  component_confidences: Readonly<Partial<Record<'shoulder_width' | 'head_shoulder_span' | 'torso_length' | 'hip_knee_span' | 'head_ankle_span', number>>>;
  uncertainty: number;
  body_mode: BodyMode;
}

export interface SemanticRawMeasurement {
  timestamp_ms: number;
  groups: LandmarkGroupEvidenceMap;
  candidate_mode: BodyMode;
  candidate_confidence: number;
  cropped_edges: CroppedEdges;
  anchor_x: number | null;
  anchor_x_source: AnchorXSource;
  anchor_x_uncertainty: number;
  scale_by_mode: Readonly<Partial<Record<BodyMode, FramingScaleMeasurement>>>;
  display_box: PoseMeasurement | null;
  raw_pose_box: PoseMeasurement | null;
}

export interface FramingMeasurement {
  timestamp_ms: number;
  state_version: number;
  body_mode: BodyMode;
  body_mode_confidence: number;
  body_visibility: BodyVisibilityState;
  groups: LandmarkGroupEvidenceMap;
  anchor_x: number | null;
  anchor_x_source: AnchorXSource;
  scale: number | null;
  scale_metric_type: ScaleMetricType | null;
  scale_components: FramingScaleMeasurement['component_values'];
  confidence: number;
  uncertainty_x: number;
  uncertainty_scale: number;
  cropped_edges: CroppedEdges;
  measurement_age_ms: number;
  valid_for_precision_x: boolean;
  valid_for_precision_scale: boolean;
  velocity_x: number | null;
  velocity_scale: number | null;
  stable: boolean;
  filter_type: FramingFilterType;
  display_box: PoseMeasurement | null;
  raw_pose_box: PoseMeasurement | null;
}

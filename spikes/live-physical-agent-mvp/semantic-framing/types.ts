import type { PoseMeasurement } from '../perception/types.js';

export type BodyMode = 'HEAD_ONLY' | 'HEAD_SHOULDERS' | 'UPPER_BODY' | 'THREE_QUARTER' | 'FULL_BODY' | 'PARTIAL_OR_AMBIGUOUS';
export type SemanticGroupName = 'HEAD_CORE' | 'SHOULDERS' | 'ELBOWS' | 'WRISTS' | 'HIPS' | 'KNEES' | 'ANKLES';
export type ScaleMetricType = 'HEAD_SHOULDERS_SCALE' | 'UPPER_BODY_SCALE' | 'THREE_QUARTER_SCALE' | 'FULL_BODY_SCALE';
export type AnchorXSource = 'SHOULDER_HIP_FUSION' | 'SHOULDER_PAIR' | 'HIP_PAIR' | 'HEAD_FALLBACK' | 'UNAVAILABLE';
export type FramingFilterType = 'EMA' | 'ONE_EURO';
export type TorsoOrientation = 'FRONTAL_OR_NEAR_FRONTAL' | 'OBLIQUE' | 'SIDEWAYS_OR_UNCERTAIN';
export type DistanceProxySource = 'SHOULDER_WIDTH' | 'TORSO_COMPOSITE' | 'HEAD_SHOULDER_COMPOSITE' | 'UNAVAILABLE';
export type ScaleValidityReason = 'VALID' | 'BODY_MODE_INCOMPATIBLE' | 'BODY_MODE_NOT_STABLE' | 'SHOULDER_PAIR_MISSING' | 'HIP_PAIR_MISSING' | 'HEAD_GROUP_MISSING' | 'SCALE_COMPONENT_DISAGREEMENT' | 'UNCERTAINTY_TOO_HIGH' | 'CROPPED_EDGE_CONFLICT' | 'METRIC_FAMILY_UNAVAILABLE' | 'TARGET_PROFILE_NOT_CALIBRATED' | 'MEASUREMENT_STALE' | 'REACQUISITION_BARRIER' | 'OTHER';
export type DistanceProxyValidityReason = 'VALID' | 'SHOULDER_PAIR_MISSING' | 'ORIENTATION_UNCERTAIN' | 'UNCERTAINTY_TOO_HIGH' | 'MEASUREMENT_STALE' | 'REACQUISITION_BARRIER' | 'OTHER';
export type FramingCompatibilityState = 'TOO_TIGHT' | 'COMPATIBLE' | 'TOO_WIDE' | 'UNCERTAIN';
export type CoarseFramingAction = 'COARSE_MOVE_FARTHER' | 'COARSE_MOVE_CLOSER';
export type CoarseFramingOutcome = 'SUCCESS' | 'NO_EFFECT' | 'WRONG_DIRECTION' | 'TIMEOUT' | 'MEASUREMENT_UNCERTAIN';

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
  uncertainty_components: ScaleUncertaintyComponents;
  body_mode: BodyMode;
}

export interface ScaleUncertaintyComponents {
  landmark_confidence: number;
  component_disagreement: number;
  orientation_ambiguity: number;
  crop_ambiguity: number;
  temporal_variance: number;
}

export interface RawDistanceProxyMeasurement {
  value: number | null;
  source: DistanceProxySource;
  confidence: number;
  uncertainty: number;
  valid: boolean;
  validity_reason: DistanceProxyValidityReason;
}

export interface DistanceProxyMeasurement extends RawDistanceProxyMeasurement {
  timestamp_ms: number;
  state_version: number;
  raw_value: number | null;
  velocity: number | null;
  filtered_velocity: number | null;
  body_mode: BodyMode;
  measurement_age_ms: number;
}

export interface CoarseFramingEpisode {
  trial_id: number;
  coarse_episode_id: number;
  action: CoarseFramingAction;
  issued_at: number;
  instruction_issued: boolean;
  start_body_mode: BodyMode;
  target_compatibility: FramingCompatibilityState;
  start_distance_proxy: number | null;
  start_distance_proxy_confidence: number;
  best_distance_proxy: number | null;
  coarse_progress_proxy: number;
  body_mode_progression: number;
  body_mode_progression_path: BodyMode[];
  terminal_outcome: CoarseFramingOutcome | null;
  terminal_at: number | null;
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
  torso_orientation: TorsoOrientation;
  orientation_uncertainty: number;
  distance_proxy: RawDistanceProxyMeasurement;
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
  uncertainty_scale_components: ScaleUncertaintyComponents;
  scale_validity_reason: ScaleValidityReason;
  torso_orientation: TorsoOrientation;
  distance_proxy: DistanceProxyMeasurement;
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

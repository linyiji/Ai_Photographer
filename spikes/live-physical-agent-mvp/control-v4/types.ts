export type SubjectLockStateV01='UNKNOWN'|'ACQUIRING'|'LOCKED'|'HELD'|'REACQUIRING'|'LOST';
export type BodyRegionV01='HEAD'|'SHOULDERS'|'UPPER_TORSO'|'HIPS'|'KNEES'|'ANKLES'|'FEET';
export type SemanticAnchorNameV01='HEAD_CENTER'|'SHOULDER_CENTER'|'TORSO_CENTER'|'HIP_CENTER'|'KNEE_CENTER'|'ANKLE_CENTER'|'BODY_CENTER';
export type ObservationQualityV02='GOOD'|'MARGINAL'|'INVALID';
export type AxisMotionV01='NEGATIVE'|'POSITIVE'|'STILL'|'UNKNOWN';

export interface SubjectLockObservationV01 {state:SubjectLockStateV01;confidence:number;tracked_subject_count:0|1;lock_age_ms:number;identity_claim:false;multi_person_supported:false}
export interface BodyRegionEvidenceV01 {visible:boolean;bilateral:boolean;confidence:number;crop_risk:'NONE'|'TOP'|'BOTTOM'|'SIDE'|'UNKNOWN'}
export interface BodyVisibilityGraphV01 {regions:Readonly<Record<BodyRegionV01,Readonly<BodyRegionEvidenceV01>>>;summary_mode:string;summary_only:true;feet_visible:boolean;feet_bottom_cropped:boolean;partial_landmarks:boolean}
export interface SemanticAnchorV01 {name:SemanticAnchorNameV01;x:number;y:number;confidence:number;source:string}
export interface SemanticAnchorSetV01 {anchors:Readonly<Partial<Record<SemanticAnchorNameV01,Readonly<SemanticAnchorV01>>>>;coordinate_basis:'SENSOR_NORMALIZED_NON_MIRRORED';mirror_applied_to_control:false}
export type ScaleMetricV02='HEAD_TO_HIP'|'HEAD_TO_KNEE'|'HEAD_TO_ANKLE';
export interface ScaleEvidenceV02 {metric:ScaleMetricV02;value:number|null;valid:boolean;confidence:number}
export interface HumanMotionEvidenceV02 {x_motion:AxisMotionV01;scale_motion:AxisMotionV01;velocity_x:number|null;velocity_scale:number|null;distance_proxy:number|null;distance_proxy_role:'RESPONSE_EVIDENCE_ONLY'}
export interface HumanObservationV02 {observation_version:'HumanObservationV02';timestamp_ms:number;state_version:number;measurement_age_ms:number;fresh:boolean;stable:boolean;quality:ObservationQualityV02;subject_lock:Readonly<SubjectLockObservationV01>;body_visibility:Readonly<BodyVisibilityGraphV01>;semantic_anchors:Readonly<SemanticAnchorSetV01>;scale_evidence:Readonly<Record<ScaleMetricV02,Readonly<ScaleEvidenceV02>>>;motion_evidence:Readonly<HumanMotionEvidenceV02>;diagnostics:Readonly<{source_body_mode_summary:string|null;reacquisition_barrier:boolean;warnings:readonly string[]}>}

export type ControlActorV02='SUBJECT'|'CAMERA_OPERATOR'|'EITHER';
export type TargetFixtureIdV02='CENTER_UPPER_BODY'|'LEFT_THIRD_UPPER_BODY'|'RIGHT_THIRD_UPPER_BODY'|'CENTER_THREE_QUARTER'|'LEFT_THIRD_FULL_BODY'|'RIGHT_THIRD_FULL_BODY';
export interface LiveTargetV02 {target_version:'LiveTargetV02';id:TargetFixtureIdV02;source:'FIXTURE';label:string;required_body_parts:readonly BodyRegionV01[];primary_anchor:SemanticAnchorNameV01;target_anchor_x:number;tolerance_x:number;target_anchor_y:number|null;tolerance_y:number|null;scale_metric:ScaleMetricV02;target_scale:number;tolerance_scale:number;control_actor:ControlActorV02;ready_stable_ms:number}

export type ConstraintRelationV01='TOO_LOW'|'IN_RANGE'|'TOO_HIGH'|'UNKNOWN';
export type V4Stage='ACQUIRE_SUBJECT'|'ACQUIRE_REQUIRED_BODY'|'ADJUST_SCALE'|'ALIGN_PRIMARY_ANCHOR'|'ALIGN_SECONDARY_CONSTRAINT'|'VERIFY'|'READY_LATCHED';
export interface LiveConstraintStateV01 {constraint_version:'LiveConstraintStateV01';stage:V4Stage;subject_satisfied:boolean;required_body_satisfied:boolean;missing_body_parts:readonly BodyRegionV01[];scale_relation:ConstraintRelationV01;scale_error_normalized:number|null;x_relation:ConstraintRelationV01;x_error_normalized:number|null;y_relation:ConstraintRelationV01;y_error_normalized:number|null;all_satisfied:boolean;control_actor:ControlActorV02;target_id:TargetFixtureIdV02;observation_state_version:number}

export type V4Action='MOVE_LEFT_SMALL'|'MOVE_RIGHT_SMALL'|'MOVE_CLOSER_SMALL'|'MOVE_FARTHER_SMALL';
export type V4EpisodeState='ISSUED'|'WAIT_FOR_RESPONSE'|'WAIT_FOR_SETTLE'|'EVALUATED'|'CANCELLED';
export type V4Outcome='TARGET_REACHED'|'IMPROVED'|'NO_EFFECT'|'WRONG_DIRECTION';
export interface ControlEpochV04 {trial_id:number;episode_id:number;issued_at:number;stage:'ADJUST_SCALE'|'ALIGN_PRIMARY_ANCHOR';action:V4Action;actor:ControlActorV02;target_snapshot:Readonly<LiveTargetV02>;constraint_snapshot:Readonly<LiveConstraintStateV01>;observation_state_version:number;coordinate_basis:'SENSOR_NORMALIZED_NON_MIRRORED'}
export interface V4Episode {trial_id:number;episode_id:number;state:V4EpisodeState;stage:'ADJUST_SCALE'|'ALIGN_PRIMARY_ANCHOR';action:V4Action;issued_at:number;response_observed:boolean;response_observed_at:number|null;movement_started_at:number|null;settle_started_at:number|null;settled_at:number|null;evaluated_at:number|null;cancelled_at:number|null;start_error:number;settled_error:number|null;outcome:V4Outcome|null;reminder_emitted:boolean;no_response_recorded:boolean;passive_relation_change:boolean;control_epoch:Readonly<ControlEpochV04>}
export interface V4Metrics {issued_actions:number;responded_actions:number;no_response_actions:number;causally_evaluable_actions:number;invalidated_actions:number;target_reached_count:number;improved_count:number;no_effect_count:number;wrong_direction_count:number;no_response_outcome_count:0;no_response_reissue_count:0;passive_relation_change_count:number;post_ready_ordinary:0;action_effectiveness:number|null;provider_calls:0;luna_calls:0;backend_per_frame_calls:0;raw_video_upload:0}
export interface V4Snapshot {timestamp_ms:number;armed:boolean;trial_id:number|null;stage:V4Stage;observation:Readonly<HumanObservationV02>;target:Readonly<LiveTargetV02>;constraints:Readonly<LiveConstraintStateV01>;action:V4Action|null;instruction_copy_zh:string|null;acquisition_copy_zh:string|null;active_episode:Readonly<V4Episode>|null;last_episode:Readonly<V4Episode>|null;ready:boolean;ready_hold_elapsed_ms:number;reminder_due:boolean;metrics:Readonly<V4Metrics>}


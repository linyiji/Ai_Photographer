export type VoiceSemanticIdV01 =
  | 'ACQUIRE_SUBJECT'
  | 'SUBJECT_LEFT_SMALL'
  | 'SUBJECT_RIGHT_SMALL'
  | 'MOVE_CLOSER_SMALL'
  | 'MOVE_FARTHER_SMALL'
  | 'HOLD_STILL'
  | 'VERIFY'
  | 'CURRENT_READY_ENTER';

export type VoicePhraseKeyV01 = VoiceSemanticIdV01;
export type VoicePriorityV01 = 1 | 2 | 3 | 4;
export type VoiceInterruptPolicyV01 = 'INTERRUPT_LOWER' | 'REPLACE_STALE' | 'QUEUE_IF_IDLE';
export type VoiceRepeatPolicyV01 = 'ONCE_PER_CONTROL_EPOCH' | 'ONCE_PER_SEMANTIC_ENTRY';
export type VoiceSchedulerStateV01 = 'IDLE' | 'PENDING' | 'SPEAKING' | 'COOLDOWN' | 'CANCELLED' | 'UNAVAILABLE';
export type VoiceSuppressionReasonV01 =
  | 'NONE'
  | 'NOT_PREPARED'
  | 'VOICE_DISABLED'
  | 'VOICE_UNAVAILABLE'
  | 'LIVE_DISARMED'
  | 'STALE_SESSION'
  | 'STALE_TARGET'
  | 'STALE_READY'
  | 'DUPLICATE_CONTROL_EPOCH'
  | 'DUPLICATE_SEMANTIC_ENTRY'
  | 'COOLDOWN';

export interface VoicePresentationCueV01 {
  enabled: true;
  cue_id: string;
  semantic_id: VoiceSemanticIdV01;
  phrase_key: VoicePhraseKeyV01;
  phrase_text: string;
  priority: VoicePriorityV01;
  interrupt_policy: VoiceInterruptPolicyV01;
  repeat_policy: VoiceRepeatPolicyV01;
  control_epoch_id: string | null;
  expires_at: number;
}

export interface VoiceOutputEventsV01 {
  onStart(cueId: string, startedAt: number): void;
  onComplete(cueId: string, completedAt: number): void;
  onCancel(cueId: string, cancelledAt: number): void;
  onError(cueId: string, failedAt: number): void;
}

export interface VoiceOutputPortV01 {
  isAvailable(): boolean;
  prepareFromUserGesture(): void;
  speak(cue: Readonly<VoicePresentationCueV01>, events: Readonly<VoiceOutputEventsV01>): void;
  cancel(cueId?: string): void;
  setEnabled(enabled: boolean): void;
  dispose(): void;
}

export interface VoiceCueContextV01 {
  now: number;
  session_revision: number;
  armed: boolean;
  target_id: string;
  current_framing_ready: boolean;
  trial_success_latched: boolean;
}

export interface VoiceTelemetryV01 {
  voice_enabled: boolean;
  voice_available: boolean;
  voice_prepared: boolean;
  voice_state: VoiceSchedulerStateV01;
  voice_cue_requested: number;
  voice_cue_started: number;
  voice_cue_completed: number;
  voice_cue_cancelled: number;
  voice_cue_suppressed: number;
  voice_suppression_reason: VoiceSuppressionReasonV01;
  voice_semantic_id: VoiceSemanticIdV01 | null;
  voice_phrase_key: VoicePhraseKeyV01 | null;
  voice_control_epoch_id: string | null;
  voice_request_to_start_ms: number | null;
  voice_provider_calls: 0;
  voice_audio_upload: 0;
  voice_audio_recording: 0;
  voice_new_control_epochs: 0;
  voice_outcome_mutations: 0;
  voice_response_gate_mutations: 0;
  voice_ready_mutations: 0;
}

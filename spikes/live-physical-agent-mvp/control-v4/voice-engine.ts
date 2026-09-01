import type { V4Presentation } from './presentation.js';
import type {
  VoiceCueContextV01,
  VoiceOutputEventsV01,
  VoiceOutputPortV01,
  VoicePresentationCueV01,
  VoiceSuppressionReasonV01,
  VoiceTelemetryV01,
} from './voice-types.js';

export interface VoiceCueEngineConfigV01 { cooldown_ms: number }
export const VOICE_CUE_ENGINE_CONFIG_V01: Readonly<VoiceCueEngineConfigV01> = Object.freeze({ cooldown_ms: 900 });

const initialTelemetry = (enabled: boolean, available: boolean): VoiceTelemetryV01 => ({
  voice_enabled: enabled,
  voice_available: available,
  voice_prepared: false,
  voice_state: available ? 'IDLE' : 'UNAVAILABLE',
  voice_cue_requested: 0,
  voice_cue_started: 0,
  voice_cue_completed: 0,
  voice_cue_cancelled: 0,
  voice_cue_suppressed: 0,
  voice_suppression_reason: 'NONE',
  voice_semantic_id: null,
  voice_phrase_key: null,
  voice_control_epoch_id: null,
  voice_request_to_start_ms: null,
  voice_provider_calls: 0,
  voice_audio_upload: 0,
  voice_audio_recording: 0,
  voice_new_control_epochs: 0,
  voice_outcome_mutations: 0,
  voice_response_gate_mutations: 0,
  voice_ready_mutations: 0,
});

export class VoiceCueEngineV01 {
  private enabled = true;
  private prepared = false;
  private sessionRevision: number | null = null;
  private targetId: string | null = null;
  private lastSemanticId: string | null = null;
  private semanticEntry = 0;
  private currentReady = false;
  private cooldownUntil = 0;
  private activeCue: Readonly<VoicePresentationCueV01> | null = null;
  private requestedAt = new Map<string, number>();
  private ordinaryEpochs = new Set<string>();
  private semanticEntries = new Set<string>();
  private telemetry: VoiceTelemetryV01;

  constructor(private readonly output: VoiceOutputPortV01, private readonly config = VOICE_CUE_ENGINE_CONFIG_V01) {
    this.telemetry = initialTelemetry(this.enabled, output.isAvailable());
    this.output.setEnabled(this.enabled);
  }

  prepareFromUserGesture(): void {
    if (this.prepared) return;
    this.prepared = true;
    this.output.prepareFromUserGesture();
    this.telemetry.voice_prepared = true;
    this.refreshAvailability();
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.output.setEnabled(enabled);
    this.telemetry.voice_enabled = enabled;
    if (!enabled) this.cancelActive('VOICE_DISABLED');
  }

  isEnabled(): boolean { return this.enabled; }

  update(presentation: Readonly<V4Presentation>, context: Readonly<VoiceCueContextV01>): Readonly<VoiceTelemetryV01> {
    this.refreshAvailability();
    if (this.sessionRevision !== null && context.session_revision !== this.sessionRevision) this.invalidate('STALE_SESSION');
    if (this.targetId !== null && context.target_id !== this.targetId) this.invalidate('STALE_TARGET');
    this.sessionRevision = context.session_revision;
    this.targetId = context.target_id;

    if (this.currentReady && !context.current_framing_ready) this.cancelActive('STALE_READY');
    this.currentReady = context.current_framing_ready;

    if (!context.armed) {
      this.lastSemanticId = null;
      this.cancelActive('LIVE_DISARMED');
      return this.snapshot();
    }

    const cue = presentation.voice;
    const semanticId = cue?.semantic_id ?? null;
    if (semanticId !== this.lastSemanticId) {
      this.semanticEntry += 1;
      this.lastSemanticId = semanticId;
    }
    if (!cue) return this.snapshot();

    if (!this.enabled) return this.suppress('VOICE_DISABLED');
    if (!this.prepared) return this.suppress('NOT_PREPARED');
    if (!this.output.isAvailable()) return this.suppress('VOICE_UNAVAILABLE');
    if (cue.semantic_id === 'CURRENT_READY_ENTER' && !context.current_framing_ready) return this.suppress('STALE_READY');

    const semanticEntryKey = `${context.session_revision}:${cue.semantic_id}:${this.semanticEntry}`;
    const dedupeKey = cue.repeat_policy === 'ONCE_PER_CONTROL_EPOCH' ? cue.control_epoch_id : semanticEntryKey;
    if (cue.repeat_policy === 'ONCE_PER_CONTROL_EPOCH') {
      if (!dedupeKey || this.ordinaryEpochs.has(dedupeKey)) return this.suppress('DUPLICATE_CONTROL_EPOCH');
    } else if (this.semanticEntries.has(semanticEntryKey)) return this.suppress('DUPLICATE_SEMANTIC_ENTRY');

    if (context.now < this.cooldownUntil && cue.priority > 1) return this.suppress('COOLDOWN');

    const finalCue = Object.freeze({ ...cue, cue_id: `${cue.cue_id}:${context.session_revision}:${this.semanticEntry}` });
    if (this.activeCue && (cue.priority < this.activeCue.priority || cue.interrupt_policy !== 'QUEUE_IF_IDLE')) this.cancelActive('NONE');
    if (cue.repeat_policy === 'ONCE_PER_CONTROL_EPOCH' && dedupeKey) this.ordinaryEpochs.add(dedupeKey);
    else this.semanticEntries.add(semanticEntryKey);
    this.dispatch(finalCue, context.now);
    return this.snapshot();
  }

  invalidate(reason: VoiceSuppressionReasonV01 = 'STALE_SESSION'): void {
    this.cancelActive(reason);
    this.lastSemanticId = null;
    this.semanticEntry = 0;
    this.currentReady = false;
    this.cooldownUntil = 0;
    this.ordinaryEpochs.clear();
    this.semanticEntries.clear();
  }

  dispose(): void {
    this.cancelActive('LIVE_DISARMED');
    this.output.dispose();
  }

  snapshot(): Readonly<VoiceTelemetryV01> { return Object.freeze({ ...this.telemetry }); }

  private dispatch(cue: Readonly<VoicePresentationCueV01>, now: number): void {
    this.activeCue = cue;
    this.requestedAt.set(cue.cue_id, now);
    this.telemetry.voice_cue_requested += 1;
    this.telemetry.voice_state = 'PENDING';
    this.telemetry.voice_suppression_reason = 'NONE';
    this.telemetry.voice_semantic_id = cue.semantic_id;
    this.telemetry.voice_phrase_key = cue.phrase_key;
    this.telemetry.voice_control_epoch_id = cue.control_epoch_id;
    const events: VoiceOutputEventsV01 = {
      onStart: (cueId, startedAt) => {
        if (cueId !== cue.cue_id) return;
        this.telemetry.voice_cue_started += 1;
        this.telemetry.voice_state = 'SPEAKING';
        this.telemetry.voice_request_to_start_ms = Math.max(0, startedAt - (this.requestedAt.get(cueId) ?? startedAt));
      },
      onComplete: (cueId, completedAt) => {
        if (cueId !== cue.cue_id) return;
        this.telemetry.voice_cue_completed += 1;
        this.telemetry.voice_state = 'COOLDOWN';
        this.cooldownUntil = completedAt + this.config.cooldown_ms;
        if (this.activeCue?.cue_id === cueId) this.activeCue = null;
        this.requestedAt.delete(cueId);
      },
      onCancel: (cueId) => {
        if (cueId !== cue.cue_id) return;
        this.telemetry.voice_cue_cancelled += 1;
        this.telemetry.voice_state = 'CANCELLED';
        if (this.activeCue?.cue_id === cueId) this.activeCue = null;
        this.requestedAt.delete(cueId);
      },
      onError: (cueId) => {
        if (cueId !== cue.cue_id) return;
        this.telemetry.voice_cue_cancelled += 1;
        this.telemetry.voice_state = 'UNAVAILABLE';
        if (this.activeCue?.cue_id === cueId) this.activeCue = null;
        this.requestedAt.delete(cueId);
      },
    };
    try { this.output.speak(cue, events); }
    catch { events.onError(cue.cue_id, now); }
  }

  private cancelActive(reason: VoiceSuppressionReasonV01): void {
    if (!this.activeCue) {
      if (reason !== 'NONE') this.telemetry.voice_suppression_reason = reason;
      return;
    }
    const cueId = this.activeCue.cue_id;
    this.output.cancel(cueId);
    this.telemetry.voice_cue_cancelled += 1;
    this.telemetry.voice_state = 'CANCELLED';
    this.telemetry.voice_suppression_reason = reason;
    this.activeCue = null;
    this.requestedAt.delete(cueId);
  }

  private suppress(reason: VoiceSuppressionReasonV01): Readonly<VoiceTelemetryV01> {
    this.telemetry.voice_cue_suppressed += 1;
    this.telemetry.voice_suppression_reason = reason;
    if (reason === 'VOICE_UNAVAILABLE') this.telemetry.voice_state = 'UNAVAILABLE';
    return this.snapshot();
  }

  private refreshAvailability(): void {
    this.telemetry.voice_available = this.output.isAvailable();
    if (!this.telemetry.voice_available) this.telemetry.voice_state = 'UNAVAILABLE';
    else if (this.telemetry.voice_state === 'UNAVAILABLE') this.telemetry.voice_state = 'IDLE';
  }
}

import type { VoiceOutputEventsV01, VoiceOutputPortV01, VoicePresentationCueV01 } from './voice-types.js';

export interface FakeSpokenCueV01 { cue: Readonly<VoicePresentationCueV01>; events: Readonly<VoiceOutputEventsV01> }

export class FakeVoiceOutputAdapterV01 implements VoiceOutputPortV01 {
  readonly spoken: FakeSpokenCueV01[] = [];
  readonly cancelled: string[] = [];
  prepared = false;
  enabled = true;

  constructor(public available = true, private readonly now: () => number = () => 0) {}

  isAvailable(): boolean { return this.available; }
  prepareFromUserGesture(): void { this.prepared = true; }
  speak(cue: Readonly<VoicePresentationCueV01>, events: Readonly<VoiceOutputEventsV01>): void {
    if (!this.available || !this.enabled || !this.prepared) throw new Error('Fake voice unavailable');
    this.spoken.push({ cue, events });
    events.onStart(cue.cue_id, this.now());
  }
  cancel(cueId?: string): void { this.cancelled.push(cueId ?? 'ALL'); }
  setEnabled(enabled: boolean): void { this.enabled = enabled; }
  dispose(): void { this.cancel('ALL'); }
  complete(index = this.spoken.length - 1): void {
    const item = this.spoken[index];
    if (item) item.events.onComplete(item.cue.cue_id, this.now());
  }
}

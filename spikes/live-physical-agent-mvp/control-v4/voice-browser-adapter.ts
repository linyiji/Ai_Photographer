import type { VoiceOutputEventsV01, VoiceOutputPortV01, VoicePresentationCueV01 } from './voice-types.js';

export interface BrowserSpeechEnvironmentV01 {
  speechSynthesis?: SpeechSynthesis;
  SpeechSynthesisUtterance?: typeof SpeechSynthesisUtterance;
  now(): number;
}

const defaultEnvironment = (): BrowserSpeechEnvironmentV01 => ({
  speechSynthesis: typeof window !== 'undefined' ? window.speechSynthesis : undefined,
  SpeechSynthesisUtterance: typeof window !== 'undefined' ? window.SpeechSynthesisUtterance : undefined,
  now: () => typeof performance !== 'undefined' ? performance.now() : Date.now(),
});

export class BrowserSpeechSynthesisVoiceAdapterV01 implements VoiceOutputPortV01 {
  private enabled = true;
  private prepared = false;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private voicesChangedHandler: (() => void) | null = null;

  constructor(private readonly environment: BrowserSpeechEnvironmentV01 = defaultEnvironment()) {}

  isAvailable(): boolean {
    return Boolean(this.environment.speechSynthesis && this.environment.SpeechSynthesisUtterance);
  }

  prepareFromUserGesture(): void {
    this.prepared = true;
    this.refreshVoice();
    const synthesis = this.environment.speechSynthesis;
    if (!synthesis || this.voicesChangedHandler) return;
    this.voicesChangedHandler = () => this.refreshVoice();
    synthesis.addEventListener?.('voiceschanged', this.voicesChangedHandler);
  }

  speak(cue: Readonly<VoicePresentationCueV01>, events: Readonly<VoiceOutputEventsV01>): void {
    const synthesis = this.environment.speechSynthesis;
    const Utterance = this.environment.SpeechSynthesisUtterance;
    if (!this.enabled || !this.prepared || !synthesis || !Utterance) throw new Error('SpeechSynthesis unavailable');
    const utterance = new Utterance(cue.phrase_text);
    utterance.lang = 'zh-CN';
    utterance.rate = 1.1;
    utterance.pitch = 1;
    utterance.volume = 1;
    if (this.selectedVoice) utterance.voice = this.selectedVoice;
    utterance.onstart = () => events.onStart(cue.cue_id, this.environment.now());
    utterance.onend = () => events.onComplete(cue.cue_id, this.environment.now());
    utterance.onerror = () => events.onError(cue.cue_id, this.environment.now());
    synthesis.speak(utterance);
  }

  cancel(): void { this.environment.speechSynthesis?.cancel(); }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.cancel();
  }

  dispose(): void {
    this.cancel();
    const synthesis = this.environment.speechSynthesis;
    if (synthesis && this.voicesChangedHandler) synthesis.removeEventListener?.('voiceschanged', this.voicesChangedHandler);
    this.voicesChangedHandler = null;
    this.selectedVoice = null;
    this.prepared = false;
  }

  private refreshVoice(): void {
    const voices = this.environment.speechSynthesis?.getVoices?.() ?? [];
    this.selectedVoice = voices.find((voice) => /^zh(?:-|_)/i.test(voice.lang)) ?? null;
  }
}

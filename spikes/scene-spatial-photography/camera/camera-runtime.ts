import type { CameraSnapshot, CameraState, VideoFrameSource } from './camera-types.js';

// Selectively adapted ownership/request-guard concept from Live; implementation is Scene-Spatial-owned.
export class CameraRuntime implements VideoFrameSource {
  readonly video: HTMLVideoElement;
  private stream: MediaStream | null = null;
  private state: CameraState = 'IDLE';
  private requestId = 0;
  private frames = 0;
  private fps = 0;
  private fpsStartedAt = 0;
  private frameCallback = 0;
  private message = '';

  constructor(video: HTMLVideoElement) { this.video = video; }

  async start(): Promise<CameraSnapshot> {
    const requestId = ++this.requestId;
    this.stopTracks(); this.state = 'REQUESTING'; this.message = '';
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('此浏览器不支持相机预览');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
      if (requestId !== this.requestId) { stream.getTracks().forEach((track) => track.stop()); return this.snapshot(); }
      this.stream = stream; this.video.srcObject = stream; await this.video.play(); this.state = 'ACTIVE';
      this.frames = 0; this.fpsStartedAt = performance.now(); this.measureFrames();
    } catch (error) { this.stopTracks(); this.state = 'ERROR'; this.message = error instanceof Error ? error.message : String(error); }
    return this.snapshot();
  }

  stop(): void { ++this.requestId; this.stopTracks(); this.state = 'IDLE'; }
  snapshot(): CameraSnapshot { return { state: this.state, facing: 'environment', width: this.video.videoWidth, height: this.video.videoHeight, fps: this.fps, ...(this.message ? { message: this.message } : {}) }; }
  private stopTracks(): void { if (this.frameCallback) { if ('cancelVideoFrameCallback' in this.video) this.video.cancelVideoFrameCallback(this.frameCallback); else cancelAnimationFrame(this.frameCallback); } this.frameCallback = 0; this.stream?.getTracks().forEach((track) => track.stop()); this.stream = null; this.video.srcObject = null; }
  private measureFrames(): void {
    if (this.state !== 'ACTIVE') return;
    const tick = (now: number) => { this.frames++; const elapsed = now - this.fpsStartedAt; if (elapsed >= 1000) { this.fps = this.frames * 1000 / elapsed; this.frames = 0; this.fpsStartedAt = now; } this.measureFrames(); };
    if ('requestVideoFrameCallback' in this.video) this.frameCallback = this.video.requestVideoFrameCallback((now) => tick(now));
    else this.frameCallback = requestAnimationFrame(tick);
  }
}

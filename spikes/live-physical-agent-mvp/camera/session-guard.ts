export class CameraSessionGuard {
  private requestSequence = 0;

  beginRequest(): number { this.requestSequence += 1; return this.requestSequence; }
  invalidate(): void { this.requestSequence += 1; }
  isCurrent(requestId: number): boolean { return requestId === this.requestSequence; }
}

export const ownsActiveCameraSession = (active: MediaStream | null, owner: MediaStream): boolean => active === owner;

import type { OrientationPermissionState, OrientationProvider, OrientationSample } from './orientation-provider.js';

export class ControlledFixtureOrientationProvider implements OrientationProvider {
  state: OrientationPermissionState = 'UNINITIALIZED';
  private callback: ((sample: OrientationSample) => void) | null = null;
  async requestPermission(): Promise<OrientationPermissionState> { return this.state = 'ACTIVE'; }
  start(onSample: (sample: OrientationSample) => void): void { this.state = 'ACTIVE'; this.callback = onSample; }
  emit(relativeYaw: number, timestampMs: number, rawHeading: number | null = null): void {
    this.callback?.({ timestamp_ms: timestampMs, relative_yaw_deg: relativeYaw, raw_heading_deg: rawHeading,
      confidence: 'HIGH', status: 'ACTIVE', screen_orientation: 'PORTRAIT_PRIMARY', source: 'CONTROLLED_FIXTURE' });
  }
  stop(): void { this.callback = null; }
  resetBaseline(): void { /* fixture values are already relative */ }
}

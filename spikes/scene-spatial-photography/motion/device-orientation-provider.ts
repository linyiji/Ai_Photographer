import type { OrientationPermissionState, OrientationProvider, OrientationSample } from './orientation-provider.js';
import { normalizeHeadingForScreen, readScreenPosture } from './orientation-normalization.js';
import { YawUnwrapper } from './yaw-unwrapper.js';

type PermissionDeviceOrientationEvent = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> };

export class DeviceOrientationProvider implements OrientationProvider {
  state: OrientationPermissionState = 'UNINITIALIZED';
  private listener: ((event: DeviceOrientationEvent) => void) | null = null;
  private baseline: number | null = null;
  private readonly unwrapper = new YawUnwrapper();

  constructor() {
    if (typeof window === 'undefined' || typeof DeviceOrientationEvent === 'undefined') this.state = 'UNAVAILABLE';
    else if (typeof (DeviceOrientationEvent as PermissionDeviceOrientationEvent).requestPermission === 'function') this.state = 'PERMISSION_REQUIRED';
  }

  async requestPermission(): Promise<OrientationPermissionState> {
    if (this.state === 'UNAVAILABLE') return this.state;
    try {
      const request = (DeviceOrientationEvent as PermissionDeviceOrientationEvent).requestPermission;
      if (request && await request.call(DeviceOrientationEvent) !== 'granted') return this.state = 'UNAVAILABLE';
      return this.state = 'ACTIVE';
    } catch { return this.state = 'ERROR'; }
  }

  start(onSample: (sample: OrientationSample) => void): void {
    if (typeof window === 'undefined' || this.state === 'UNAVAILABLE' || this.state === 'ERROR') return;
    if (this.state === 'UNINITIALIZED') this.state = 'ACTIVE';
    this.listener = (event) => {
      if (event.alpha === null) return;
      const angle = screen.orientation?.angle ?? 0;
      const posture = readScreenPosture(angle);
      const heading = normalizeHeadingForScreen(event.alpha, posture, angle);
      if (heading === null) return;
      const unwrapped = this.unwrapper.push(heading);
      if (this.baseline === null) this.baseline = unwrapped;
      onSample({ timestamp_ms: event.timeStamp, relative_yaw_deg: unwrapped - this.baseline, raw_heading_deg: heading,
        confidence: event.absolute ? 'HIGH' : 'MEDIUM', status: this.state, screen_orientation: posture, source: 'DEVICE_ORIENTATION' });
    };
    window.addEventListener('deviceorientation', this.listener);
  }

  stop(): void { if (this.listener && typeof window !== 'undefined') window.removeEventListener('deviceorientation', this.listener); this.listener = null; }
  resetBaseline(): void { this.baseline = null; this.unwrapper.reset(); }
}

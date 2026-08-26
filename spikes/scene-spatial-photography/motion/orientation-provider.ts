export type OrientationPermissionState = 'UNINITIALIZED' | 'PERMISSION_REQUIRED' | 'ACTIVE' | 'UNAVAILABLE' | 'ERROR';
export type ScreenPosture = 'PORTRAIT_PRIMARY' | 'LANDSCAPE_PRIMARY' | 'UNSUPPORTED';
export type OrientationSource = 'DEVICE_ORIENTATION' | 'CONTROLLED_FIXTURE';

export interface OrientationSample {
  timestamp_ms: number;
  relative_yaw_deg: number;
  raw_heading_deg: number | null;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNAVAILABLE';
  status: OrientationPermissionState;
  screen_orientation: ScreenPosture;
  source: OrientationSource;
}

export interface OrientationProvider {
  readonly state: OrientationPermissionState;
  requestPermission(): Promise<OrientationPermissionState>;
  start(onSample: (sample: OrientationSample) => void): void;
  stop(): void;
  resetBaseline(): void;
}

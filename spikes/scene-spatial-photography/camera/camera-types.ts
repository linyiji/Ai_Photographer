export type CameraState = 'IDLE' | 'REQUESTING' | 'ACTIVE' | 'ERROR';
export interface CameraSnapshot { state: CameraState; facing: 'environment'; width: number; height: number; fps: number; message?: string; }
export interface VideoFrameSource { video: HTMLVideoElement; snapshot(): CameraSnapshot; }

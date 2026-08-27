import type { PixelFrame } from '../p1/types.js';
import type { CameraModelEvidenceV01, SceneGeometryRequestV01, SceneScanGeometryInputV01, SelectedGeometryFrameV01, SpatialEvidenceV02, SpatialPrecheckV01 } from './types.js';

export interface GeometryBackendResultV01 { spatial_evidence: SpatialEvidenceV02; cache_status: 'CACHE_HIT' | 'CACHE_MISS'; diagnostics: Record<string, unknown>; timing_ms: Record<string, number>; payload_bytes: number; }

const pixelFrameToJpeg = (frame: PixelFrame): Promise<Blob> => new Promise((resolve, reject) => {
  const canvas = document.createElement('canvas'); canvas.width = frame.width; canvas.height = frame.height;
  canvas.getContext('2d')!.putImageData(new ImageData(new Uint8ClampedArray(frame.data), frame.width, frame.height), 0, 0);
  canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('GEOMETRY_FRAME_JPEG_ENCODE_FAILED')), 'image/jpeg', .78);
});

const hex = (buffer: ArrayBuffer): string => [...new Uint8Array(buffer)].map(value => value.toString(16).padStart(2, '0')).join('');

export const analyzeWithFirstPartyBackend = async (input: SceneScanGeometryInputV01, precheck: SpatialPrecheckV01, cameraModel: CameraModelEvidenceV01, signal: AbortSignal): Promise<GeometryBackendResultV01> => {
  if (input.frames.length < 3 || input.frames.length > 8) throw new Error('GEOMETRY_FRAME_COUNT_OUT_OF_BOUNDS');
  const encoded = await Promise.all(input.frames.map(frame => pixelFrameToJpeg(frame.pixels)));
  const frameMetadata: SelectedGeometryFrameV01[] = input.frames.map((frame, index) => ({ frame_id: frame.frame_id, timestamp_ms: frame.timestamp_ms, relative_yaw_deg: frame.relative_yaw_deg, orientation_source: frame.orientation_source, width: frame.width, height: frame.height, quality: frame.technical_quality, file_field: `frame_${index}` }));
  const digestParts = await Promise.all(encoded.map(blob => blob.arrayBuffer()));
  const digestBlob = new Blob(digestParts);
  const frameSetHash = hex(await crypto.subtle.digest('SHA-256', await digestBlob.arrayBuffer()));
  const metadata: SceneGeometryRequestV01 = { schema: 'xfx.scene-geometry-request', schema_version: '0.1', scan_id: input.source_sweep_id, frame_set_hash: frameSetHash, geometry_version: 'p2-backend-v0.2', platform: 'h5', camera_model_evidence: cameraModel, client_precheck: precheck, selected_geometry_frames: frameMetadata, privacy: { raw_video_upload: 0, frame_stream_upload: 0, provider_upload: 0, luna_upload: 0, selected_geometry_frame_upload: 'FIRST_PARTY_BACKEND_ONLY' } };
  const form = new FormData(); form.append('metadata', JSON.stringify(metadata)); encoded.forEach((blob, index) => form.append(`frame_${index}`, blob, `${frameMetadata[index]!.frame_id}.jpg`));
  const payloadBytes = encoded.reduce((sum, blob) => sum + blob.size, 0) + new Blob([JSON.stringify(metadata)]).size;
  if (payloadBytes > 5.5 * 1024 * 1024) throw new Error('GEOMETRY_PAYLOAD_OUT_OF_BOUNDS');
  const response = await fetch('/scene-spatial/geometry/analyze', { method: 'POST', body: form, signal, credentials: 'same-origin' });
  if (!response.ok) throw new Error(`FIRST_PARTY_GEOMETRY_HTTP_${response.status}`);
  const result = await response.json() as GeometryBackendResultV01;
  return { ...result, payload_bytes: payloadBytes };
};

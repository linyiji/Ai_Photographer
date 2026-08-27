import type { PixelFrame } from '../p1/types.js';
import { frameSetSha256, sha256Hex } from './geometry-transport.js';
import type { CameraModelEvidenceV01, SceneGeometryRequestV01, SceneScanGeometryInputV01, SelectedGeometryFrameV01, SpatialEvidenceV02, SpatialPrecheckV01 } from './types.js';

export interface GeometryBackendResultV01 { spatial_evidence: SpatialEvidenceV02; cache_status: 'CACHE_HIT' | 'CACHE_MISS'; diagnostics: Record<string, unknown>; timing_ms: Record<string, number>; payload_bytes: number; }
export interface GeometryBackendErrorV01 { status: number | null; code: string; message: string; details: unknown; content_type: string | null; }
export type GeometryBackendRequestState = 'NOT_REQUESTED' | 'REQUESTING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
export interface GeometryFramePayloadEvidenceV01 { frame_id: string; source_width: number; source_height: number; working_width: number; working_height: number; encoded_bytes: number; frame_sha256: string; }
export interface GeometryBackendRequestEvidenceV01 {
  request_state: GeometryBackendRequestState; http_status: number | null; error: GeometryBackendErrorV01 | null;
  payload: { scan_id: string; frame_set_hash: string; frame_count: number; frame_dimensions: GeometryFramePayloadEvidenceV01[]; total_bytes: number; } | null;
  timing: { resize_ms: number; jpeg_encode_ms: number; hash_ms: number; prepare_ms: number; upload_ms: number | null; backend_ms: number | null; total_ms: number | null; };
  spatial_evidence: SpatialEvidenceV02 | null; cache_status?: GeometryBackendResultV01['cache_status']; backend_diagnostics?: Record<string, unknown>; backend_timing_ms?: Record<string, number>;
}

export class GeometryBackendRequestError extends Error {
  constructor(readonly evidence: GeometryBackendRequestEvidenceV01) { super(evidence.error?.message ?? 'FIRST_PARTY_GEOMETRY_REQUEST_FAILED'); this.name = 'GeometryBackendRequestError'; }
}

const pixelFrameToJpeg = (frame: PixelFrame): Promise<Blob> => new Promise((resolve, reject) => {
  const canvas = document.createElement('canvas'); canvas.width = frame.width; canvas.height = frame.height;
  canvas.getContext('2d')!.putImageData(new ImageData(new Uint8ClampedArray(frame.data), frame.width, frame.height), 0, 0);
  canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('GEOMETRY_FRAME_JPEG_ENCODE_FAILED')), 'image/jpeg', .78);
});

const elapsed = (started: number): number => performance.now() - started;
const emptyTiming = (resizeMs: number): GeometryBackendRequestEvidenceV01['timing'] => ({ resize_ms: resizeMs, jpeg_encode_ms: 0, hash_ms: 0, prepare_ms: 0, upload_ms: null, backend_ms: null, total_ms: null });

export const normalizeGeometryHttpError = async (response: Response): Promise<GeometryBackendErrorV01> => {
  const contentType = response.headers.get('content-type'); const body = await response.text(); let details: unknown = body; let code = `HTTP_${response.status}`; let message = response.statusText || code;
  if (body && contentType?.toLowerCase().includes('json')) {
    try { const parsed = JSON.parse(body) as Record<string, unknown>; details = parsed; code = typeof parsed.error === 'string' ? parsed.error : code; message = typeof parsed.message === 'string' ? parsed.message : code; } catch { /* retain text fallback */ }
  } else if (body) message = body;
  return { status: response.status, code, message, details, content_type: contentType };
};

export const analyzeWithFirstPartyBackend = async (input: SceneScanGeometryInputV01, precheck: SpatialPrecheckV01, cameraModel: CameraModelEvidenceV01, signal: AbortSignal, onPrepared?: (evidence: GeometryBackendRequestEvidenceV01) => void): Promise<GeometryBackendRequestEvidenceV01> => {
  if (input.frames.length < 3 || input.frames.length > 8) throw new Error('GEOMETRY_FRAME_COUNT_OUT_OF_BOUNDS');
  const overallStarted = performance.now(); const resizeMs = input.frames.reduce((sum, frame) => sum + frame.resize_ms, 0); const timing = emptyTiming(resizeMs);
  const encodeStarted = performance.now(); const encoded = await Promise.all(input.frames.map(frame => pixelFrameToJpeg(frame.pixels))); timing.jpeg_encode_ms = elapsed(encodeStarted);
  const buffers = await Promise.all(encoded.map(blob => blob.arrayBuffer())); const hashStarted = performance.now(); const frameHashes = await Promise.all(buffers.map(buffer => sha256Hex(buffer)));
  const frameSetHash = await frameSetSha256(input.frames.map((frame, index) => ({ frame_id: frame.frame_id, frame_sha256: frameHashes[index]! }))); timing.hash_ms = elapsed(hashStarted);
  const frameMetadata: SelectedGeometryFrameV01[] = input.frames.map((frame, index) => ({ frame_id: frame.frame_id, timestamp_ms: frame.timestamp_ms, relative_yaw_deg: frame.relative_yaw_deg, orientation_source: frame.orientation_source, width: frame.width, height: frame.height, source_width: frame.source_width, source_height: frame.source_height, working_width: frame.width, working_height: frame.height, encoded_bytes: encoded[index]!.size, frame_sha256: frameHashes[index]!, quality: frame.technical_quality, file_field: `frame_${index}` }));
  const metadata: SceneGeometryRequestV01 = { schema: 'xfx.scene-geometry-request', schema_version: '0.1', scan_id: input.source_sweep_id, frame_set_hash: frameSetHash, geometry_version: 'p2-backend-v0.2', platform: 'h5', camera_model_evidence: cameraModel, client_precheck: precheck, selected_geometry_frames: frameMetadata, privacy: { raw_video_upload: 0, frame_stream_upload: 0, provider_upload: 0, luna_upload: 0, selected_geometry_frame_upload: 'FIRST_PARTY_BACKEND_ONLY' } };
  const metadataJson = JSON.stringify(metadata); const totalBytes = encoded.reduce((sum, blob) => sum + blob.size, 0) + new Blob([metadataJson]).size;
  const payload: NonNullable<GeometryBackendRequestEvidenceV01['payload']> = { scan_id: input.source_sweep_id, frame_set_hash: frameSetHash, frame_count: encoded.length, frame_dimensions: frameMetadata.map(frame => ({ frame_id: frame.frame_id, source_width: frame.source_width, source_height: frame.source_height, working_width: frame.working_width, working_height: frame.working_height, encoded_bytes: frame.encoded_bytes, frame_sha256: frame.frame_sha256 })), total_bytes: totalBytes };
  timing.prepare_ms = elapsed(overallStarted);
  const base = (): GeometryBackendRequestEvidenceV01 => ({ request_state: 'REQUESTING', http_status: null, error: null, payload, timing: { ...timing }, spatial_evidence: null });
  onPrepared?.(base());
  if (totalBytes > 5.5 * 1024 * 1024) throw new GeometryBackendRequestError({ ...base(), request_state: 'FAILED', error: { status: null, code: 'GEOMETRY_PAYLOAD_OUT_OF_BOUNDS', message: 'GEOMETRY_PAYLOAD_OUT_OF_BOUNDS', details: { total_bytes: totalBytes }, content_type: null }, timing: { ...timing, total_ms: elapsed(overallStarted) } });
  const form = new FormData(); form.append('metadata', metadataJson); encoded.forEach((blob, index) => form.append(`frame_${index}`, blob, `${frameMetadata[index]!.frame_id}.jpg`));
  const requestStarted = performance.now();
  try {
    const response = await fetch('/scene-spatial/geometry/analyze', { method: 'POST', body: form, signal, credentials: 'same-origin' }); const roundTrip = elapsed(requestStarted);
    if (!response.ok) { const error = await normalizeGeometryHttpError(response); throw new GeometryBackendRequestError({ ...base(), request_state: 'FAILED', http_status: response.status, error, timing: { ...timing, upload_ms: roundTrip, total_ms: elapsed(overallStarted) } }); }
    const result = await response.json() as GeometryBackendResultV01; const backendMs = Number(result.timing_ms.total_compute ?? 0) + Number(result.timing_ms.multipart_parse ?? 0); const uploadMs = Math.max(0, roundTrip - backendMs);
    return { ...base(), request_state: 'SUCCEEDED', http_status: response.status, timing: { ...timing, upload_ms: uploadMs, backend_ms: backendMs, total_ms: elapsed(overallStarted) }, spatial_evidence: result.spatial_evidence, cache_status: result.cache_status, backend_diagnostics: result.diagnostics, backend_timing_ms: result.timing_ms };
  } catch (error) {
    if (error instanceof GeometryBackendRequestError) throw error;
    const cancelled = signal.aborted; throw new GeometryBackendRequestError({ ...base(), request_state: cancelled ? 'CANCELLED' : 'FAILED', error: cancelled ? null : { status: null, code: 'NETWORK_ERROR', message: error instanceof Error ? error.message : String(error), details: null, content_type: null }, timing: { ...timing, upload_ms: elapsed(requestStarted), total_ms: elapsed(overallStarted) } });
  }
};

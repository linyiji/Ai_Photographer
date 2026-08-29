import type { PixelFrame } from '../p1/types.js';
import { frameSetSha256, sha256Hex } from './geometry-transport.js';
import type { CameraModelEvidenceV01, SceneGeometryRequestV01, SceneScanGeometryInputV01, SelectedGeometryFrameV01, SpatialEvidenceV02, SpatialPrecheckV01 } from './types.js';

export type PrimaryLatencyFamily = 'CLIENT_PREPARATION' | 'CLIENT_ENCODING' | 'CLIENT_MAIN_THREAD_BLOCK' | 'TRANSPORT' | 'SERVER_BODY_RECEIVE' | 'SERVER_QUEUE' | 'MULTIPART_PARSE' | 'VALIDATION' | 'CACHE' | 'SOLVER' | 'RESPONSE' | 'UI_APPLICATION' | 'MULTIPLE' | 'UNKNOWN';
export interface GeometryBackendResultV01 { geometry_request_id: string; spatial_evidence: SpatialEvidenceV02; cache_status: 'CACHE_HIT' | 'CACHE_MISS'; diagnostics: Record<string, unknown>; timing_ms: Record<string, number>; payload_bytes: number; }
export interface GeometryBackendErrorV01 { status: number | null; code: string; message: string; details: unknown; content_type: string | null; }
export type GeometryBackendRequestState = 'NOT_REQUESTED' | 'REQUESTING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
export interface GeometryFramePayloadEvidenceV01 { frame_id: string; source_width: number; source_height: number; working_width: number; working_height: number; encoded_bytes: number; frame_sha256: string; }
export interface ClientGeometryTraceV01 {
  scan_complete_at: number | null; geometry_selection_start: number | null; geometry_selection_end: number | null;
  resize_start: number | null; resize_end: number | null; jpeg_encode_start: number | null; jpeg_encode_end: number | null;
  hash_start: number | null; hash_end: number | null; multipart_build_start: number | null; multipart_build_end: number | null;
  fetch_start: number | null; response_headers_at: number | null; response_body_done_at: number | null; spatial_evidence_applied_at: number | null;
}
export interface ClientGeometryTimingV01 {
  frame_selection_ms: number; resize_ms: number; encode_ms: number; hash_ms: number; multipart_build_ms: number;
  network_wait_ms: number | null; response_read_ms: number | null; client_apply_ms: number | null; fetch_ms: number | null;
  backend_processing_ms: number | null; transport_and_queue_remainder_ms: number | null; total_e2e_ms: number | null;
}
export interface GeometryBackendRequestEvidenceV01 {
  geometry_request_id: string | null; request_state: GeometryBackendRequestState; cancellation_reason?: 'CLIENT_SUPERSEDED'; http_status: number | null; error: GeometryBackendErrorV01 | null;
  payload: { scan_id: string; frame_set_hash: string; frame_count: number; frame_dimensions: GeometryFramePayloadEvidenceV01[]; total_bytes: number; } | null;
  client_trace: ClientGeometryTraceV01; timing: ClientGeometryTimingV01; primary_latency_family: PrimaryLatencyFamily;
  spatial_evidence: SpatialEvidenceV02 | null; cache_status?: GeometryBackendResultV01['cache_status']; backend_diagnostics?: Record<string, unknown>; backend_timing_ms?: Record<string, number>;
}
export interface GeometryClientTraceSeed { scan_complete_at: number; geometry_selection_start: number; geometry_selection_end: number; }

export class GeometryBackendRequestError extends Error {
  constructor(readonly evidence: GeometryBackendRequestEvidenceV01) { super(evidence.error?.message ?? 'FIRST_PARTY_GEOMETRY_REQUEST_FAILED'); this.name = 'GeometryBackendRequestError'; }
}

const pixelFrameToJpeg = (frame: PixelFrame): Promise<Blob> => new Promise((resolve, reject) => {
  const canvas = document.createElement('canvas'); canvas.width = frame.width; canvas.height = frame.height;
  canvas.getContext('2d')!.putImageData(new ImageData(new Uint8ClampedArray(frame.data), frame.width, frame.height), 0, 0);
  canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('GEOMETRY_FRAME_JPEG_ENCODE_FAILED')), 'image/jpeg', .78);
});

const duration = (start: number | null, end: number | null): number | null => start === null || end === null ? null : Math.max(0, end - start);
const requestId = (): string => globalThis.crypto?.randomUUID?.() ?? `geometry-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const emptyTrace = (): ClientGeometryTraceV01 => ({ scan_complete_at: null, geometry_selection_start: null, geometry_selection_end: null, resize_start: null, resize_end: null, jpeg_encode_start: null, jpeg_encode_end: null, hash_start: null, hash_end: null, multipart_build_start: null, multipart_build_end: null, fetch_start: null, response_headers_at: null, response_body_done_at: null, spatial_evidence_applied_at: null });
const emptyTiming = (): ClientGeometryTimingV01 => ({ frame_selection_ms: 0, resize_ms: 0, encode_ms: 0, hash_ms: 0, multipart_build_ms: 0, network_wait_ms: null, response_read_ms: null, client_apply_ms: null, fetch_ms: null, backend_processing_ms: null, transport_and_queue_remainder_ms: null, total_e2e_ms: null });

export const emptyGeometryBackendEvidence = (): GeometryBackendRequestEvidenceV01 => ({ geometry_request_id: null, request_state: 'NOT_REQUESTED', http_status: null, error: null, payload: null, client_trace: emptyTrace(), timing: emptyTiming(), primary_latency_family: 'UNKNOWN', spatial_evidence: null });

export const classifyPrimaryLatency = (timing: ClientGeometryTimingV01, backend: Record<string, number> = {}): PrimaryLatencyFamily => {
  const candidates: [PrimaryLatencyFamily, number][] = [
    ['CLIENT_PREPARATION', timing.frame_selection_ms + timing.resize_ms + timing.hash_ms + timing.multipart_build_ms],
    ['CLIENT_ENCODING', timing.encode_ms], ['TRANSPORT', timing.transport_and_queue_remainder_ms ?? 0],
    ['SERVER_BODY_RECEIVE', Number(backend.body_receive_ms ?? 0)], ['MULTIPART_PARSE', Number(backend.multipart_parse_ms ?? 0)],
    ['VALIDATION', Number(backend.validation_ms ?? 0)], ['CACHE', Number(backend.cache_ms ?? 0)], ['SOLVER', Number(backend.solver_ms ?? 0)],
    ['RESPONSE', Number(backend.response_serialize_ms ?? 0) + (timing.response_read_ms ?? 0)], ['UI_APPLICATION', timing.client_apply_ms ?? 0],
  ];
  const ordered = candidates.sort((a, b) => b[1] - a[1]); const first = ordered[0], second = ordered[1];
  if (!first || first[1] <= 0) return 'UNKNOWN';
  if (second && second[1] >= first[1] * .8) return 'MULTIPLE';
  return first[0];
};

export const markSpatialEvidenceApplied = (evidence: GeometryBackendRequestEvidenceV01, appliedAt = performance.now()): GeometryBackendRequestEvidenceV01 => {
  const trace = { ...evidence.client_trace, spatial_evidence_applied_at: appliedAt };
  const timing = { ...evidence.timing, client_apply_ms: duration(trace.response_body_done_at, appliedAt), total_e2e_ms: duration(trace.scan_complete_at, appliedAt) };
  return { ...evidence, client_trace: trace, timing, primary_latency_family: classifyPrimaryLatency(timing, evidence.backend_timing_ms) };
};

export const normalizeGeometryHttpError = async (response: Response): Promise<GeometryBackendErrorV01> => {
  const contentType = response.headers.get('content-type'); const body = await response.text(); let details: unknown = body; let code = `HTTP_${response.status}`; let message = response.statusText || code;
  if (body && contentType?.toLowerCase().includes('json')) {
    try { const parsed = JSON.parse(body) as Record<string, unknown>; details = parsed; code = typeof parsed.error === 'string' ? parsed.error : code; message = typeof parsed.message === 'string' ? parsed.message : code; } catch { /* retain text fallback */ }
  } else if (body) message = body;
  return { status: response.status, code, message, details, content_type: contentType };
};

const normalizeGeometryHttpErrorBody = (response: Response, body: string): GeometryBackendErrorV01 => {
  const contentType = response.headers.get('content-type'); let details: unknown = body; let code = `HTTP_${response.status}`; let message = response.statusText || code;
  if (body && contentType?.toLowerCase().includes('json')) { try { const parsed = JSON.parse(body) as Record<string, unknown>; details = parsed; code = typeof parsed.error === 'string' ? parsed.error : code; message = typeof parsed.message === 'string' ? parsed.message : code; } catch { /* text fallback */ } }
  else if (body) message = body;
  return { status: response.status, code, message, details, content_type: contentType };
};

export const analyzeWithFirstPartyBackend = async (input: SceneScanGeometryInputV01, precheck: SpatialPrecheckV01, cameraModel: CameraModelEvidenceV01, signal: AbortSignal, traceSeed: GeometryClientTraceSeed, onPrepared?: (evidence: GeometryBackendRequestEvidenceV01) => void): Promise<GeometryBackendRequestEvidenceV01> => {
  if (input.frames.length < 3 || input.frames.length > 8) throw new Error('GEOMETRY_FRAME_COUNT_OUT_OF_BOUNDS');
  const geometryRequestId = requestId();
  const trace: ClientGeometryTraceV01 = { ...emptyTrace(), ...traceSeed, resize_start: input.frames.reduce<number | null>((value, frame) => frame.resize_started_at === null ? value : Math.min(value ?? frame.resize_started_at, frame.resize_started_at), null), resize_end: input.frames.reduce<number | null>((value, frame) => frame.resize_ended_at === null ? value : Math.max(value ?? frame.resize_ended_at, frame.resize_ended_at), null) };
  const timing = emptyTiming(); timing.frame_selection_ms = duration(trace.geometry_selection_start, trace.geometry_selection_end) ?? 0; timing.resize_ms = input.frames.reduce((sum, frame) => sum + frame.resize_ms, 0);
  trace.jpeg_encode_start = performance.now(); const encoded = await Promise.all(input.frames.map(frame => pixelFrameToJpeg(frame.pixels))); trace.jpeg_encode_end = performance.now(); timing.encode_ms = duration(trace.jpeg_encode_start, trace.jpeg_encode_end) ?? 0;
  trace.hash_start = performance.now(); const buffers = await Promise.all(encoded.map(blob => blob.arrayBuffer())); const frameHashes = await Promise.all(buffers.map(buffer => sha256Hex(buffer)));
  const frameSetHash = await frameSetSha256(input.frames.map((frame, index) => ({ frame_id: frame.frame_id, frame_sha256: frameHashes[index]! }))); trace.hash_end = performance.now(); timing.hash_ms = duration(trace.hash_start, trace.hash_end) ?? 0;
  const frameMetadata: SelectedGeometryFrameV01[] = input.frames.map((frame, index) => ({ frame_id: frame.frame_id, timestamp_ms: frame.timestamp_ms, relative_yaw_deg: frame.relative_yaw_deg, orientation_source: frame.orientation_source, width: frame.width, height: frame.height, source_width: frame.source_width, source_height: frame.source_height, working_width: frame.width, working_height: frame.height, encoded_bytes: encoded[index]!.size, frame_sha256: frameHashes[index]!, quality: frame.technical_quality, file_field: `frame_${index}` }));
  const metadata: SceneGeometryRequestV01 = { schema: 'xfx.scene-geometry-request', schema_version: '0.1', geometry_request_id: geometryRequestId, scan_id: input.source_sweep_id, frame_set_hash: frameSetHash, geometry_version: 'p2-backend-v0.2', platform: 'h5', camera_model_evidence: cameraModel, client_precheck: precheck, selected_geometry_frames: frameMetadata, privacy: { raw_video_upload: 0, frame_stream_upload: 0, provider_upload: 0, luna_upload: 0, selected_geometry_frame_upload: 'FIRST_PARTY_BACKEND_ONLY' } };
  const metadataJson = JSON.stringify(metadata); const totalBytes = encoded.reduce((sum, blob) => sum + blob.size, 0) + new Blob([metadataJson]).size;
  const payload: NonNullable<GeometryBackendRequestEvidenceV01['payload']> = { scan_id: input.source_sweep_id, frame_set_hash: frameSetHash, frame_count: encoded.length, frame_dimensions: frameMetadata.map(frame => ({ frame_id: frame.frame_id, source_width: frame.source_width, source_height: frame.source_height, working_width: frame.working_width, working_height: frame.working_height, encoded_bytes: frame.encoded_bytes, frame_sha256: frame.frame_sha256 })), total_bytes: totalBytes };
  const base = (): GeometryBackendRequestEvidenceV01 => ({ geometry_request_id: geometryRequestId, request_state: 'REQUESTING', http_status: null, error: null, payload, client_trace: { ...trace }, timing: { ...timing }, primary_latency_family: 'UNKNOWN', spatial_evidence: null });
  if (totalBytes > 5.5 * 1024 * 1024) throw new GeometryBackendRequestError({ ...base(), request_state: 'FAILED', error: { status: null, code: 'GEOMETRY_PAYLOAD_OUT_OF_BOUNDS', message: 'GEOMETRY_PAYLOAD_OUT_OF_BOUNDS', details: { total_bytes: totalBytes }, content_type: null }, timing: { ...timing, total_e2e_ms: duration(trace.scan_complete_at, performance.now()) } });
  trace.multipart_build_start = performance.now(); const form = new FormData(); form.append('metadata', metadataJson); encoded.forEach((blob, index) => form.append(`frame_${index}`, blob, `${frameMetadata[index]!.frame_id}.jpg`)); trace.multipart_build_end = performance.now(); timing.multipart_build_ms = duration(trace.multipart_build_start, trace.multipart_build_end) ?? 0; onPrepared?.(base());
  trace.fetch_start = performance.now();
  try {
    const response = await fetch('/scene-spatial/geometry/analyze', { method: 'POST', body: form, signal, credentials: 'same-origin' }); trace.response_headers_at = performance.now();
    const body = await response.text(); trace.response_body_done_at = performance.now(); timing.network_wait_ms = duration(trace.fetch_start, trace.response_headers_at); timing.response_read_ms = duration(trace.response_headers_at, trace.response_body_done_at); timing.fetch_ms = duration(trace.fetch_start, trace.response_body_done_at);
    if (!response.ok) { const error = normalizeGeometryHttpErrorBody(response, body); throw new GeometryBackendRequestError({ ...base(), request_state: 'FAILED', http_status: response.status, error, timing: { ...timing, total_e2e_ms: duration(trace.scan_complete_at, trace.response_body_done_at) } }); }
    const result = JSON.parse(body) as GeometryBackendResultV01; const backendProcessing = Number(result.timing_ms.body_receive_ms ?? 0) + Number(result.timing_ms.backend_total_after_body_received_ms ?? result.timing_ms.total_compute ?? 0); timing.backend_processing_ms = backendProcessing; timing.transport_and_queue_remainder_ms = Math.max(0, (timing.fetch_ms ?? 0) - backendProcessing); timing.total_e2e_ms = duration(trace.scan_complete_at, trace.response_body_done_at);
    return { ...base(), request_state: 'SUCCEEDED', http_status: response.status, timing: { ...timing }, primary_latency_family: classifyPrimaryLatency(timing, result.timing_ms), spatial_evidence: result.spatial_evidence, cache_status: result.cache_status, backend_diagnostics: result.diagnostics, backend_timing_ms: result.timing_ms };
  } catch (error) {
    if (error instanceof GeometryBackendRequestError) throw error;
    const cancelled = signal.aborted; const ended = performance.now();
    throw new GeometryBackendRequestError({ ...base(), request_state: cancelled ? 'CANCELLED' : 'FAILED', cancellation_reason: cancelled ? 'CLIENT_SUPERSEDED' : undefined, error: cancelled ? null : { status: null, code: 'NETWORK_ERROR', message: error instanceof Error ? error.message : String(error), details: null, content_type: null }, timing: { ...timing, fetch_ms: duration(trace.fetch_start, ended), total_e2e_ms: duration(trace.scan_complete_at, ended) } });
  }
};

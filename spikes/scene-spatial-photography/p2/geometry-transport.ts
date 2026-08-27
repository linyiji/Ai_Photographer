export const GEOMETRY_TARGET_LONG_EDGE = 640;

export interface BoundedImageSize { width: number; height: number; }
export interface OrderedFrameHash { frame_id: string; frame_sha256: string; }

export const boundedLongEdgeSize = (sourceWidth: number, sourceHeight: number, targetLongEdge = GEOMETRY_TARGET_LONG_EDGE): BoundedImageSize => {
  if (!Number.isFinite(sourceWidth) || !Number.isFinite(sourceHeight) || sourceWidth <= 0 || sourceHeight <= 0 || targetLongEdge <= 0) throw new Error('GEOMETRY_SOURCE_DIMENSIONS_INVALID');
  const scale = Math.min(1, targetLongEdge / Math.max(sourceWidth, sourceHeight));
  return { width: Math.max(1, Math.round(sourceWidth * scale)), height: Math.max(1, Math.round(sourceHeight * scale)) };
};

const hex = (buffer: ArrayBuffer): string => [...new Uint8Array(buffer)].map(value => value.toString(16).padStart(2, '0')).join('');

export const sha256Hex = async (bytes: ArrayBuffer): Promise<string> => hex(await crypto.subtle.digest('SHA-256', bytes));

export const canonicalFrameSetBytes = (frames: readonly OrderedFrameHash[]): Uint8Array => {
  const canonical = frames.map(frame => [frame.frame_id, frame.frame_sha256.toLowerCase()]);
  return new TextEncoder().encode(JSON.stringify(canonical));
};

export const frameSetSha256 = async (frames: readonly OrderedFrameHash[]): Promise<string> => sha256Hex(canonicalFrameSetBytes(frames).buffer as ArrayBuffer);

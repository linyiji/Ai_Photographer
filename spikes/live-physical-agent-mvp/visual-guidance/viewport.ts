import type { NormalizedBox } from './types.js';

export interface CoverViewport {
  container_width: number;
  container_height: number;
  source_width: number;
  source_height: number;
  mirrored: boolean;
}

export interface CssBox { left: number; top: number; width: number; height: number }

export function projectBoxToCover(box: NormalizedBox, viewport: CoverViewport): CssBox {
  const cw = Math.max(1, viewport.container_width); const ch = Math.max(1, viewport.container_height);
  const sw = Math.max(1, viewport.source_width); const sh = Math.max(1, viewport.source_height);
  const scale = Math.max(cw / sw, ch / sh); const renderedWidth = sw * scale; const renderedHeight = sh * scale;
  const offsetX = (cw - renderedWidth) / 2; const offsetY = (ch - renderedHeight) / 2;
  const sourceLeft = viewport.mirrored ? 1 - box.left - box.width : box.left;
  return { left: sourceLeft * renderedWidth + offsetX, top: box.top * renderedHeight + offsetY, width: box.width * renderedWidth, height: box.height * renderedHeight };
}

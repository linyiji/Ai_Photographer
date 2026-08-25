import { createSyntheticFixture } from "../fixtures/synthetic";
import { FixtureMaskProvider, toRendererMasks } from "../mask/semantic";
import { Canvas2DFineTuneRenderer } from "./cpuRenderer";
import type { WorkerExportRequest, WorkerExportResponse } from "./workerProtocol";

const worker = self as unknown as {
  addEventListener(type: "message", listener: (event: MessageEvent<WorkerExportRequest>) => void): void;
  postMessage(message: WorkerExportResponse): void;
};
const renderer = new Canvas2DFineTuneRenderer();

worker.addEventListener("message", async (event: MessageEvent<WorkerExportRequest>) => {
  const request = event.data;
  try {
    const source = request.synthetic
      ? createSyntheticFixture("busy-background", request.synthetic.width, request.synthetic.height)
      : request.source;
    if (!source) throw new Error("Worker export source missing");
    const maskSet = request.synthetic?.needsSemanticMask ? await new FixtureMaskProvider().create(source) : undefined;
    const masks = maskSet ? toRendererMasks(maskSet, source.width, source.height) : request.masks;
    const rendered = renderer.render(source, request.recipe, masks, { mode: "final" });
    const canvas = new OffscreenCanvas(rendered.width, rendered.height);
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Worker OffscreenCanvas 2D unavailable");
    context.putImageData(new ImageData(rendered.data, rendered.width, rendered.height), 0, 0);
    const encodeStarted = performance.now();
    const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: Math.max(0.5, Math.min(1, request.quality)) });
    const response: WorkerExportResponse = { id: request.id, ok: true, result: {
      width: rendered.width, height: rendered.height, assetId: rendered.assetId,
      renderMs: rendered.renderMs, encodeMs: performance.now() - encodeStarted,
      backend: rendered.backend, blob, mime: "image/jpeg", byteSize: blob.size,
    } };
    worker.postMessage(response);
  } catch (error) {
    const response: WorkerExportResponse = { id: request.id, ok: false, error: (error as Error).message };
    worker.postMessage(response);
  }
});

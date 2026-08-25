import type { AdjustmentRecipe, OptionalMaskSet, SourceImage } from "../types/model";
import type { WorkerExportArtifact, WorkerExportRequest, WorkerExportResponse } from "./workerProtocol";

export const workerFinalExportSupported = (): boolean =>
  typeof Worker !== "undefined" && typeof OffscreenCanvas !== "undefined";

export class WorkerFinalExporter {
  private sequence = 0;
  private readonly pending = new Map<number, { resolve: (result: WorkerExportArtifact) => void; reject: (error: Error) => void }>();
  private constructor(private readonly worker: Worker) {
    worker.addEventListener("message", (event: MessageEvent<WorkerExportResponse>) => {
      const pending = this.pending.get(event.data.id); if (!pending) return;
      this.pending.delete(event.data.id);
      if (event.data.ok) pending.resolve(event.data.result); else pending.reject(new Error(event.data.error));
    });
    worker.addEventListener("error", (event) => {
      for (const pending of this.pending.values()) pending.reject(new Error(event.message || "Final export Worker failed"));
      this.pending.clear();
    });
  }
  static create(): WorkerFinalExporter | undefined {
    if (!workerFinalExportSupported()) return undefined;
    return new WorkerFinalExporter(new Worker(new URL("./finalExport.worker.ts", import.meta.url), { type: "module" }));
  }
  exportJpeg(source: SourceImage, recipe: AdjustmentRecipe, masks?: OptionalMaskSet, quality = 0.92): Promise<WorkerExportArtifact> {
    const sourceCopy = { ...source, data: new Uint8ClampedArray(source.data) };
    const masksCopy: OptionalMaskSet | undefined = masks ? {
      person: masks.person ? new Float32Array(masks.person) : undefined,
      background: masks.background ? new Float32Array(masks.background) : undefined,
      face: masks.face ? new Float32Array(masks.face) : undefined,
      skin: masks.skin ? new Float32Array(masks.skin) : undefined,
    } : undefined;
    const transfer: Transferable[] = [sourceCopy.data.buffer];
    for (const mask of Object.values(masksCopy ?? {})) if (mask) transfer.push(mask.buffer);
    return this.run({ recipe, quality, source: sourceCopy, masks: masksCopy }, transfer);
  }
  exportSynthetic(width: number, height: number, recipe: AdjustmentRecipe, needsSemanticMask: boolean, quality = 0.92): Promise<WorkerExportArtifact> {
    return this.run({ recipe, quality, synthetic: { width, height, needsSemanticMask } });
  }
  private run(request: Omit<WorkerExportRequest, "id">, transfer: Transferable[] = []): Promise<WorkerExportArtifact> {
    const id = ++this.sequence;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.worker.postMessage({ ...request, id } satisfies WorkerExportRequest, transfer);
    });
  }
}

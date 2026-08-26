export const WORKER_INITIALIZATION_TIMEOUT_MS = 120_000;

export class WorkerInitializationTimeoutError extends Error {
  constructor(timeoutMs = WORKER_INITIALIZATION_TIMEOUT_MS) {
    super(`Pose worker initialization timed out after ${Math.round(timeoutMs / 1000)}s; the model/WASM download was not restarted.`);
    this.name = 'WorkerInitializationTimeoutError';
  }
}

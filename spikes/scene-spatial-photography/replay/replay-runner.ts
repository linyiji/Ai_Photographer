import { ControlledFixtureOrientationProvider } from '../motion/fixture-orientation-provider.js';
import { SceneSweepRuntime } from '../sweep/sweep-runtime.js';
import type { SweepMode } from '../sweep/types.js';
import type { ReplayPoint } from '../fixtures/replay-fixtures.js';
import { YawMap } from '../spatial/yaw-map.js';

const metrics = (point: ReplayPoint) => ({ timestamp_ms: point.t, width: 640, height: 480, blur_score: point.quality === 'blurred' ? 2 : 30, exposure_mean: point.quality === 'underexposed' ? 4 : point.quality === 'overexposed' ? 252 : 128, highlight_clipping_ratio: point.quality === 'overexposed' ? .9 : 0, shadow_clipping_ratio: point.quality === 'underexposed' ? .9 : 0, fingerprint: point.quality === 'duplicate' ? [1, 0] : [Math.abs(point.yaw % 30) / 30, 1 - Math.abs(point.yaw % 30) / 30] });
export const runReplay = async (points: readonly ReplayPoint[], mode: SweepMode = 'QUICK_SWEEP') => {
  const runtime = new SceneSweepRuntime(mode, `fixture-${mode.toLowerCase()}`, 0); const provider = new ControlledFixtureOrientationProvider(); await provider.requestPermission();
  provider.start((sample) => { runtime.observeOrientation(sample); runtime.observeFrame({ ...metrics(points.find((p) => p.t === sample.timestamp_ms) ?? { t: sample.timestamp_ms, yaw: sample.relative_yaw_deg }), yaw_deg: sample.relative_yaw_deg }); });
  for (const point of points) provider.emit(point.yaw, point.t, ((point.yaw % 360) + 360) % 360); provider.stop();
  if (runtime.session.status !== 'COMPLETE') runtime.finish(points.at(-1)?.t ?? 0);
  const manifest = runtime.manifest(); return { manifest, yaw_map: new YawMap(manifest.ordered_keyframes).serialize(), coverage: runtime.coverage.snapshot(), rejections: runtime.sampler.rejections };
};

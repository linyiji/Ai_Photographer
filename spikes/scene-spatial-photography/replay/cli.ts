import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { replayFixtures } from '../fixtures/replay-fixtures.js';
import { analyzeSceneSweep } from '../p1/analyze-scene-sweep.js';
import { p1ReplayFixtures } from '../p1/replay-fixtures.js';
import { runReplay } from './replay-runner.js';
const output = resolve(process.cwd(), 'evidence/p0/generated-replay');
await mkdir(output, { recursive: true });
for (const [name, fixture] of Object.entries(replayFixtures)) await writeFile(resolve(output, `${name}.json`), JSON.stringify(await runReplay(fixture, name === 'wide180' ? 'WIDE_SWEEP' : 'QUICK_SWEEP'), null, 2) + '\n');
const p1Output = resolve(process.cwd(), 'evidence/p1/generated-replay');
await mkdir(p1Output, { recursive: true });
for (const [name, fixture] of Object.entries(p1ReplayFixtures)) {
  const result = analyzeSceneSweep(fixture.manifest, fixture.yaw_map, fixture.transient_keyframes, fixture.intent);
  await writeFile(resolve(p1Output, `${name}.json`), JSON.stringify({ context: result.context, opportunities: result.opportunities, descriptors: result.descriptors }, null, 2) + '\n');
}
console.log(`Replay PASS: P0 ${Object.keys(replayFixtures).length} + P1 ${Object.keys(p1ReplayFixtures).length} deterministic fixtures`);

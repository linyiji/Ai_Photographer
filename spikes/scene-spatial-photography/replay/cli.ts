import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { replayFixtures } from '../fixtures/replay-fixtures.js';
import { runReplay } from './replay-runner.js';
const output = resolve(process.cwd(), 'evidence/p0/generated-replay');
await mkdir(output, { recursive: true });
for (const [name, fixture] of Object.entries(replayFixtures)) await writeFile(resolve(output, `${name}.json`), JSON.stringify(await runReplay(fixture, name === 'wide180' ? 'WIDE_SWEEP' : 'QUICK_SWEEP'), null, 2) + '\n');
console.log(`Replay PASS: ${Object.keys(replayFixtures).length} deterministic fixtures`);

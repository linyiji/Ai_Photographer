import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
const EXPECTED_SHA256 = '59929e1d1ee95287735ddd833b19cf4ac46d29bc7afddbbf6753c459690d574a';
const EXPECTED_SIZE = 5_777_746;
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'public/models/pose_landmarker_lite.task');

async function verify(buffer) {
  const actualHash = createHash('sha256').update(buffer).digest('hex');
  if (buffer.byteLength !== EXPECTED_SIZE || actualHash !== EXPECTED_SHA256) {
    throw new Error(`Pose model integrity mismatch: size=${buffer.byteLength}, sha256=${actualHash}`);
  }
  return actualHash;
}

let buffer;
try {
  buffer = await readFile(output);
  await verify(buffer);
  console.log(`Pose model already verified: ${output}`);
  process.exit(0);
} catch (error) {
  if (error?.code !== 'ENOENT') {
    console.warn('Existing model is missing or invalid; downloading the official pinned artifact.');
  }
}

const response = await fetch(MODEL_URL);
if (!response.ok) throw new Error(`Pose model download failed: HTTP ${response.status}`);
buffer = Buffer.from(await response.arrayBuffer());
const hash = await verify(buffer);
await mkdir(dirname(output), { recursive: true });
await writeFile(output, buffer);
console.log(`Pose model verified: size=${buffer.byteLength}, sha256=${hash}`);
console.log(`Local ignored path: ${output}`);

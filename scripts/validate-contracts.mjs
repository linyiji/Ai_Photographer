import { readFile, access } from 'node:fs/promises';
import { dirname, join, resolve, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath = join(root, 'packages', 'contracts', 'catalog.json');
const workflowPath = join(root, 'packages', 'workflow', 'workflow-v1.json');
const platformPath = join(root, 'packages', 'platform', 'catalog.json');

const requiredContracts = ['PhotographySession','WorkflowState','DomainEvent','ErrorContract','CandidateEnvelope','RealityContext','SelectedTarget','ShotDirection','FramePerception','CurrentShotState','LiveShotRuntime','CaptureAsset','CaptureDecision','RetakePlan','RealityPlusAsset','AdjustmentRecipe','MyFinalPhoto','AssetRef','AssetManifest','ScenarioManifest','EvaluationResult'];
const workflowStates = ['ENTRY','SHOOTING_RELATION_DEVICE_MODE','REALITY','TARGET','SHOT','LIVE','CAPTURE','QA','REALITY_PLUS','FINE_TUNE','FINAL'];
const qaDecisions = ['ACCEPT','ACCEPT_WITH_REPAIR','RETAKE_MICRO','RETAKE_POSE','RETAKE_FRAMING','RETAKE_POSITION','REPLAN'];
const platformCapabilities = ['CameraAdapter','FrameAdapter','AlbumAdapter','ShareAdapter','HapticAdapter','VoiceOutputAdapter','AuthAdapter','PaymentAdapter','DeviceMotionAdapter','StorageAdapter','NetworkAdapter'];
const forbidden = ['wx' + '.', 'tt' + '.', 'document' + '.', 'window' + '.'];
const forbiddenKeys = /^(password|secret|api_key|access_token|refresh_token|credential)$/i;
const absolutePathPattern = /^(?:[A-Za-z]:[\\/]|\/)/;

function assert(condition, message) { if (!condition) throw new Error(message); }
async function parseJson(path) { return JSON.parse(await readFile(path, 'utf8')); }
function collectRefs(value, refs = []) {
  if (Array.isArray(value)) value.forEach((item) => collectRefs(item, refs));
  else if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) { if (key === '$ref') refs.push(item); collectRefs(item, refs); }
  return refs;
}
function inspectValue(value, location = '$') {
  if (Array.isArray(value)) return value.forEach((item, index) => inspectValue(item, `${location}[${index}]`));
  if (!value || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value)) {
    assert(!forbiddenKeys.test(key), `secret-bearing key at ${location}.${key}`);
    if (key !== '$id' && key !== '$schema' && typeof item === 'string') assert(!absolutePathPattern.test(item), `absolute path value at ${location}.${key}`);
    inspectValue(item, `${location}.${key}`);
  }
}

const catalog = await parseJson(catalogPath);
const workflow = await parseJson(workflowPath);
const platform = await parseJson(platformPath);
assert(catalog.ai_output_default_state === 'CANDIDATE', 'AI output default state must be CANDIDATE');

const names = catalog.contracts.map((item) => item.name);
const duplicateNames = names.length - new Set(names).size;
assert(duplicateNames === 0, 'duplicate canonical contract names');
for (const name of requiredContracts) assert(names.includes(name), `missing mandatory contract ${name}`);

const schemas = [];
let unresolvedReferences = 0;
for (const item of catalog.contracts) {
  const path = join(dirname(catalogPath), item.path);
  await access(path);
  const text = await readFile(path, 'utf8');
  for (const token of forbidden) assert(!text.includes(token), `forbidden platform API token in ${item.path}`);
  const schema = JSON.parse(text);
  assert(schema.$schema === catalog.schema_dialect, `wrong schema dialect for ${item.name}`);
  assert(schema.$id === item.schema_id, `schema identity mismatch for ${item.name}`);
  assert(schema.title === item.name, `schema title mismatch for ${item.name}`);
  assert(schema.description, `missing description for ${item.name}`);
  assert(schema.type === 'object', `${item.name} must be an object schema`);
  assert(schema.properties?.schema_version?.const === item.version, `schema version mismatch for ${item.name}`);
  assert(schema.required?.includes('schema_version'), `schema_version must be required for ${item.name}`);
  inspectValue(schema, item.name);
  for (const ref of collectRefs(schema)) {
    if (/^[a-z]+:/i.test(ref)) continue;
    const filePart = ref.split('#')[0];
    if (!filePart) continue;
    try { await access(resolve(dirname(path), filePart)); } catch { unresolvedReferences += 1; }
  }
  schemas.push(schema);
}
const ids = schemas.map((schema) => schema.$id);
assert(ids.length === new Set(ids).size, 'duplicate schema identity');
assert(unresolvedReferences === 0, `unresolved local references: ${unresolvedReferences}`);

assert(JSON.stringify(workflow.states) === JSON.stringify(workflowStates), 'workflow state set/order mismatch');
assert(qaDecisions.every((decision) => workflow.qa_decisions.includes(decision)), 'QA decision vocabulary incomplete');
assert(workflow.transitions.every((item) => workflowStates.includes(item.from) && workflowStates.includes(item.to)), 'transition references unknown state');
assert(qaDecisions.every((decision) => workflow.transitions.some((item) => item.from === 'QA' && item.action === decision)), 'QA transition missing');
for (const action of qaDecisions.filter((item) => item.startsWith('RETAKE_') || item === 'REPLAN')) {
  const transition = workflow.transitions.find((item) => item.from === 'QA' && item.action === action);
  assert(Array.isArray(transition.preserve) && transition.preserve.length > 0, `${action} must preserve valid prior state`);
}
assert(workflow.runtime_boundary.backend_per_frame_hot_path === false, 'backend per-frame hot path must be false');

const capabilityNames = platform.capabilities.map((item) => item.name);
assert(capabilityNames.length === new Set(capabilityNames).size, 'duplicate platform capability');
assert(platformCapabilities.every((name) => capabilityNames.includes(name)), 'platform catalog incomplete');
const platformText = await readFile(platformPath, 'utf8');
for (const token of forbidden) assert(!platformText.includes(token), `forbidden platform token ${token}`);
inspectValue(workflow, 'workflow');
inspectValue(platform, 'platform');

console.log('CONTRACT_CATALOG=PASS');
console.log(`MANDATORY_CONTRACT_COVERAGE=${requiredContracts.length}/${requiredContracts.length}`);
console.log('JSON_SCHEMA_VALIDATION=PASS');
console.log('UNIQUE_SCHEMA_IDENTITY=PASS');
console.log(`UNRESOLVED_LOCAL_REFERENCES=${unresolvedReferences}`);
console.log('WORKFLOW_V1=PASS');
console.log('WORKFLOW_TRANSITION_VALIDATION=PASS');
console.log('CANDIDATE_GOVERNANCE=PASS');
console.log('PLATFORM_CONTRACT_CATALOG=PASS');
console.log(`DUPLICATE_CANONICAL_CONTRACT_NAMES=${duplicateNames}`);

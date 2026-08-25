# Capture QA Real Adapter V1.0

Status: `SHADOW_IMPLEMENTED / REAL_PROVIDER_PENDING`

## Input boundary

`CaptureQAShadowService` runs only when the Session is at QA and the canonical Capture state references an accepted uploaded asset. It resolves bytes through the accepted StorageAdapter using the stable uploaded asset id. The request contains:

- accepted uploaded asset id and CaptureAsset id;
- SelectedTarget;
- ShotDirection;
- RealityContext where available;
- MIME and in-memory bytes.

CAPTURE-stage local candidates, unconfirmed stills, arbitrary paths, raw video, and frame streams are rejected before any provider call.

## Output boundary

Structured output is mapped into the existing `CandidateEnvelope` with `candidate_kind=QA`, `disposition=CANDIDATE`, evidence refs, model provenance, confidence, and a named promotion gate. The payload uses the existing CaptureDecision `technical_result` vocabulary:

```text
ACCEPT
ACCEPT_WITH_REPAIR
RETAKE_MICRO
RETAKE_POSE
RETAKE_FRAMING
RETAKE_POSITION
REPLAN
```

Local validation rejects missing/extra fields, free-text result values, malformed reasons/observations/confidence, and prohibited invented reality facts. Invalid output returns a controlled Candidate failure and does not mutate workflow truth.

## Mandatory shadow invariant

Before execution the service hashes:

- workflow stage and revision;
- Session state;
- candidates;
- assets;
- domain events.

It repeats the projection afterward and fails closed if the digest changed. Shadow output cannot advance Workflow, create CaptureDecision authority, trigger retake, mutate assets/events, or inflate revision.

Canonical QA remains the deterministic fake. The normal product UI receives no provider internals.

## Evaluation and promotion

The controlled M06 suite contains 22 synthetic metadata/image-signal cases covering good matches, framing/position/pose/plan defects, missing/occluded subject, blur, light/contrast, background, orientation, and aspect issues. Oracles compare semantics rather than exact wording and define must-detect/must-not-invent sets.

Fixture results pass all task-local metric gates, proving harness and validation behavior only. They do not satisfy the Real Provider Gate. Promotion requires a separately configured provider/model identity, bounded real run, 100% schema validity, quality/safety thresholds, provenance/cost/latency evidence, provider-free deterministic regression, and controlled user-flow acceptance.

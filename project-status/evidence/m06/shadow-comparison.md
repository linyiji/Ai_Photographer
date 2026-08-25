# M06 Capture QA Shadow Comparison

```text
Canonical Adapter = FAKE_INTERNAL_ONLY
Shadow Adapter = XFX_FIXTURE_PROVIDER / TEST_ONLY
Shadow Candidate = CandidateEnvelope kind QA / CANDIDATE
Session Stage Before = QA
Session Stage After = QA
Revision Delta = 0
State Mutation = 0
Candidate Table Mutation = 0
Asset Mutation = 0
Domain Event Mutation = 0
Canonical CaptureDecision Created = 0
Unconfirmed Still Provider Calls = 0
```

The test creates a controlled, user-authorized-style uploaded CaptureAsset, advances the existing Session to QA, resolves the binary through StorageAdapter, and executes shadow QA. A canonical digest over stage, revision, state, candidates, assets, and events is identical before and after.

An independent negative test stops a CAPTURE-stage/unconfirmed Session with `UNCONFIRMED_ASSET` before the fixture provider call count can increase.

M03 AI Lab modes:

```text
FAKE_ONLY
SHADOW_REAL
REAL_SELECTED
PROVIDER_UNAVAILABLE
PROVIDER_TIMEOUT
PROVIDER_INVALID_OUTPUT
PROVIDER_RATE_LIMIT
```

Default deterministic Replay remains FAKE_ONLY with provider calls = 0. REAL_SELECTED returns SOURCE_REQUIRED while no real provider is configured. All fault modes remain controlled and keep the selected adapter fake.

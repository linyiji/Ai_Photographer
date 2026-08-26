# Semantic Framing V2 — Automated Fixtures

Status: PASS

- Semantic-specific tests: 31/31 PASS
- Complete suite after amendment: 193/193 PASS
- Typecheck: PASS
- Production build: PASS / 27 modules
- Controlled mode classification: 6/6
- Static UPPER_BODY 5 s committed-mode flicker: 0
- Wrist extension anchor perturbation: 0 in deterministic fixture
- Wrist extension scale perturbation: 0 in deterministic fixture
- One-elbow disappearance anchor perturbation: 0
- Single-frame knee/ankle availability: no committed-mode or precision-scale direction flip
- Sustained UPPER_BODY → FULL_BODY: committed after 500 ms fixture interval
- Metric-family transition scale velocity: 0
- Ambiguous measurement precision instruction: 0
- Coarse compatibility instructions in correction denominator: 0
- Raw Pose min/max used for live precision X/scale: NO

Fixtures cover `HEAD_ONLY`, `HEAD_SHOULDERS`, `UPPER_BODY`, `THREE_QUARTER`, `FULL_BODY`, `PARTIAL_OR_AMBIGUOUS`, bottom/left/right crop, arm extension, elbow/knee/ankle loss, pair-confidence asymmetry, brief dropout, true horizontal motion, true closer/farther motion, and sustained BodyMode transition.

Automated PASS admits the OPPO Semantic Measurement Device Gate only. It does not prove OPPO Gate 1 or LIVE-P2 PASS.

# M06 Capture QA Controlled Evaluation

```text
Suite = M06_CAPTURE_QA_CONTROLLED_V1
Suite Version = 1.0.0
Case Count = 22
Provider Class = DETERMINISTIC_FIXTURE_ONLY
Prompt = capture-qa-shadow@1.0.0
Model Spec = fixture-capture-qa-v1
Real Provider Calls = 0
Fixture Provider Calls = 22
```

## Metrics

```text
Schema Valid Rate = 100%
Disposition Accuracy = 100%
Critical Must-detect Recall = 100%
Must-not-invent Violation Rate = 0%
Retake False Positive Rate = 0%
Retake False Negative Count = 0
Fixture Latency p50 = 0.018 ms
Fixture Latency p95 = 0.029 ms
Estimated Fixture Cost = 0
```

All task-local candidate thresholds pass for the deterministic harness. These numbers validate structured parsing, semantic oracle calculation, policy checks, and fault-free fixture routing; they are not real-model quality evidence and cannot promote QA.

Cases cover already-good/good-match, subject too small/large/missing, horizontal offset, blur, under/overexposure at fixable and unusable severity, low contrast, background distraction, occlusion, orientation, invalid aspect, framing, fixable light, pose, plan mismatch, combined occlusion+blur, and a low-texture non-blocker. No M05 user photo is used.

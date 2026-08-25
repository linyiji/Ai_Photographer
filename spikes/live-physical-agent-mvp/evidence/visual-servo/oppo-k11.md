# OPPO K11 Visual Servo Acceptance

Date: 2026-08-25

Device: OPPO K11 / ColorOS 15 / Chrome Mobile

Result: FAIL

This is fresh post-implementation evidence. Historical 54 Episodes / 22.2% remain baseline only and were not used in this result. Eight user-downloaded scalar-only traces (`raw_media=false`) contain 1,651 rows, 8 completed READY trials, and 59 terminal Episodes, exceeding the task's `>=20` Episode sample rule.

## Fresh A/B result

| Mode | Trials | Episodes | SUCCESS | NO_EFFECT | WRONG | Success | Instructions/trial | Avg time to target | STOP |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| TEXT_DOMINANT / DEFAULT | 3 | 21 | 6 | 13 | 2 | 28.6% | 7.0 | 17.1 s | 6 |
| VISUAL_PLUS_TEXT / LINE_DOG | 5 | 38 | 14 | 18 | 6 | 36.8% | 7.6 | 25.2 s | 13 |
| Total | 8 | 59 | 20 | 31 | 8 | **33.9%** | 7.4 | 22.2 s | 19 |

Required correction success is unchanged at `>=80%`; result is FAIL. Recalculation from scalar deltas using the unchanged engine formula gives action compliance `33/59 = 55.9%`, axis completion `20/59 = 33.9%`, and 9 overshoot-like NO_EFFECT Episodes.

## Visual measurement

- Raw box jitter mean: `0.0244`.
- Stabilized box jitter mean: `0.0144` (41.0% scalar reduction).
- Visual latency: mean `261 ms`, p50 `248 ms`, p95/max `500/500 ms`.
- Projection age: mean `78 ms`, p50 `75 ms`, p95/max `98/257 ms`.
- Subject lock loss/reacquisition: `1/2`.
- Target zone entry/exit transitions: `46/38`.

Despite numeric jitter reduction, the user judged the subject box unstable in natural use. The 500 ms visual-lag ceiling and frequent target-zone transitions are consistent with a box/status experience that is difficult to use as the primary servo signal.

## Hard-gate observations

- Subject box stable and naturally following: FAIL, user observed instability.
- Target zone obvious / understandable: FAIL. The user could only use it effectively together with text and explicitly reported that the visual zone alone was unclear.
- Direction correctness: FAIL; user observed erroneous directions. Exact visual-cue count is not encoded in the scalar trace; separately, 8 controller Episodes ended WRONG_DIRECTION.
- Post-READY ordinary instructions: FAIL, 6 ordinary instruction events occurred after a READY state in two trials.
- Obvious oscillation: FAIL, user observed it; trace also contains 46 entries and 38 exits across target-zone boundaries.
- Text still necessary: YES.
- Persistent subject-box usability issue: FAIL.
- Overlay/controller lifecycle conflict: FAIL because READY was followed by ordinary correction cues.

The post-READY defect is reproducible when an armed trial starts already inside target: runtime READY is emitted by passive confirmation while the trial remains ARMED, so later movement can create a new ordinary Episode without an explicit re-ARM.

## Performance

- Preview FPS: `29.3`
- Vision target / actual Hz: `8.0 / 6.9`
- State Hz: `6.6`
- Inference p50/p95: `66 / 80.4 ms`

These are fresh HUD readings supplied for this run; no historical P1 performance values are substituted.

## Trace integrity

All source files report `xfx-live-p2-scalar-trace-v1` and `raw_media=false`. No camera frame, video, or landmarks were committed.

| Trace | SHA-256 |
|---|---|
| 1787652746099 | `2574DA2FB3E5837A7BBE3581B64C2B88E572DEDC36C30F579A7FCF3B2A04180F` |
| 1787652794010 | `16E5A5620FB80F19DE1E9EDBF833851EEAEBCD13525902A64822990E8AF69ADD` |
| 1787652816807 | `0BF5B94554B16DF8352FA5F4F43007AFB1F0D37687664C1759FD1CF64454209D` |
| 1787652847306 | `B22981C9D1987C1C8A4A6839D5E3E2D020684EA56AE8035F3EC7868518271A45` |
| 1787652885787 | `45416F057C4EA81FC5DF9D8492BF64075B3502716F1AFE7A781C61DC4F93CEE1` |
| 1787652906575 | `DE31468210631DD4A1AA0CE96BB9B40A847485A883AAEA55A743CFD4E10D6A7D` |
| 1787652927852 | `E5937C046C7C0B48776B02574806395AA3095014A9AB759AB7878C1A54880FB8` |
| 1787653010821 | `03DD99DACCFB4D0365657CAB328FD96A5D56E6E6027FFEC008B5180A09797C59` |

## Disposition

Dominant hypothesis: `CONTROL_POLICY`, because correction success remains 33.9% and READY is not terminal for the passive-confirmation-before-first-instruction path. Secondary classifications are `MEASUREMENT` (box instability/lag) and `VISUAL_COMPREHENSION` (target zone unclear without text). Per task authority, no further automatic threshold tuning is performed. Luna remains OFF.

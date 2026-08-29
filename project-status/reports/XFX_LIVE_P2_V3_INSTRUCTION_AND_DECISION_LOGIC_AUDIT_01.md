# XFX LIVE-P2 V3 Instruction and Decision Logic Audit

Date: `2026-08-29`

Audit baseline: `9d0e648e589be42bbcd4131f278c05152b778f7c`

Scope: read-only audit of the current Live V3 measurement, controller, settle/outcome, and user-facing instruction selection logic. This report is an attachment to the active Live task. It is not a new Task, implementation change, device acceptance result, or authorization to start another phase.

## Executive conclusion

The reported message is a real semantic defect. The current source does not contain the literal copy `测量终端，保持不变，等待下一步`; its closest implemented form is:

```text
{Episode Outcome} · 保持不动，等待下一步
```

This message is selected because the last action episode is `EVALUATED`, not because the complete measurement or trial has reached a defined “wait for next step” state. The UI currently conflates three different facts:

1. the previous action episode has finished evaluation;
2. the controller is selecting or validating its next stage;
3. what the user should physically do now.

As a result, `保持不动，等待下一步` can be vague, stale, or directly inconsistent with the controller's actual release conditions.

## 1. End-to-end decision chain

```text
Camera / Pose observation
  -> Live semantic measurement
  -> V3 measurement projection
  -> freshness / stability / quality
  -> stage selection
       ACQUIRE
       FRAMING
       ALIGN_X
       VERIFY
  -> optional one-step action issue
  -> response and settle detection
  -> episode outcome
       TARGET_REACHED
       IMPROVED
       NO_EFFECT
       WRONG_DIRECTION
       INVALIDATED
  -> stage re-evaluation or READY latch
  -> presentation-copy selection
```

An Episode outcome is terminal only for one issued action. It is not a terminal state for the full trial.

## 2. V3 measurement projection

### 2.1 Freshness

A measurement is `fresh` only when all conditions hold:

- subject is present;
- coordinate basis is `SENSOR_NORMALIZED_NON_MIRRORED`;
- measurement age is at most `180 ms`;
- decision age is at most `160 ms`;
- no reacquisition barrier is active.

### 2.2 Framing relation

The compatibility layer maps:

| Compatibility result | V3 framing relation |
|---|---|
| `TOO_TIGHT` | `TOO_CLOSE` |
| `TOO_WIDE` | `TOO_FAR` |
| compatible and precision scale error within tolerance | `IN_RANGE` |
| compatible and measured scale below target | `TOO_FAR` |
| compatible and measured scale above target | `TOO_CLOSE` |
| missing or unusable precision measurement | `UNKNOWN` |

Scale is not one universal fixed threshold. It depends on semantic Body Mode, calibration availability, precision validity, target scale, and tolerance.

### 2.3 Horizontal relation

X is usable only when the subject is present, precision-X is valid, and the anchor is finite.

For the current centered target (`target X = 0.500`, tolerance approximately `0.050`):

| Sensor-normalized subject X | Relation |
|---|---|
| `< 0.450` | `TOO_LEFT` |
| `0.450 - 0.550` | `IN_RANGE` |
| `> 0.550` | `TOO_RIGHT` |
| invalid/missing | `UNKNOWN` |

The measurement coordinate is sensor-normalized and non-mirrored. User-action wording is derived separately so the front-camera preview mirror must not be reused as the control coordinate.

### 2.4 Quality

| Quality | Meaning |
|---|---|
| `GOOD` | framing usable and stable, current precision requirements satisfied, and measurement fresh |
| `MARGINAL` | framing usable, but freshness, stability, or precision is incomplete |
| `INVALID` | subject/framing is not usable for control |

The V3 policy is framing-first. While framing is out of range, X may be invalid without preventing a valid framing action. Once framing is in range, valid X becomes mandatory.

## 3. Controller stage selection

The controller selects stages in this order:

| Priority | Condition | Stage |
|---:|---|---|
| 1 | subject absent, quality invalid, not fresh, or framing unknown | `ACQUIRE` |
| 2 | framing is not in range | `FRAMING` |
| 3 | framing in range but X unknown | `ACQUIRE` |
| 4 | framing in range and X out of range | `ALIGN_X` |
| 5 | framing and X both in range | `VERIFY` |

Additional controller states:

- not armed: `DISARMED`;
- READY already latched: `READY_LATCHED`;
- three consecutive `NO_EFFECT`/`WRONG_DIRECTION`: `PAUSED`;
- a paused controller resumes only after fresh, stable, non-invalid evidence is continuously available for `1200 ms`.

## 4. Action issue conditions and instructions

A new ordinary action is allowed only when:

- the trial is armed and not READY;
- measurement is fresh and stable;
- quality is not `INVALID`;
- the state version is newer than the last evaluated version;
- the selected stage persists for at least `250 ms`;
- no active retry barrier blocks issuance.

| Stage/relation | Action | Current instruction |
|---|---|---|
| `FRAMING / TOO_CLOSE` | `MOVE_FARTHER_SMALL` | `退后一小步，让更多上半身进入画面` |
| `FRAMING / TOO_FAR` | `MOVE_CLOSER_SMALL` | `靠近一小步，让人物更接近目标大小` |
| `ALIGN_X / TOO_LEFT` | `MOVE_LEFT_SMALL` | `向你自己的左侧移动一小步` |
| `ALIGN_X / TOO_RIGHT` | `MOVE_RIGHT_SMALL` | `向你自己的右侧移动一小步` |

The displayed action is suffixed with `做一次小调整后自然停下`.

## 5. Response, settle, and timeout logic

After an action is issued, the Episode follows `ISSUED -> WAIT_FOR_SETTLE -> EVALUATED`.

### 5.1 Evidence invalidation

The Episode immediately becomes `INVALIDATED` when any of the following occurs:

- subject is lost;
- measurement is not fresh;
- quality becomes `INVALID`;
- the comparison key changes or disappears.

### 5.2 Movement evidence

Movement is considered observed when either condition holds:

- relevant motion is neither `STILL` nor `UNKNOWN`;
- normalized error changes by at least `0.08`.

### 5.3 Settle eligibility

Evaluation becomes eligible when measurement is stable and either:

- movement has been observed; or
- the `900 ms` response grace period has elapsed.

The stable window is `375 ms`. Before eligibility, reaching approximately `4500 ms` invalidates the Episode.

Important consequence: an Episode can settle after the response grace period even when no movement was observed. That enables `NO_EFFECT` classification, but makes the UI wording especially important because “no detected response” and “response completed” are different user situations.

## 6. Episode outcome classification

| Outcome | Condition |
|---|---|
| `TARGET_REACHED` | evaluated relation has entered `IN_RANGE` |
| `IMPROVED` | normalized error reduction is at least `max(0.18, 15% of starting error)` |
| `WRONG_DIRECTION` | normalized error increase reaches the same threshold |
| `NO_EFFECT` | valid evaluation exists, but change does not meet improvement or regression threshold |
| `INVALIDATED` | required evidence is missing, stale, lost, or no longer comparable |

When normalized errors are unavailable, the controller falls back to relation changes and then scalar position changes. A signed relative scalar change of at least `15%` is improvement; at most `-15%` is wrong direction; otherwise it is no effect.

`NO_EFFECT` and `WRONG_DIRECTION` increment consecutive failure count. Three consecutive failures enter `PAUSED`. `INVALIDATED` is excluded from the action-effectiveness denominator.

## 7. Retry barrier

After `NO_EFFECT` or `WRONG_DIRECTION`, ordinary reissue is blocked until at least one causal change occurs:

- the relation changes;
- relevant motion becomes non-still/non-unknown;
- relevant scalar position changes by at least `0.025`.

The UI can retain the previous corrective action as a reminder, but that reminder is not a newly counted instruction.

This creates a direct semantic conflict with a generic `保持不动`: holding still can prevent the retry barrier from releasing when the controller actually needs new physical evidence.

## 8. VERIFY and READY

The controller enters `VERIFY` only when both framing and X are `IN_RANGE`.

READY requires all of the following to remain true continuously for approximately `600 ms`:

- framing is `IN_RANGE`;
- X is `IN_RANGE`;
- quality is `GOOD`;
- measurement is fresh;
- measurement is stable.

The timer resets when any condition is lost. On success, the controller enters `READY_LATCHED` and displays `好，就这里`. READY is latched and no subsequent ordinary action should be issued in the same trial.

## 9. Exact presentation-copy precedence

The current primary instruction selector uses this precedence:

| Order | Condition | Display |
|---:|---|---|
| 1 | not armed | `模型已就绪 · 点击“ARM 新试验”开始` |
| 2 | READY latched | `好，就这里` |
| 3 | stored outcome `NO_EFFECT` and retained action | `未检测到有效调整 · {action}，然后停下` |
| 4 | stored outcome `WRONG_DIRECTION` and retained action | `刚才方向相反 · {action}，然后停下` |
| 5 | a current/retained action copy exists | `{action} · 做一次小调整后自然停下` |
| 6 | stage `ACQUIRE`, stored outcome `INVALIDATED` | `测量中断 · 请保持人物可见并站稳` |
| 7 | stage `ACQUIRE`, otherwise | `保持片刻 · 正在确认人物与测量` |
| 8 | stored Episode state `EVALUATED` | `{outcome or 已评估} · 保持不动，等待下一步` |
| 9 | fallback | `保持不动 · 正在确认结果` |

The visual tracking layer has a separate copy selector:

| Condition | Visual tracking copy |
|---|---|
| READY | READY visual |
| action exists | one-small-adjustment visual |
| `ACQUIRE` | measurement-confirmation visual |
| otherwise | `保持不动 · 正在确认结果` |

Because these two selectors are independent, the main instruction and the visual overlay can describe different semantic moments.

## 10. Confirmed defects

### D1. `EVALUATED` is treated as a user-action state

`EVALUATED` only records that one Episode was classified. It does not say whether the controller is verifying READY, switching axes, waiting for persistence, waiting for freshness, or blocked by retry logic. The generic copy therefore lacks a valid one-to-one state meaning.

### D2. Outcome and Episode are sticky

When there is no active Episode, the snapshot retains `lastEpisode` and its outcome. A historical result can therefore influence later presentation after the controller has already moved to another stage.

### D3. Success outcome is not full-trial success

`TARGET_REACHED` may mean only that the current axis reached its target. For example, framing can succeed while X still needs correction. Showing `TARGET_REACHED · 保持不动，等待下一步` hides which axis succeeded and what is now being verified.

### D4. `保持不动` can contradict the retry barrier

The retry barrier may require new movement or scalar change. Telling the user to remain still can make the condition impossible to release through normal behavior.

### D5. Internal diagnostic enums leak into user copy

`TARGET_REACHED`, `IMPROVED`, and `INVALIDATED` are diagnostic terms, not human guidance. They should remain in HUD/telemetry rather than prefixing the primary instruction.

### D6. Invalidated state can remain semantically stale

Because the last outcome is retained, an old `INVALIDATED` result can survive after measurement recovery. Depending on the new stage and copy precedence, stale diagnostic state can be presented as current guidance.

### D7. Main instruction and visual overlay are not driven by one presentation state

Two separate precedence trees can produce duplicated or apparently inconsistent instructions.

## 11. Recommended presentation-state mapping

This is a bounded recommendation, not an implemented change.

| Controller truth | Recommended user instruction |
|---|---|
| action issued, response not yet detected | `按提示移动一小步，然后自然停下` |
| relevant movement detected, waiting to settle | `已检测到移动，请自然停下` |
| settled, outcome calculation in progress | `正在确认这次调整` |
| framing succeeded, X still pending | `距离合适，正在确认水平位置` |
| X succeeded, framing still pending | `水平位置合适，正在确认距离` |
| both axes in range, READY hold not complete | `位置合适，请保持片刻` |
| retry barrier requires new evidence | `请再做一次小幅调整` plus the explicit direction |
| subject/evidence invalid | `人物测量中断，请保持完整可见并站稳` |
| READY latched | `好，就这里` |

The primary instruction should be produced from an explicit presentation state composed from current stage, active Episode substate, current outcome applicability, retry-barrier state, and READY hold state. Historical Episode diagnostics should not directly drive current user action copy.

## 12. Required correction boundaries

Any bounded correction should preserve:

- the framing-first V3 control order;
- current target and deadband semantics;
- `AXIS_TARGET_SUCCESS` meaning;
- one-action-at-a-time behavior;
- retry causal barrier;
- READY's single latched path;
- sensor/preview/user-action coordinate separation;
- telemetry visibility of the raw Episode outcome;
- no Luna, Provider, Backend, Capture, or Main/develop integration.

The change should be limited to presentation-state derivation unless fresh evidence proves an independent controller defect.

## 13. Audit disposition

`INSTRUCTION_PRESENTATION_LOGIC = DEFECT_CONFIRMED`

`V3_CONTROLLER_ALGORITHM = NOT_FAILED_BY_THIS_AUDIT`

`IMPLEMENTATION_CHANGE = NOT_PERFORMED`

`DEVICE_GATE_RESULT = UNCHANGED`

`NEXT_TASK = NOT_STARTED`

## Source references

- `spikes/live-physical-agent-mvp/control-v3/measurement.ts`
- `spikes/live-physical-agent-mvp/control-v3/controller.ts`
- `spikes/live-physical-agent-mvp/control-v3/settle-detector.ts`
- `spikes/live-physical-agent-mvp/src/main.ts`


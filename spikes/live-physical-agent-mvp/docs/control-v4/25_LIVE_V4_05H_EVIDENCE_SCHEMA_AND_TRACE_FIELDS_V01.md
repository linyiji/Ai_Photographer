# Live V4 05H Evidence Schema & Trace Fields V01

**Status:** `OWNER_EVIDENCE_AUTHORITY`

---

# 1. Required trace metadata

```text
format
task_id
source_head
generated_at
device
browser
camera_facing
preview_mirror_state
orientation
duration
raw_media=false
```

---

# 2. Required observation fields

```text
subject_recognition_state
observed_body_state.observed_extent
observed_body_state.regions
observed_body_state.anchors
fresh
stable
```

---

# 3. Required target fields

```text
active_framing_profile
target_zone
required_regions
required_measurements
primary_anchor
```

---

# 4. Required gap fields

```text
target_gap.ready
satisfied_requirements
missing_requirements
blocking_reasons
actionability
```

---

# 5. Required control fields

```text
stage
current_anchor_x
current_anchor_y
current_scale
x_relation
y_relation
scale_relation
action
```

---

# 6. Required READY fields

```text
trial_success_latched
current_framing_ready
current_ready_revoke_reason
verify_progress / hold where available
```

---

# 7. Required episode fields

For any action episode:

```text
episode_id
issued_at
response_observed
response_observed_at
movement_started_at
settled_at
evaluated_at
outcome
```

For 05F Phase C reuse also derive:

```text
x_error_before
x_error_after
abs_error_reduction
```

---

# 8. Required performance

```text
preview_fps_avg
vision_hz_avg
state_hz_avg
inference_ms_p50
inference_ms_p95
skipped_busy_frames
scheduled_frames
processed_frames
thermal_observation where available
```

---

# 9. Required privacy counters

```text
provider_calls
backend_per_frame_calls
luna_calls
raw_video_upload
raw_frame_persistence
```

Expected:

```text
0
```

for all Provider/raw-media counters.

---

# 10. Phase tags

Every row or bounded evidence section should identify:

```text
05H_PHASE_A_EXTENT
05H_PHASE_B1_HEAD_SHOULDERS_LEFT_TOP
05H_PHASE_B2_UPPER_BODY_CENTER
05H_PHASE_B3_THREE_QUARTER_RIGHT_BOTTOM
05H_PHASE_C_READY_REVOKE
```

If row-level tagging is unavailable, report exact timestamp ranges.

Do not infer phases from memory after the fact without bounded labels/evidence.


# V4 deterministic browser matrix

Date: 2026-08-31 (Asia/Shanghai)

Local route: `http://127.0.0.1:4174/?v4Replay=<fixture>`

| Fixture | Required stages observed | Final | Console errors/warnings |
|---|---|---|---|
| CENTER_UPPER_BODY | acquire subject/body, scale, anchor, verify | READY_LATCHED / PASS | 0 |
| LEFT_THIRD_UPPER_BODY | acquire subject/body, scale, anchor, verify | READY_LATCHED / PASS | 0 |
| RIGHT_THIRD_UPPER_BODY | acquire subject/body, scale, anchor, verify | READY_LATCHED / PASS | 0 |
| CENTER_THREE_QUARTER | acquire subject/body, scale, anchor, verify | READY_LATCHED / PASS | 0 |
| LEFT_THIRD_FULL_BODY | acquire subject/body, scale, anchor, verify | READY_LATCHED / PASS | 0 |
| RIGHT_THIRD_FULL_BODY | acquire subject/body, scale, anchor, verify | READY_LATCHED / PASS | 0 |

Every route exposed the matching target id in the debug HUD, ended at `READY · TRUE`, and rendered “好，就这里”. No camera or provider was used by synthetic browser replay.


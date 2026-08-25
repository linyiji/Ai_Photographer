# Browser Acceptance

Date: 2026-08-25

Result: PASS for synthetic controller/overlay semantics. This is not real-device UX acceptance.

- Production build: PASS, 21 modules transformed.
- Automated tests: 123/123 PASS.
- Typecheck: PASS.
- READY replay: controller `READY`, visual `READY`, tracking copy `已进入目标区域`, target entry/exit `1/0`, READY visible, STOP/direction hidden.
- READY replay scalar timing: crossing delay `1050 ms`, inside-to-READY `0 ms`, projection age `0 ms` in the deterministic replay clock.
- Temporary-loss replay: HELD keeps the subject box visible with `短暂丢失 · 保持锁定`; nearby return becomes LOCKED without errors.
- STOP replay: STOP visible and direction/READY hidden during BRAKING.
- DEFAULT and LINE_DOG: semantic diff `0`.
- All three visual modes and optional grid were exercised without controller state changes.
- Browser console/runtime errors observed by the replay harness: 0.

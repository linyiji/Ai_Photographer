# XFX LIVE P2 CONTROL POLICY RECALIBRATION 01

```text
Start Head = 8637637da390044ee9f5d6b756259f95736c0ffc
Historical P2 Device Result = FAIL / 50%
Historical Failure Evidence = PRESERVED / SHA-256 5CFDE1115FA17DB9F398A76AADF70F34ECA149C125C9463AD5CDE7906D80D745
Telemetry / ActionEpisode / Signed Windowed Verification = PASS
Scalar Trace / Deterministic Replay = PASS
Automated Tests = 48/48 PASS
Typecheck / Build / Browser Replay = PASS / PASS / PASS
P2 Recalibration Implementation Gate = PASS
P2 Real Device Gate = FAIL / 17 TERMINAL EPISODES / 17.6%
LIVE-P1 = PASS
LIVE-P2 = FAIL / FRESH DEVICE GATE COMPLETE
Luna / Backend / Provider / Raw Upload = 0 / 0 / 0 / 0
CH-003 = IDENTIFIED / UNCHANGED
```

The previous contradictory telemetry was explained before policy changes. Trial timing now starts at first ordinary Episode, HOLD is excluded, and exactly one terminal outcome contributes to the defined denominator. Candidate response/settle/jitter controls are supported by named regression traces. No success gate or target tolerance was reduced. Fresh OPPO K11 revalidation remains mandatory.

The first fresh scalar trace diagnosed post-READY trial contamination: Episode 1 reached SUCCESS/READY, but later user motion created additional Episodes. The entire run was excluded. READY is now a latched trial terminal until explicit re-ARM, covered by the 48th automated test.

Fresh post-fix OPPO K11 acceptance then completed three explicitly armed trials and 17 terminal ordinary Episodes. Full results were SUCCESS/NO_EFFECT/WRONG `3/12/2`, so correction success was `3/17 = 17.6%`, below the unchanged `>=80%` gate. Minimum ordinary instruction gap was 1301.1 ms; all trial times were plausible and below 60 s; post-READY ordinary emissions were zero. No subset was cherry-picked. P2 Real Device Gate and LIVE-P2 are FAIL. Next diagnostic: reduce evidence-observed overshoot/no-effect behavior and resolve READY presentation after a latest non-SUCCESS Episode without weakening direction safety or the success gate. Luna remains OFF and is not the next task.

Fresh Preview FPS/Vision Hz/inference percentiles were not separately transcribed with these uploads and are not fabricated from scalar cadence. Their absence does not change the core-control FAIL decision.

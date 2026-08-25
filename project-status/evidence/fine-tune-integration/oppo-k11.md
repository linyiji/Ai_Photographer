# OPPO K11 Main Integration Disposition

Status: `UNVERIFIED_MAIN_RERUN / PASS_WITH_WARNING_SOURCE_EVIDENCE`.

The accepted Fine Tune source contains OPPO K11 Chrome evidence with COMBINED p95 around 109ms and BACKGROUND BLUR p95 around 127ms. That evidence supports selective migration, but it is not a Main integration rerun.

This execution environment had no `adb` command or attached device path, so the required Main simplified-flow OPPO regression and real 12MP non-BLUR/BLUR runs were not performed. WeChat compiled successfully, but Fine Tune WeChat real-device runtime also remains unverified.

No claim of automatic semantic mask, OPPO Main PASS, 12MP Main PASS, or WeChat real-device PASS is made.

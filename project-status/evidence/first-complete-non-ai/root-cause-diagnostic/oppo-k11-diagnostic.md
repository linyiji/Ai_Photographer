# OPPO K11 Root-Cause Diagnostic

```text
Device = OPPO K11 / ColorOS 15 / Chrome Mobile 138.0.7204.168
Harness build = PASS_WITH_WARNING (existing 302 KiB entry advisory)
Trusted HTTPS = READY
Camera stationary A/B = 3/3 COMPLETE
Fine Tune Main-app A/B = 12/12 ROWS COMPLETE
Fine Tune Plain H5 = 3 RUNS COMPLETE
Committed user media = 0
Third-party image upload = 0
Product fixes = 0
```

Plain H5 user-operated evidence:

| Screenshot | p50 / p95 / max (ms) | elapsed (ms) | Long Tasks / max (ms) | SHA256 |
|---|---|---:|---|---|
| `1c51624ac259c1248e5926f0e2ab10bc.jpg` | 84.8 / 98.7 / 98.7 | 1805.6 | 20 / 100 | `C2065555874137E58ECB65BE4D4505A5FAB79328B803A2D3DD58727A15F0D39E` |
| `5b6a1999287ee914c708f5fe08723cc2.jpg` | 66.5 / 80.4 / 80.4 | 1468.5 | 20 / 81 | `D1B1E931C648EDD65D8FDBB3FD1E7FEC51C90139A53FF342BC93E4034A8F92BF` |
| `357467eca9de60ac1d39efc6a0d5af42.jpg` | 82.9 / 96.3 / 96.3 | 1784.9 | 20 / 96 | `849C03897A459BE37FF14973E3CD122AF76CADACDA37A54AE6664239DDE9EB7E` |

The old Main diagnostic Tunnel was found to be serving the independent Scene Spatial service because local port 4173 had been reused. That link is invalidated for this amendment. A dedicated Main diagnostic server was moved to port 4183 and its public bundle was checked for the `OPPO Camera / Fine Tune A/B` marker before handoff. The Scene Spatial Worktree was not touched.

Main-app initial partial evidence screenshot:

```text
File = codex-clipboard-30f36db8-4fc5-4e53-aaec-32c778ef2b5c.jpg
SHA256 = DC3072009F8F5D50536536CACA9DEA89B9857A1C5A190004A4F90CA2D8C096A9
Visible complete scalar rows = 6
Initially questioned render-count fields = resolved from full-resolution line wraps
Missing rows supplied by subsequent full-page screenshot = YES
```

Full-page device evidence:

```text
File = bc92077e0d0898d064b3c86bfe3e9d04.jpg
SHA256 = 16897FBD91ABC582D6C11194B92C37AC23E9DF02210BDA8809AD0BE599C5AA81
Camera captures = 3/3
Fine Tune matrix = BRIGHTNESS/WARMTH/SATURATION × UI_ONLY/CURRENT/RENDERER_MAIN/WORKER_DIAGNOSTIC
Real media committed = 0
```

The OPPO diagnostic run is complete. Results are classified in `diagnosis-summary.md`; desktop automation was not substituted for phone behavior.

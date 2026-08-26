# OPPO K11 P1 Acceptance

Device: OPPO K11 / ColorOS 15 / Chrome Mobile.

Transport: local production H5 preview through a trusted temporary Cloudflare Quick Tunnel. ADB is not required. The ephemeral URL will not be retained after closure.

Status: **PASS_WITH_WARNING** for the amended P1 V2 candidate architecture.

## V1 checkpoint preserved

Four earlier OPPO evaluations all collapsed to `1 region / 1 opportunity`. The user found the single recommendation and concrete placement presentation unsuitable. V1 therefore remained `CHECKPOINT / NOT_ACCEPTED`; its failure evidence caused the authority change to `Region Count != Candidate Count`.

## V2 trials

| Sweep | Mode | Prepared frames | Regions | View candidates | Candidate yaws | P1 total | Preview median |
|---|---|---:|---:|---:|---|---:|---:|
| `1787733204423` | QUICK | 5 | 1 | 3 | 29.2°, 49.1°, 66.8° | 67.6 ms | 29.97 FPS |
| `1787733216782` | QUICK | 4 | 1 | 3 | -76.3°, -23.4°, 15.1° | 13.8 ms | 29.96 FPS |
| `1787733226062` | WIDE | 11 | 2 | 3 | 11.9°, 46.4°, 162.6° | 25.0 ms | 29.96 FPS |
| `1787733236039` | WIDE | 7 | 3 | 3 | -69.2°, -54.0°, 0.4° | 16.8 ms | 29.69 FPS |
| `1787733243338` | WIDE | 10 | 1 | 3 | 11.6°, 44.0°, 146.1° | 24.9 ms | not retained in the truncated copied evidence |

Available manifests confirm COMPLETE sweeps at 110.4°, 180.6°, 181.1°, and 182.0°, including left-to-right, right-to-left, and mixed motion. The final full P1 export confirms 10 prepared frames, 10 direction nodes, 1 region, 3 view candidates, and 3 placement anchors per view.

## Qualitative acceptance

User-confirmed PASS:

- left / center / right candidate markers are clear on every image;
- candidate views appear meaningfully dispersed;
- no Top 1, best camera position, best standing position, or numeric aesthetic score is shown;
- direction arc and repeat scan work normally;
- no black screen, jank, freeze, or huge false jump.

The supplied screenshot visibly confirms the critical `1 region / 3 View Candidates` case and all three markers per card. The screenshot and real-user image bytes are not committed.

## Privacy and authority

Every V2 trial reports raw keyframes transient, raw media persisted/uploaded false, Provider 0, backend per-frame 0, and Luna 0. The final export reports `depth=UNKNOWN`, `metric_geometry=NOT_SUPPORTED`, and `image_bytes_in_export=false`.

Warnings: P1 does not make a final aesthetic decision; P2 spatial geometry is not implemented; technically usable captured frames can produce adjacent candidate yaw gaps below 20° even though the tester found the visible alternatives distinct.

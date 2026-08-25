# Orientation results

Status: `PASS` on OPPO K11 Chrome Mobile 138.0.0.0.

Providers receive browser-decoded upright `SourceImage`; masks use `DECODED_UPRIGHT_SOURCE`. Decode requests `imageOrientation: "from-image"`.

The actual device loaded asymmetric JPEG fixtures carrying EXIF 1, 6 and 8. Observed upright dimensions were 160×96, 96×160 and 96×160. TOP/LEFT/RIGHT direction, preview, controlled semantic mask, local overlay and final exported orientation were checked; the three exported JPEGs are retained in `evidence/manual-device/oppo-k11-2026-08-25/`. Automated tag round-trip, dimension and mask-binding regressions also pass.

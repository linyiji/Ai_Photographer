# Orientation results

Status: `NOT_FULLY_TESTED` (OPPO gate pending).

Providers receive browser-decoded upright `SourceImage`; masks use `DECODED_UPRIGHT_SOURCE`. Decode requests `imageOrientation: "from-image"`.

FT-P2 generates asymmetric JPEG fixtures with real EXIF tags 1, 6 and 8. Desktop Chromium actual decode returned 160×96, 96×160 and 96×160 with zero console errors. Automated tests validate tag round-trip, upright dimensions and provider mask binding. OPPO Chrome display, overlay alignment and exported orientation remain pending, so the global claim is not closed.

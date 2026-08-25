# Automated mask quality

2026-08-25, Node 24.18.0, Vitest 4.1.11: 96/96 PASS across 6 files (FT-P0: 47).

PERSON/BACKGROUND creation, normalize/resize/refine/complement, empty/full/inverse/disjoint/soft/hard/jagged/thin/invalid/mismatch, cache/lifecycle/invalidation, combined-scope order determinism, and non-finite rejection pass. Analytic self-ground-truth: IoU 1.0, boundary error 0, PERSON→BACKGROUND leakage 0, BACKGROUND→PERSON leakage 0.

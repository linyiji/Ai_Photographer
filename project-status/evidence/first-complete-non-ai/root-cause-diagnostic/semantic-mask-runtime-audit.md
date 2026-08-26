# Semantic Mask Runtime Audit

Controlled 8×8 inverse masks were used in automated diagnostic tests.

```text
PERSON preview/runtime restriction = PASS
BACKGROUND preview/runtime restriction = PASS
Recipe semantics = PASS
No-mask route fail-closed = PASS
PERSON_RUNTIME = READY_WITH_CONTROLLED_MASK
BACKGROUND_RUNTIME = READY_WITH_CONTROLLED_MASK
Production MaskProvider = NOT_IMPLEMENTED
AUTO_SEMANTIC_MASK = NOT_YET_PASS
```

The missing product capability is the production semantic MaskProvider, not the controlled-mask pixel runtime. Test masks are not promoted as production capability, and no segmentation/model was added.

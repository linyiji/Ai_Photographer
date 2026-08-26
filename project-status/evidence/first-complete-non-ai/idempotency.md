# Idempotency / Failure Recovery

Fresh closure coverage:

```text
Duplicate capture confirmation = one revision / one event / one CaptureAsset
Duplicate recipe save = stable persisted response
Duplicate derived upload key = stable upload identity
Duplicate finalize = one FINAL commit / one derived lineage asset
Missing derived asset = 422; Session remains FINE_TUNE
Retry after failed precondition = supported without corrupting Session
Export failure = no Final and no success event
Source invalidation = controlled rejection
```

Existing M03 controlled scenarios were rerun through the 101-test backend suite and retain timeout recovery, persistence rollback, missing asset rejection, Reality+ recovery, illegal transition rejection and duplicate-action idempotency.

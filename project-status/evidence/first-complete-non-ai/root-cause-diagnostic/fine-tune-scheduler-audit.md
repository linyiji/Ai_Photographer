# Fine Tune Scheduler Audit

Current preview scheduling uses one replaceable pending slot and one active synchronous projection.

```text
Pending queue max depth = 1
Latest pending request replaces older pending request = YES
Sequence guard prevents stale commit = YES
Already-started render cancellable = NO
Superseded work actually cancelled = NO
```

The synchronous `renderPixels` call cannot observe a newer sequence while it owns the Main thread. Sequence protection prevents an old result from committing after a newer request is registered, but does not interrupt already-started pixel computation. Therefore stale-result protection is not stale-work cancellation.

The deterministic 40-input audit records a maximum pending depth of one and `supersededWorkActuallyCancelled=false`.

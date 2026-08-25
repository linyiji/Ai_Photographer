# Four-stage User Experience V1.0

The user-facing journey is simplified without replacing the internal P01-P13 Workflow.

```text
START -> SHOOT -> REVIEW -> FINAL
```

## START

Primary actions are `开始拍摄`, `我的作品`, and `设置`. `继续上次拍摄` appears only when an active Session exists and always requires an explicit tap.

## SHOOT

SHOOT projects the internal setup, Reality, Target, Shot, Live, and Capture stages into one user surface. It contains the camera preview, one current guidance line, shutter, camera switch, and Quick Settings. Internal deterministic preparation advances through existing backend actions without presenting a confirmation screen for every internal stage.

## REVIEW

The required local review remains:

```text
local photo -> 重拍 / 使用这张
```

Normal confirmed photos then traverse deterministic QA and processing placeholders without another happy-path choice. Failures stop safely at the last backend-committed stage and expose recovery.

## FINAL

FINAL exposes save, share, governed Fine Tune availability, My Works, and another capture. Fine Tune is not integrated by this task; its button states that the capability is not yet available and does not create a false asset.

## Complexity gate

```text
App open -> camera ready non-essential decisions = 2
Shutter = excluded
Use this photo = required confirmation
Confirm -> Final normal additional decisions = 0
```

The internal Workflow, DomainEvents, revisions, and asset lineage remain fully observable and authoritative.

# Subject Placement Zone V0.1

`SubjectPlacementZone` is a normalized image-plane composition rectangle. It is explicitly not a person detector, segmentation result, physical standing coordinate, or safety-approved location.

The local framing profiles are `CLOSE`, `MEDIUM`, `ENVIRONMENTAL`, and `FULL_BODY`. For each profile, P1 evaluates `LEFT_THIRD`, `CENTER`, and `RIGHT_THIRD` footprints. Every rectangle is bounded to `[0,1]` image coordinates.

Placement scoring samples pixels behind the expected footprint and combines low clutter, balanced exposure, frame-edge clearance, and low edge conflict. The edge-conflict proxy measures strong gradients through approximate head/torso portions of the template; it only signals a potentially messy background line.

The H5 overlay is labeled “建议人物在画面中的位置”. It must never be presented as “站在现实中的这个点”.

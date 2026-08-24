# Profile: REALTIME_CAMERA_CV V1.0

Modes: `CAMERA_PIPELINE`, `FRAME_PERCEPTION`, `SHOT_STATE`, `GUIDANCE_CONTROL`, `DEVICE_PERFORMANCE`.

Load ShotDirection, FramePerception, CurrentShotState, LiveShotRuntime, guidance priority, safety, Platform Adapter, Device Matrix, and CH-003. Build success is not Camera/CV feasibility and cannot resolve CH-003.

Evidence includes Camera FPS, CV FPS, frame latency, guidance latency, dropped frames, CPU, memory, thermal/power risk, device/OS/runtime, trace, and real-device result. Realtime state stays local; meaningful state transitions synchronize through governed events/snapshots. Strong AI is event-driven, never the per-frame hot path.

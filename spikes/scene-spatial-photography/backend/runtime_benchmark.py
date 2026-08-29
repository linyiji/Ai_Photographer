"""Generated-media benchmark for full spike-local backend compute; no user media."""
from __future__ import annotations

import argparse
import json
import time
from pathlib import Path

import cv2
import numpy as np

from solver import GeometrySolver, SOLVER_VERSION, frame_set_sha256, frame_sha256


def main() -> None:
    parser = argparse.ArgumentParser(); parser.add_argument("--output", required=True); parser.add_argument("--runs", type=int, default=20); args = parser.parse_args()
    solver = GeometrySolver(); compute = []; local_wall = []; payloads = []; statuses = []
    for run in range(args.runs):
        rng = np.random.default_rng(9000 + run); base = rng.integers(0, 256, (480, 640), np.uint8); frames = []
        for index in range(4):
            shifted = np.roll(base, index * 3, axis=1); shifted[260:, :] = np.roll(base[260:, :], index * 5, axis=1)
            ok, encoded = cv2.imencode(".jpg", shifted, [cv2.IMWRITE_JPEG_QUALITY, 78]); assert ok; frames.append(encoded.tobytes())
        selected = [{"frame_id": f"benchmark-{run}-{index}", "timestamp_ms": index * 250, "relative_yaw_deg": index * 3, "orientation_source": "CONTROLLED_FIXTURE", "width": 640, "height": 480, "working_width": 640, "working_height": 480, "encoded_bytes": len(frame), "frame_sha256": frame_sha256(frame), "quality": 1.0} for index, frame in enumerate(frames)]
        request = {"geometry_request_id": f"benchmark-request-{run}", "scan_id": f"benchmark-{run}", "frame_set_hash": frame_set_sha256(selected), "geometry_version": SOLVER_VERSION, "platform": "fixture", "camera_model_evidence": {"status": "KNOWN", "focal_source": "CONTROLLED", "principal_point_assumption": "IMAGE_CENTER", "distortion_assumption": "NONE", "platform_device_profile": "GENERATED_BENCHMARK", "confidence": 1.0}, "client_precheck": {"status": "POSSIBLE", "authority": "ROUTING_HINT_ONLY"}, "selected_geometry_frames": selected}
        started = time.perf_counter(); result = solver.analyze(request, frames); local_wall.append((time.perf_counter() - started) * 1000); compute.append(result["timing_ms"]["total_compute"]); payloads.append(sum(map(len, frames))); statuses.append(result["spatial_evidence"]["status"])
    percentile = lambda values, ratio: round(float(np.percentile(values, ratio)), 3)
    output = {"schema": "xfx.p2-backend-runtime-benchmark", "schema_version": "0.2", "source": "GENERATED_MEDIA_ONLY", "runs": args.runs, "frame_count": 4, "working_resolution": "640x480", "backend_compute_ms": {"p50": percentile(compute, 50), "p95": percentile(compute, 95)}, "local_process_wall_ms": {"p50": percentile(local_wall, 50), "p95": percentile(local_wall, 95)}, "payload_bytes": {"p50": percentile(payloads, 50), "p95": percentile(payloads, 95)}, "status_counts": {value: statuses.count(value) for value in sorted(set(statuses))}, "limitations": ["EARLY_EXIT_WORKLOAD_ALL_INSUFFICIENT", "LOCAL_GENERATED_MEDIA_NOT_OPPO_NETWORK", "NO_CLIENT_JPEG_PREPARATION", "NOT_RELEASE_HARDWARE_GATE"]}
    path = Path(args.output); path.parent.mkdir(parents=True, exist_ok=True); path.write_text(json.dumps(output, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__": main()

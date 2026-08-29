"""Controlled algorithm-validation matrix for the V0.2 backend solver."""
from __future__ import annotations

import argparse
import json
import time
from pathlib import Path

import cv2
import numpy as np

from solver import GeometrySolver, SOLVER_VERSION, _camera_matrix, frame_set_sha256, frame_sha256, solve_correspondences


SCENARIOS = {
    "PURE_ROTATION": ((0.0, 0.0, 0.0), 8.0), "LOW_PARALLAX": ((0.05, 0.0, 0.0), 0.0),
    "LATERAL_LEFT": ((-0.22, 0.0, 0.0), 0.0), "LATERAL_RIGHT": ((0.22, 0.0, 0.0), 0.0),
    "MOVE_FORWARD": ((0.0, 0.0, 0.60), 0.0), "MOVE_BACKWARD": ((0.0, 0.0, -0.90), 0.0),
    "MIXED_ROTATE_TRANSLATE": ((0.18, 0.0, 0.10), 5.0), "WEAK_TEXTURE": ((0.22, 0.0, 0.0), 0.0),
    "REPETITIVE_TEXTURE": ((0.22, 0.0, 0.0), 0.0), "BLUR": ((0.22, 0.0, 0.0), 0.0),
    "EXPOSURE_FAILURE": ((0.22, 0.0, 0.0), 0.0), "INSUFFICIENT_FRAMES": ((0.22, 0.0, 0.0), 0.0),
}


def rotation_y(degrees: float) -> np.ndarray:
    angle = np.deg2rad(degrees)
    return np.array([[np.cos(angle), 0, np.sin(angle)], [0, 1, 0], [-np.sin(angle), 0, np.cos(angle)]])


def project(points: np.ndarray, rotation: np.ndarray, translation: np.ndarray, camera: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    coordinates = (rotation @ points.T + translation.reshape(3, 1)).T
    uv = (camera @ coordinates.T).T
    return uv[:, :2] / uv[:, 2:], coordinates[:, 2]


def solve_scenario(name: str, seed: int = 1729):
    rng = np.random.default_rng(seed); cv2.setRNGSeed(seed)
    camera = _camera_matrix(640, 480); center, yaw = SCENARIOS[name]; center = np.asarray(center, float)
    rotation = rotation_y(yaw); translation = -rotation @ center
    points = np.column_stack((rng.uniform(-2.1, 2.1, 180), rng.uniform(-1.45, 1.45, 180), rng.uniform(3.5, 8.5, 180)))
    first, z1 = project(points, np.eye(3), np.zeros(3), camera); second, z2 = project(points, rotation, translation, camera)
    valid = (z1 > 0) & (z2 > 0) & (first[:, 0] > 5) & (first[:, 0] < 635) & (first[:, 1] > 5) & (first[:, 1] < 475) & (second[:, 0] > 5) & (second[:, 0] < 635) & (second[:, 1] > 5) & (second[:, 1] < 475)
    first, second = first[valid], second[valid]
    if name in {"WEAK_TEXTURE", "BLUR", "EXPOSURE_FAILURE"}: first, second = first[:12], second[:12]
    if name == "REPETITIVE_TEXTURE" and len(second): second = np.roll(second, 17, axis=0)
    if name == "INSUFFICIENT_FRAMES": first, second = first[:0], second[:0]
    return solve_correspondences(first, second, camera)


def run(name: str, seed: int = 1729) -> dict:
    started = time.perf_counter(); solved = solve_scenario(name, seed)
    expected = None
    if name == "LATERAL_LEFT": expected = "LEFT"
    elif name == "LATERAL_RIGHT": expected = "RIGHT"
    elif name == "MOVE_FORWARD": expected = "FORWARD"
    elif name == "MOVE_BACKWARD": expected = "BACKWARD"
    client = "UNRELIABLE" if solved.classification == "UNCLASSIFIED" else "NO_SIGNAL" if solved.classification in {"ROTATION_DOMINANT", "LOW_PARALLAX"} else "POSSIBLE"
    return {"scenario": name, "client_precheck": client, "backend_status": solved.status, "reason": solved.reason, "diagnostics": solved.diagnostics(), "direction_sign_correct": None if expected is None else solved.translation_direction == expected, "timing_ms": round((time.perf_counter() - started) * 1000, 3)}


def cache_gate() -> dict:
    solver = GeometrySolver(); rng = np.random.default_rng(4); frames = []
    base = rng.integers(0, 256, (480, 640), np.uint8)
    for offset in (0, 2, 4):
        shifted = np.roll(base, offset, axis=1); ok, encoded = cv2.imencode(".jpg", shifted); assert ok; frames.append(encoded.tobytes())
    selected = [{"frame_id": f"frame-{index}", "relative_yaw_deg": index * 2, "quality": 1.0, "width": 640, "height": 480, "working_width": 640, "working_height": 480, "encoded_bytes": len(frame), "frame_sha256": frame_sha256(frame)} for index, frame in enumerate(frames)]
    request = {"geometry_request_id": "controlled-cache-request", "scan_id": "cache-fixture", "frame_set_hash": frame_set_sha256(selected), "geometry_version": SOLVER_VERSION, "platform": "fixture", "camera_model_evidence": {"status": "KNOWN", "focal_source": "CONTROLLED", "principal_point_assumption": "IMAGE_CENTER", "distortion_assumption": "NONE", "platform_device_profile": "FIXTURE", "confidence": 1.0}, "client_precheck": {"status": "POSSIBLE", "authority": "ROUTING_HINT_ONLY"}, "selected_geometry_frames": selected}
    first = solver.analyze(request, frames); second = solver.analyze(request, frames)
    return {"first": first["cache_status"], "second": second["cache_status"], "second_compute_ms": second["timing_ms"]["total_compute"], "pass": first["cache_status"] == "CACHE_MISS" and second["cache_status"] == "CACHE_HIT" and second["timing_ms"]["total_compute"] == 0.0}


def main() -> None:
    parser = argparse.ArgumentParser(); parser.add_argument("--output", required=True); args = parser.parse_args()
    results = [run(name) for name in SCENARIOS]
    repeat = [run(name) for name in SCENARIOS]
    timings = sorted(row["timing_ms"] for _ in range(5) for row in [run(name) for name in SCENARIOS])
    controlled = [row for row in results if row["direction_sign_correct"] is not None]
    possible = [row for row in results if row["client_precheck"] == "POSSIBLE"]
    no_signal = [row for row in results if row["client_precheck"] == "NO_SIGNAL"]
    false_positive = sum(row["backend_status"] != "USABLE" for row in possible) / max(1, len(possible))
    false_negative = sum(row["backend_status"] == "USABLE" for row in no_signal) / max(1, len(no_signal))
    def stable(value):
        if isinstance(value, dict): return {key: stable(item) for key, item in value.items() if key != "timing_ms"}
        if isinstance(value, list): return [stable(item) for item in value]
        return value
    output = {"schema": "xfx.p2-backend-controlled-matrix", "schema_version": "0.2", "solver_version": SOLVER_VERSION, "opencv_version": cv2.__version__, "role": "ALGORITHM_VALIDATION_AUTHORITY_NOT_SESSION_AUTHORITY", "results": results, "gates": {"deterministic": stable(results) == stable(repeat), "pure_rotation_false_usable": sum(row["backend_status"] == "USABLE" for row in results if row["scenario"] == "PURE_ROTATION"), "low_parallax_false_usable": sum(row["backend_status"] == "USABLE" for row in results if row["scenario"] == "LOW_PARALLAX"), "direction_sign_correct": all(row["direction_sign_correct"] is True for row in controlled), "direction_sign_cases": len(controlled), "client_precheck_false_positive_rate": false_positive, "client_precheck_false_negative_rate": false_negative, "cache": cache_gate()}, "performance_ms": {"p50": float(np.percentile(timings, 50)), "p95": float(np.percentile(timings, 95))}, "privacy": {"raw_video_upload": 0, "frame_stream_upload": 0, "selected_geometry_frame_upload": "FIRST_PARTY_BACKEND_ONLY", "provider": 0, "luna": 0, "real_user_media_in_git": 0}}
    path = Path(args.output); path.parent.mkdir(parents=True, exist_ok=True); path.write_text(json.dumps(output, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


if __name__ == "__main__": main()

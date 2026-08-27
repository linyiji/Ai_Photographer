"""Spike-local first-party Scene Spatial V0.2 geometry solver."""
from __future__ import annotations

import copy
import hashlib
import re
import time
from dataclasses import dataclass, field
from typing import Any

import cv2
import numpy as np


SOLVER_VERSION = "p2-backend-v0.2"


def _ms(started: float) -> float:
    return round((time.perf_counter() - started) * 1000, 3)


def _camera_matrix(width: int, height: int) -> np.ndarray:
    focal = float(max(width, height) * 0.8125)
    return np.array([[focal, 0.0, width / 2], [0.0, focal, height / 2], [0.0, 0.0, 1.0]])


def _direction(center: np.ndarray) -> str:
    x, _, z = center.reshape(3)
    if abs(x) >= abs(z):
        return "RIGHT" if x > 0 else "LEFT"
    return "FORWARD" if z > 0 else "BACKWARD"


@dataclass
class PairResult:
    status: str
    reason: str
    classification: str
    feature_count: int
    tracked_count: int
    inlier_ratio: float
    normalized_median_residual: float
    normalized_p75_residual: float
    pose_stability: float
    translation_direction: str
    triangulated_point_count: int
    positive_depth_ratio: float
    reprojection_error_px: float | None
    correspondences: tuple[np.ndarray, np.ndarray] | None = None
    timing_ms: dict[str, float] = field(default_factory=dict)

    def diagnostics(self) -> dict[str, Any]:
        value = copy.copy(self.__dict__)
        value.pop("correspondences", None)
        return value


def solve_correspondences(first: np.ndarray, second: np.ndarray, camera_matrix: np.ndarray) -> PairResult:
    pair_started = time.perf_counter()
    count = min(len(first), len(second))
    if count < 20:
        return PairResult("INSUFFICIENT", "CORRESPONDENCE_UNRELIABLE", "UNCLASSIFIED", count, count, 0.0, 0.0, 0.0, 0.0, "UNKNOWN", 0, 0.0, None)
    h, hmask = cv2.findHomography(first, second, cv2.RANSAC, 3.0)
    if h is None or hmask is None:
        return PairResult("INSUFFICIENT", "HOMOGRAPHY_FAILED", "UNCLASSIFIED", count, count, 0.0, 0.0, 0.0, 0.0, "UNKNOWN", 0, 0.0, None)
    projected = cv2.perspectiveTransform(first.reshape(-1, 1, 2), h).reshape(-1, 2)
    residual = np.linalg.norm(projected - second, axis=1)
    diagonal = float(np.hypot(camera_matrix[0, 2] * 2, camera_matrix[1, 2] * 2))
    median = float(np.median(residual) / diagonal)
    p75 = float(np.percentile(residual, 75) / diagonal)
    inlier_ratio = float(hmask.mean())
    if inlier_ratio < 0.35:
        return PairResult("INSUFFICIENT", "CORRESPONDENCE_UNRELIABLE", "UNCLASSIFIED", count, count, inlier_ratio, median, p75, 0.0, "UNKNOWN", 0, 0.0, None)
    if median <= 0.001 and p75 <= 0.002:
        return PairResult("INSUFFICIENT", "PURE_ROTATION_OR_HOMOGRAPHY_DOMINANT", "ROTATION_DOMINANT", count, count, inlier_ratio, median, p75, 0.0, "UNKNOWN", 0, 0.0, None)
    if median < 0.0025:
        return PairResult("INSUFFICIENT", "LOW_PARALLAX", "LOW_PARALLAX", count, count, inlier_ratio, median, p75, 0.0, "UNKNOWN", 0, 0.0, None)
    correspondence_ms = _ms(pair_started); pose_started = time.perf_counter()
    essential, emask = cv2.findEssentialMat(first, second, camera_matrix, cv2.RANSAC, 0.999, 1.0)
    if essential is None or emask is None:
        return PairResult("INSUFFICIENT", "ESSENTIAL_MATRIX_FAILED", "TRANSLATION_EVIDENCE_PRESENT", count, count, inlier_ratio, median, p75, 0.0, "UNKNOWN", 0, 0.0, None)
    pose_count, rotation, translation, pose_mask = cv2.recoverPose(essential, first, second, camera_matrix, mask=emask)
    pose_stability = float(pose_count / max(1, count))
    if pose_count < 20:
        return PairResult("INSUFFICIENT", "POSE_UNSTABLE", "TRANSLATION_EVIDENCE_PRESENT", count, count, inlier_ratio, median, p75, pose_stability, "UNKNOWN", 0, 0.0, None)
    pose_ms = _ms(pose_started); triangulation_started = time.perf_counter(); keep = pose_mask.ravel() > 0
    q1, q2 = first[keep], second[keep]
    p1 = camera_matrix @ np.hstack((np.eye(3), np.zeros((3, 1))))
    p2 = camera_matrix @ np.hstack((rotation, translation))
    homogeneous = cv2.triangulatePoints(p1, p2, q1.T, q2.T)
    points = (homogeneous[:3] / homogeneous[3]).T
    second_depth = (rotation @ points.T + translation).T[:, 2]
    finite = np.isfinite(points).all(axis=1)
    good = finite & (points[:, 2] > 0) & (second_depth > 0)
    triangulated = int(good.sum())
    positive = float(good.mean()) if len(good) else 0.0
    reprojection = None
    if good.any():
        def project(values: np.ndarray, r: np.ndarray, t: np.ndarray) -> np.ndarray:
            camera = (r @ values.T + t.reshape(3, 1)).T
            uv = (camera_matrix @ camera.T).T
            return uv[:, :2] / uv[:, 2:]
        r1 = project(points[good], np.eye(3), np.zeros(3))
        r2 = project(points[good], rotation, translation.reshape(3))
        reprojection = float(np.median(np.r_[np.linalg.norm(r1 - q1[good], axis=1), np.linalg.norm(r2 - q2[good], axis=1)]))
    center = (-rotation.T @ translation).reshape(3)
    valid = triangulated >= 20 and positive >= 0.75 and reprojection is not None and reprojection <= 2.0 and pose_stability >= 0.35
    return PairResult("USABLE" if valid else "PARTIAL", "POSE_AND_TRIANGULATION_VALIDATED" if valid else "TRIANGULATION_VALIDATION_LIMITED", "TRANSLATION_EVIDENCE_PRESENT", count, count, inlier_ratio, median, p75, pose_stability, _direction(center) if valid else "UNKNOWN", triangulated, positive, reprojection, (first, second), {"correspondence": correspondence_ms, "pose": pose_ms, "triangulation": _ms(triangulation_started), "total": _ms(pair_started)})


class GeometrySolver:
    def __init__(self) -> None:
        self._result_cache: dict[str, dict[str, Any]] = {}

    @staticmethod
    def cache_key(request: dict[str, Any]) -> str:
        raw = "|".join((request["scan_id"], request["frame_set_hash"], request["geometry_version"]))
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    def analyze(self, request: dict[str, Any], encoded_frames: list[bytes]) -> dict[str, Any]:
        started = time.perf_counter()
        self._validate(request, encoded_frames)
        key = self.cache_key(request)
        if key in self._result_cache:
            result = copy.deepcopy(self._result_cache[key])
            result["cache_status"] = "CACHE_HIT"
            result["timing_ms"]["total_compute"] = 0.0
            return result
        decode_started = time.perf_counter()
        images = [cv2.imdecode(np.frombuffer(value, np.uint8), cv2.IMREAD_COLOR) for value in encoded_frames]
        if any(image is None for image in images):
            raise ValueError("FRAME_DECODE_FAILED")
        decode_ms = _ms(decode_started)
        feature_started = time.perf_counter()
        frame_cache = []
        for image in images:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            features = cv2.goodFeaturesToTrack(gray, maxCorners=800, qualityLevel=0.01, minDistance=7, blockSize=7)
            frame_cache.append({"image": image, "gray": gray, "features": features, "reuse": 0})
        feature_ms = _ms(feature_started)
        metadata = request["selected_geometry_frames"]
        candidate_pairs = [(i, i + step) for step in (1, 2) for i in range(len(images) - step)]
        candidate_pairs.sort(key=lambda pair: -self._pair_score(pair, frame_cache, metadata))
        primary_pair = candidate_pairs[0]
        primary_started = time.perf_counter()
        primary = self._solve_frame_pair(primary_pair, frame_cache)
        primary_ms = _ms(primary_started)
        verification_results: list[PairResult] = []
        verification_pairs: list[tuple[int, int]] = []
        early_exit = primary.status == "INSUFFICIENT"
        verification_ms = 0.0
        if not early_exit:
            verification_started = time.perf_counter()
            for pair in candidate_pairs[1:]:
                if primary_pair[0] in pair or primary_pair[1] in pair or not verification_pairs:
                    verification_pairs.append(pair)
                    verification_results.append(self._solve_frame_pair(pair, frame_cache))
                if len(verification_pairs) >= 3:
                    break
            verification_ms = _ms(verification_started)
        camera_status = request["camera_model_evidence"]["status"]
        status, reasons, consistency = self._status(primary, verification_results, camera_status)
        evidence = self._evidence(request, primary, status, reasons, consistency)
        result = {
            "spatial_evidence": evidence,
            "cache_status": "CACHE_MISS",
            "diagnostics": {"primary_pair": list(primary_pair), "verification_pairs": [list(value) for value in verification_pairs], "primary": primary.diagnostics(), "verification": [value.diagnostics() for value in verification_results], "pair_consistency": consistency, "camera_model_evidence": request["camera_model_evidence"], "frame_cache": {"decode_ms": decode_ms, "feature_ms": feature_ms, "cache_reuse_count": sum(value["reuse"] for value in frame_cache)}, "early_exit": early_exit},
            "timing_ms": {"request_decode": decode_ms, "feature": feature_ms, "primary_pair": primary_ms, "verification_pairs": verification_ms, "pose": primary.timing_ms.get("pose", 0.0), "triangulation": primary.timing_ms.get("triangulation", 0.0), "validation": 0.0, "total_compute": _ms(started)},
            "payload_bytes": sum(len(value) for value in encoded_frames),
        }
        self._result_cache[key] = copy.deepcopy(result)
        return result

    @staticmethod
    def _validate(request: dict[str, Any], frames: list[bytes]) -> None:
        required = {"scan_id", "frame_set_hash", "geometry_version", "platform", "camera_model_evidence", "client_precheck", "selected_geometry_frames"}
        if not required.issubset(request):
            raise ValueError("REQUEST_FIELDS_MISSING")
        if request["geometry_version"] != SOLVER_VERSION:
            raise ValueError("GEOMETRY_VERSION_UNSUPPORTED")
        if not isinstance(request["scan_id"], str) or not 1 <= len(request["scan_id"]) <= 160:
            raise ValueError("SCAN_ID_INVALID")
        if not isinstance(request["frame_set_hash"], str) or re.fullmatch(r"[0-9a-fA-F]{64}", request["frame_set_hash"]) is None:
            raise ValueError("FRAME_SET_HASH_INVALID")
        actual_hash = hashlib.sha256(b"".join(frames)).hexdigest()
        if actual_hash.lower() != request["frame_set_hash"].lower():
            raise ValueError("FRAME_SET_HASH_MISMATCH")
        if not 3 <= len(frames) <= 8 or len(frames) != len(request["selected_geometry_frames"]):
            raise ValueError("GEOMETRY_FRAME_COUNT_OUT_OF_BOUNDS")
        if any(max(int(frame.get("width", 0)), int(frame.get("height", 0))) > 960 or min(int(frame.get("width", 0)), int(frame.get("height", 0))) <= 0 for frame in request["selected_geometry_frames"]):
            raise ValueError("GEOMETRY_WORKING_RESOLUTION_OUT_OF_BOUNDS")
        if request["camera_model_evidence"].get("status") not in {"KNOWN", "ESTIMATED_VALIDATED", "UNKNOWN"}:
            raise ValueError("CAMERA_MODEL_EVIDENCE_INVALID")

    @staticmethod
    def _pair_score(pair: tuple[int, int], cache: list[dict[str, Any]], metadata: list[dict[str, Any]]) -> float:
        first, second = pair
        features = min(0 if cache[first]["features"] is None else len(cache[first]["features"]), 0 if cache[second]["features"] is None else len(cache[second]["features"]))
        yaw = abs(float(metadata[second]["relative_yaw_deg"]) - float(metadata[first]["relative_yaw_deg"]))
        quality = min(float(metadata[first].get("quality", 0)), float(metadata[second].get("quality", 0)))
        return features + quality * 100 - abs(yaw - 8) * 3

    @staticmethod
    def _solve_frame_pair(pair: tuple[int, int], cache: list[dict[str, Any]]) -> PairResult:
        first, second = pair
        cache[first]["reuse"] += 1; cache[second]["reuse"] += 1
        points = cache[first]["features"]
        if points is None or len(points) < 20:
            return PairResult("INSUFFICIENT", "CORRESPONDENCE_UNRELIABLE", "UNCLASSIFIED", 0, 0, 0.0, 0.0, 0.0, 0.0, "UNKNOWN", 0, 0.0, None)
        tracked, status, _ = cv2.calcOpticalFlowPyrLK(cache[first]["gray"], cache[second]["gray"], points, None, winSize=(21, 21), maxLevel=3, criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 30, 0.01))
        if tracked is None or status is None:
            return PairResult("INSUFFICIENT", "TRACKING_FAILED", "UNCLASSIFIED", len(points), 0, 0.0, 0.0, 0.0, 0.0, "UNKNOWN", 0, 0.0, None)
        keep = status.ravel() > 0
        p1 = points.reshape(-1, 2)[keep]
        p2 = tracked.reshape(-1, 2)[keep]
        height, width = cache[first]["gray"].shape
        result = solve_correspondences(p1, p2, _camera_matrix(width, height))
        result.feature_count = len(points); result.tracked_count = len(p1)
        return result

    @staticmethod
    def _status(primary: PairResult, verification: list[PairResult], camera_status: str) -> tuple[str, list[str], float]:
        if primary.status == "INSUFFICIENT":
            return "INSUFFICIENT", [primary.reason], 0.0
        usable = [value for value in verification if value.status == "USABLE"]
        directions = [value.translation_direction for value in [primary, *usable] if value.translation_direction != "UNKNOWN"]
        consistency = directions.count(primary.translation_direction) / max(1, len(directions)) if directions else 0.0
        if primary.status != "USABLE":
            return "PARTIAL", [primary.reason], consistency
        if camera_status == "UNKNOWN":
            return "PARTIAL", ["CAMERA_MODEL_EVIDENCE_LIMITED"], consistency
        if verification and (len(usable) < 1 or consistency < 0.5):
            return "PARTIAL", ["MULTI_PAIR_CONSISTENCY_LIMITED"], consistency
        return "USABLE", ["ROBUST_CORRESPONDENCE", "PARALLAX_PRESENT", "POSE_AND_TRIANGULATION_VALIDATED"], consistency

    @staticmethod
    def _evidence(request: dict[str, Any], primary: PairResult, status: str, reasons: list[str], consistency: float) -> dict[str, Any]:
        usable = status == "USABLE"
        return {"schema": "xfx.spatial-evidence", "schema_version": "0.2", "source_scan_id": request["scan_id"], "status": status, "status_authority": "FIRST_PARTY_BACKEND_GEOMETRY_SOLVER", "confidence": round(min(primary.inlier_ratio, primary.pose_stability, primary.positive_depth_ratio, max(0.0, consistency)) if usable else 0.0, 4), "geometry_type": "SPARSE_RELATIVE" if status in {"PARTIAL", "USABLE"} else "UNKNOWN", "metric_scale_available": False, "relative_camera_motion": {"rotation": "ESTIMATED" if status != "INSUFFICIENT" else "UNKNOWN", "translation_direction": primary.translation_direction if usable else "UNKNOWN", "evidence_class": "FACT" if usable else "UNKNOWN", "metric_distance": "UNKNOWN", "coordinate_convention": "CAMERA_X_RIGHT_Y_DOWN_Z_FORWARD"}, "relative_depth_summary": {"source": "SPARSE_MULTI_VIEW_GEOMETRY" if usable else "NONE", "categories": ["NEAR", "MID", "FAR"] if usable else [], "status": "AVAILABLE" if usable else "UNKNOWN"}, "geometry_coverage": round(consistency, 4), "visibility_evidence": {"status": "PARTIAL" if usable else "UNKNOWN", "note": "SPARSE_POINT_VISIBILITY_ONLY" if usable else "NO_VALIDATED_GEOMETRY"}, "occlusion_evidence": {"status": "PARTIAL" if usable else "UNKNOWN", "note": "SPARSE_OBSTRUCTION_PROXY_ONLY" if usable else "NO_VALIDATED_GEOMETRY"}, "limitations": ["NON_METRIC", "SPARSE_GEOMETRY_ONLY", "NO_PHYSICAL_SAFETY_AUTHORITY", "P3_AFFORDANCE_NOT_STARTED"], "evidence_refs": [value["frame_id"] for value in request["selected_geometry_frames"]], "reason_codes": reasons, "diagnostics": {"feature_count": primary.feature_count, "track_count": primary.tracked_count, "inlier_ratio": primary.inlier_ratio, "normalized_parallax": primary.normalized_median_residual, "pose_stability": primary.pose_stability, "positive_depth_ratio": primary.positive_depth_ratio, "triangulated_point_count": primary.triangulated_point_count, "reprojection_error": primary.reprojection_error_px, "pair_consistency": consistency, "camera_model_quality": request["camera_model_evidence"]["status"]}}

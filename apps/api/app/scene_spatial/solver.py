"""Module-private accepted Scene Spatial V0.2 geometry implementation."""
from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Any

import cv2
import numpy as np

from .contracts import FIRST_PARTY_AUTHORITY


def _elapsed(started: float) -> float:
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
class _PairResult:
    status: str
    reason: str
    inlier_ratio: float = 0.0
    normalized_median_residual: float = 0.0
    normalized_p75_residual: float = 0.0
    pose_stability: float = 0.0
    translation_direction: str = "UNKNOWN"
    feature_count: int = 0
    tracked_count: int = 0
    triangulated_point_count: int = 0
    positive_depth_ratio: float = 0.0
    reprojection_error_px: float | None = None


def _solve_correspondences(first: np.ndarray, second: np.ndarray, camera: np.ndarray) -> _PairResult:
    count = min(len(first), len(second))
    if count < 20:
        return _PairResult("INSUFFICIENT", "CORRESPONDENCE_UNRELIABLE", feature_count=count, tracked_count=count)
    homography, mask = cv2.findHomography(first, second, cv2.RANSAC, 3.0)
    if homography is None or mask is None:
        return _PairResult("INSUFFICIENT", "HOMOGRAPHY_FAILED", feature_count=count, tracked_count=count)
    projected = cv2.perspectiveTransform(first.reshape(-1, 1, 2), homography).reshape(-1, 2)
    diagonal = float(np.hypot(camera[0, 2] * 2, camera[1, 2] * 2))
    residual = np.linalg.norm(projected - second, axis=1) / diagonal
    median, p75, inlier = float(np.median(residual)), float(np.percentile(residual, 75)), float(mask.mean())
    base = dict(feature_count=count, tracked_count=count, inlier_ratio=inlier, normalized_median_residual=median, normalized_p75_residual=p75)
    if inlier < 0.35:
        return _PairResult("INSUFFICIENT", "CORRESPONDENCE_UNRELIABLE", **base)
    if median <= 0.001 and p75 <= 0.002:
        return _PairResult("INSUFFICIENT", "PURE_ROTATION_OR_HOMOGRAPHY_DOMINANT", **base)
    if median < 0.0025:
        return _PairResult("INSUFFICIENT", "LOW_PARALLAX", **base)
    essential, essential_mask = cv2.findEssentialMat(first, second, camera, cv2.RANSAC, 0.999, 1.0)
    if essential is None or essential_mask is None:
        return _PairResult("INSUFFICIENT", "ESSENTIAL_MATRIX_FAILED", **base)
    pose_count, rotation, translation, pose_mask = cv2.recoverPose(essential, first, second, camera, mask=essential_mask)
    pose_stability = float(pose_count / max(1, count))
    if pose_count < 20:
        return _PairResult("INSUFFICIENT", "POSE_UNSTABLE", pose_stability=pose_stability, **base)
    keep = pose_mask.ravel() > 0
    q1, q2 = first[keep], second[keep]
    projection1 = camera @ np.hstack((np.eye(3), np.zeros((3, 1))))
    projection2 = camera @ np.hstack((rotation, translation))
    homogeneous = cv2.triangulatePoints(projection1, projection2, q1.T, q2.T)
    points = (homogeneous[:3] / homogeneous[3]).T
    second_depth = (rotation @ points.T + translation).T[:, 2]
    valid_depth = np.isfinite(points).all(axis=1) & (points[:, 2] > 0) & (second_depth > 0)
    triangulated = int(valid_depth.sum())
    positive = float(valid_depth.mean()) if len(valid_depth) else 0.0
    reprojection: float | None = None
    if valid_depth.any():
        def project(values: np.ndarray, r: np.ndarray, t: np.ndarray) -> np.ndarray:
            transformed = (r @ values.T + t.reshape(3, 1)).T
            pixels = (camera @ transformed.T).T
            return pixels[:, :2] / pixels[:, 2:]
        first_error = np.linalg.norm(project(points[valid_depth], np.eye(3), np.zeros(3)) - q1[valid_depth], axis=1)
        second_error = np.linalg.norm(project(points[valid_depth], rotation, translation.reshape(3)) - q2[valid_depth], axis=1)
        reprojection = float(np.median(np.r_[first_error, second_error]))
    valid = triangulated >= 20 and positive >= 0.75 and reprojection is not None and reprojection <= 2.0 and pose_stability >= 0.35
    center = (-rotation.T @ translation).reshape(3)
    return _PairResult(
        "USABLE" if valid else "PARTIAL",
        "POSE_AND_TRIANGULATION_VALIDATED" if valid else "TRIANGULATION_VALIDATION_LIMITED",
        pose_stability=pose_stability,
        translation_direction=_direction(center) if valid else "UNKNOWN",
        triangulated_point_count=triangulated,
        positive_depth_ratio=positive,
        reprojection_error_px=reprojection,
        **base,
    )


class GeometrySolver:
    """GFTT/PyrLK + robust model comparison + relative sparse geometry."""

    def analyze(self, request: dict[str, Any], encoded_frames: list[bytes]) -> tuple[dict[str, Any], dict[str, float]]:
        started = time.perf_counter()
        images = [cv2.imdecode(np.frombuffer(value, np.uint8), cv2.IMREAD_COLOR) for value in encoded_frames]
        if any(image is None for image in images):
            raise ValueError("FRAME_DECODE_FAILED")
        frame_cache: list[tuple[np.ndarray, np.ndarray | None]] = []
        for image in images:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            features = cv2.goodFeaturesToTrack(gray, maxCorners=800, qualityLevel=0.01, minDistance=7, blockSize=7)
            frame_cache.append((gray, features))
        metadata = request["selected_geometry_frames"]
        pairs = [(index, index + step) for step in (1, 2) for index in range(len(images) - step)]
        pairs.sort(key=lambda pair: -self._pair_score(pair, frame_cache, metadata))
        primary = self._solve_pair(pairs[0], frame_cache)
        verification: list[_PairResult] = []
        if primary.status != "INSUFFICIENT":
            verification_pairs: list[tuple[int, int]] = []
            primary_pair = pairs[0]
            for pair in pairs[1:]:
                if primary_pair[0] in pair or primary_pair[1] in pair or not verification_pairs:
                    verification_pairs.append(pair)
                    verification.append(self._solve_pair(pair, frame_cache))
                if len(verification_pairs) >= 3:
                    break
        status, reasons, consistency = self._status(primary, verification, request["camera_model_evidence"]["status"])
        evidence = self._evidence(request, primary, status, reasons, consistency)
        return evidence, {"solver_ms": _elapsed(started)}

    @staticmethod
    def _pair_score(pair: tuple[int, int], cache: list[tuple[np.ndarray, np.ndarray | None]], metadata: list[dict[str, Any]]) -> float:
        first, second = pair
        feature_count = min(0 if cache[first][1] is None else len(cache[first][1]), 0 if cache[second][1] is None else len(cache[second][1]))
        yaw = abs(float(metadata[second]["relative_yaw_deg"]) - float(metadata[first]["relative_yaw_deg"]))
        quality = min(float(metadata[first].get("quality", 0)), float(metadata[second].get("quality", 0)))
        return feature_count + quality * 100 - abs(yaw - 8) * 3

    @staticmethod
    def _solve_pair(pair: tuple[int, int], cache: list[tuple[np.ndarray, np.ndarray | None]]) -> _PairResult:
        first, second = pair
        gray1, features = cache[first]
        gray2, _ = cache[second]
        if features is None or len(features) < 20:
            return _PairResult("INSUFFICIENT", "CORRESPONDENCE_UNRELIABLE")
        tracked, status, _ = cv2.calcOpticalFlowPyrLK(gray1, gray2, features, None, winSize=(21, 21), maxLevel=3, criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 30, 0.01))
        if tracked is None or status is None:
            return _PairResult("INSUFFICIENT", "TRACKING_FAILED", feature_count=len(features))
        keep = status.ravel() > 0
        result = _solve_correspondences(features.reshape(-1, 2)[keep], tracked.reshape(-1, 2)[keep], _camera_matrix(gray1.shape[1], gray1.shape[0]))
        result.feature_count = len(features)
        result.tracked_count = int(keep.sum())
        return result

    @staticmethod
    def _status(primary: _PairResult, verification: list[_PairResult], camera_status: str) -> tuple[str, list[str], float]:
        if primary.status == "INSUFFICIENT":
            return "INSUFFICIENT", [primary.reason], 0.0
        usable = [item for item in verification if item.status == "USABLE"]
        directions = [item.translation_direction for item in [primary, *usable] if item.translation_direction != "UNKNOWN"]
        consistency = directions.count(primary.translation_direction) / max(1, len(directions)) if directions else 0.0
        if primary.status != "USABLE":
            return "PARTIAL", [primary.reason], consistency
        if camera_status == "UNKNOWN":
            return "PARTIAL", ["CAMERA_MODEL_EVIDENCE_LIMITED"], consistency
        if verification and (not usable or consistency < 0.5):
            return "PARTIAL", ["MULTI_PAIR_CONSISTENCY_LIMITED"], consistency
        return "USABLE", ["ROBUST_CORRESPONDENCE", "PARALLAX_PRESENT", "POSE_AND_TRIANGULATION_VALIDATED"], consistency

    @staticmethod
    def _evidence(request: dict[str, Any], pair: _PairResult, status: str, reasons: list[str], consistency: float) -> dict[str, Any]:
        usable = status == "USABLE"
        return {
            "schema": "xfx.spatial-evidence",
            "schema_version": "0.2.0",
            "source_scan_id": request["scan_id"],
            "status": status,
            "status_authority": FIRST_PARTY_AUTHORITY,
            "confidence": round(min(pair.inlier_ratio, pair.pose_stability, pair.positive_depth_ratio, max(0.0, consistency)) if usable else 0.0, 4),
            "geometry_type": "SPARSE_RELATIVE" if status in {"PARTIAL", "USABLE"} else "UNKNOWN",
            "metric_scale_available": False,
            "relative_camera_motion": {"rotation": "ESTIMATED" if status != "INSUFFICIENT" else "UNKNOWN", "translation_direction": pair.translation_direction if usable else "UNKNOWN", "evidence_class": "FACT" if usable else "UNKNOWN", "metric_distance": "UNKNOWN", "coordinate_convention": "CAMERA_X_RIGHT_Y_DOWN_Z_FORWARD"},
            "relative_depth_summary": {"source": "SPARSE_MULTI_VIEW_GEOMETRY" if usable else "NONE", "categories": ["NEAR", "MID", "FAR"] if usable else [], "status": "AVAILABLE" if usable else "UNKNOWN"},
            "geometry_coverage": round(consistency, 4),
            "visibility_evidence": {"status": "PARTIAL" if usable else "UNKNOWN", "note": "SPARSE_POINT_VISIBILITY_ONLY" if usable else "NO_VALIDATED_GEOMETRY"},
            "occlusion_evidence": {"status": "PARTIAL" if usable else "UNKNOWN", "note": "SPARSE_OBSTRUCTION_PROXY_ONLY" if usable else "NO_VALIDATED_GEOMETRY"},
            "limitations": ["NON_METRIC", "SPARSE_GEOMETRY_ONLY", "NO_PHYSICAL_SAFETY_AUTHORITY", "P3_AFFORDANCE_NOT_STARTED"],
            "evidence_refs": [item["frame_id"] for item in request["selected_geometry_frames"]],
            "reason_codes": reasons,
            "diagnostics": {"geometry_request_id": request["geometry_request_id"], "feature_count": pair.feature_count, "track_count": pair.tracked_count, "inlier_ratio": pair.inlier_ratio, "normalized_parallax": pair.normalized_median_residual, "pose_stability": pair.pose_stability, "positive_depth_ratio": pair.positive_depth_ratio, "triangulated_point_count": pair.triangulated_point_count, "reprojection_error": pair.reprojection_error_px, "pair_consistency": consistency, "camera_model_quality": request["camera_model_evidence"]["status"]},
        }

from __future__ import annotations

import unittest
import http.client
import hashlib
import json
import threading

import cv2
import numpy as np

from controlled_matrix import cache_gate, run, solve_scenario
from server import Handler, ThreadingHTTPServer
from solver import GeometrySolver, SOLVER_VERSION


class BackendGeometryTests(unittest.TestCase):
    def test_pure_rotation_never_usable(self) -> None:
        self.assertEqual(run("PURE_ROTATION")["backend_status"], "INSUFFICIENT")

    def test_low_parallax_never_usable(self) -> None:
        self.assertEqual(run("LOW_PARALLAX")["backend_status"], "INSUFFICIENT")

    def test_direction_signs(self) -> None:
        for scenario in ("LATERAL_LEFT", "LATERAL_RIGHT", "MOVE_FORWARD", "MOVE_BACKWARD"):
            self.assertTrue(run(scenario)["direction_sign_correct"], scenario)

    def test_translations_triangulate(self) -> None:
        for scenario in ("LATERAL_LEFT", "LATERAL_RIGHT", "MOVE_FORWARD", "MOVE_BACKWARD"):
            row = run(scenario); self.assertEqual(row["backend_status"], "USABLE", scenario); self.assertGreaterEqual(row["diagnostics"]["triangulated_point_count"], 20)

    def test_cache_is_idempotent(self) -> None:
        self.assertTrue(cache_gate()["pass"])

    def test_unknown_camera_model_caps_valid_geometry_at_partial(self) -> None:
        pair = solve_scenario("LATERAL_RIGHT"); status, reasons, _ = GeometrySolver._status(pair, [], "UNKNOWN")
        self.assertEqual(status, "PARTIAL"); self.assertIn("CAMERA_MODEL_EVIDENCE_LIMITED", reasons)

    def test_frame_set_hash_mismatch_is_rejected(self) -> None:
        request = {"scan_id": "hash", "frame_set_hash": "0" * 64, "geometry_version": SOLVER_VERSION, "platform": "fixture", "camera_model_evidence": {"status": "UNKNOWN"}, "client_precheck": {"status": "UNRELIABLE"}, "selected_geometry_frames": [{"width": 1, "height": 1}] * 3}
        with self.assertRaisesRegex(ValueError, "FRAME_SET_HASH_MISMATCH"):
            GeometrySolver().analyze(request, [b"a", b"b", b"c"])

    def test_multipart_api_emits_backend_authority(self) -> None:
        server = ThreadingHTTPServer(("127.0.0.1", 0), Handler); thread = threading.Thread(target=server.serve_forever, daemon=True); thread.start()
        try:
            rng = np.random.default_rng(9); base = rng.integers(0, 256, (240, 320), np.uint8); frames = []
            for offset in (0, 2, 4):
                ok, encoded = cv2.imencode(".jpg", np.roll(base, offset, axis=1)); self.assertTrue(ok); frames.append(encoded.tobytes())
            selected = [{"frame_id": f"api-{index}", "timestamp_ms": index * 250, "relative_yaw_deg": index * 2, "orientation_source": "CONTROLLED_FIXTURE", "width": 320, "height": 240, "quality": 1, "file_field": f"frame_{index}"} for index in range(3)]
            metadata = {"scan_id": "api-smoke", "frame_set_hash": hashlib.sha256(b"".join(frames)).hexdigest(), "geometry_version": SOLVER_VERSION, "platform": "fixture", "camera_model_evidence": {"status": "KNOWN", "focal_source": "CONTROLLED", "principal_point_assumption": "IMAGE_CENTER", "distortion_assumption": "NONE", "platform_device_profile": "FIXTURE", "confidence": 1}, "client_precheck": {"status": "POSSIBLE", "authority": "ROUTING_HINT_ONLY"}, "selected_geometry_frames": selected}
            boundary = "xfx-boundary"; chunks = [f"--{boundary}\r\nContent-Disposition: form-data; name=\"metadata\"\r\n\r\n{json.dumps(metadata)}\r\n".encode()]
            for index, frame in enumerate(frames): chunks.extend([f"--{boundary}\r\nContent-Disposition: form-data; name=\"frame_{index}\"; filename=\"frame-{index}.jpg\"\r\nContent-Type: image/jpeg\r\n\r\n".encode(), frame, b"\r\n"])
            chunks.append(f"--{boundary}--\r\n".encode()); body = b"".join(chunks)
            connection = http.client.HTTPConnection("127.0.0.1", server.server_port, timeout=10); connection.request("POST", "/scene-spatial/geometry/analyze", body, {"Content-Type": f"multipart/form-data; boundary={boundary}", "Content-Length": str(len(body))}); response = connection.getresponse(); value = json.loads(response.read()); connection.close()
            self.assertEqual(response.status, 200); self.assertEqual(value["spatial_evidence"]["schema_version"], "0.2"); self.assertEqual(value["spatial_evidence"]["status_authority"], "FIRST_PARTY_BACKEND_GEOMETRY_SOLVER"); self.assertLess(len(body), 6 * 1024 * 1024)
        finally:
            server.shutdown(); server.server_close(); thread.join(timeout=2)


if __name__ == "__main__": unittest.main()

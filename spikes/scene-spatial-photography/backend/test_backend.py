from __future__ import annotations

import http.client
import json
import threading
import unittest

import cv2
import numpy as np

from controlled_matrix import cache_gate, run, solve_scenario
from server import Handler, ThreadingHTTPServer, parse_multipart
from solver import GeometrySolver, SOLVER_VERSION, frame_set_sha256, frame_sha256


def selected_metadata(frames: list[bytes], width: int = 320, height: int = 240) -> list[dict]:
    return [{"frame_id": f"api-{index}", "timestamp_ms": index * 250, "relative_yaw_deg": index * 2, "orientation_source": "CONTROLLED_FIXTURE", "width": width, "height": height, "working_width": width, "working_height": height, "source_width": width, "source_height": height, "encoded_bytes": len(frame), "frame_sha256": frame_sha256(frame), "quality": 1, "file_field": f"frame_{index}"} for index, frame in enumerate(frames)]


def request_for(frames: list[bytes], selected: list[dict] | None = None, scan_id: str = "api-smoke") -> dict:
    metadata = selected or selected_metadata(frames)
    return {"geometry_request_id": f"request-{scan_id}", "scan_id": scan_id, "frame_set_hash": frame_set_sha256(metadata), "geometry_version": SOLVER_VERSION, "platform": "fixture", "camera_model_evidence": {"status": "KNOWN", "focal_source": "CONTROLLED", "principal_point_assumption": "IMAGE_CENTER", "distortion_assumption": "NONE", "platform_device_profile": "FIXTURE", "confidence": 1}, "client_precheck": {"status": "POSSIBLE", "authority": "ROUTING_HINT_ONLY"}, "selected_geometry_frames": metadata}


def multipart_body(metadata: dict, frames: list[bytes], boundary: str = "xfx-browser-formdata-boundary") -> bytes:
    chunks = [f"--{boundary}\r\nContent-Disposition: form-data; name=\"metadata\"\r\n\r\n{json.dumps(metadata)}\r\n".encode()]
    for index, frame in enumerate(frames):
        chunks.extend([f"--{boundary}\r\nContent-Disposition: form-data; name=\"frame_{index}\"; filename=\"frame-{index}.jpg\"\r\nContent-Type: image/jpeg\r\n\r\n".encode(), frame, b"\r\n"])
    chunks.append(f"--{boundary}--\r\n".encode()); return b"".join(chunks)


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
        frames = [b"a", b"b", b"c"]; request = request_for(frames); request["frame_set_hash"] = "0" * 64
        with self.assertRaisesRegex(ValueError, "FRAME_SET_HASH_MISMATCH"): GeometrySolver._validate(request, frames)

    def test_one_changed_binary_byte_is_rejected(self) -> None:
        frames = [b"jpeg-a\r\n\x00", b"jpeg-b", b"jpeg-c"]; request = request_for(frames); changed = [frames[0][:-1] + b"\x01", *frames[1:]]
        with self.assertRaisesRegex(ValueError, "FRAME_BINARY_HASH_MISMATCH"): GeometrySolver._validate(request, changed)

    def test_frame_order_changes_frame_set_hash(self) -> None:
        frames = [b"a", b"b", b"c"]; selected = selected_metadata(frames)
        self.assertNotEqual(frame_set_sha256(selected), frame_set_sha256([selected[1], selected[0], selected[2]]))

    def test_browser_multipart_preserves_binary_bytes(self) -> None:
        frames = [b"\xff\xd8\x00\r\n\x80\xfe\r\n\xff\xd9", b"\x00\x01\r\n\x02\xff", b"end-with-crlf\r\n"]
        metadata = request_for(frames); boundary = "----WebKitFormBoundaryXFX123"; body = multipart_body(metadata, frames, boundary)
        parsed, uploaded = parse_multipart(f"multipart/form-data; boundary={boundary}", body)
        self.assertEqual(uploaded, frames); self.assertEqual([frame_sha256(value) for value in uploaded], [item["frame_sha256"] for item in parsed["selected_geometry_frames"]]); self.assertEqual(frame_set_sha256(parsed["selected_geometry_frames"]), parsed["frame_set_hash"])

    def test_backend_long_edge_validation_matrix(self) -> None:
        frames = [b"a", b"b", b"c"]
        for width, height in ((360, 640), (640, 360), (640, 640)):
            selected = selected_metadata(frames, width, height); GeometrySolver._validate(request_for(frames, selected), frames)
        for width, height in ((640, 1138), (961, 640)):
            selected = selected_metadata(frames, width, height)
            with self.assertRaisesRegex(ValueError, "GEOMETRY_WORKING_RESOLUTION_OUT_OF_BOUNDS"): GeometrySolver._validate(request_for(frames, selected), frames)

    def test_browser_multipart_request_reaches_solver(self) -> None:
        server = ThreadingHTTPServer(("127.0.0.1", 0), Handler); thread = threading.Thread(target=server.serve_forever, daemon=True); thread.start()
        try:
            rng = np.random.default_rng(9); base = rng.integers(0, 256, (240, 320), np.uint8); frames = []
            for offset in (0, 2, 4):
                ok, encoded = cv2.imencode(".jpg", np.roll(base, offset, axis=1)); self.assertTrue(ok); frames.append(encoded.tobytes())
            metadata = request_for(frames); boundary = "----WebKitFormBoundaryReachSolver"; body = multipart_body(metadata, frames, boundary)
            connection = http.client.HTTPConnection("127.0.0.1", server.server_port, timeout=10); connection.request("POST", "/scene-spatial/geometry/analyze", body, {"Content-Type": f"multipart/form-data; boundary={boundary}", "Content-Length": str(len(body))}); response = connection.getresponse(); value = json.loads(response.read()); connection.close()
            self.assertEqual(response.status, 200); self.assertEqual(value["spatial_evidence"]["schema_version"], "0.2"); self.assertEqual(value["spatial_evidence"]["status_authority"], "FIRST_PARTY_BACKEND_GEOMETRY_SOLVER"); self.assertIn(value["spatial_evidence"]["status"], {"INSUFFICIENT", "PARTIAL", "USABLE"}); self.assertIn("multipart_parse_ms", value["timing_ms"]); self.assertIn("body_receive_ms", value["timing_ms"]); self.assertIn("backend_total_after_body_received_ms", value["timing_ms"]); self.assertEqual(value["geometry_request_id"], metadata["geometry_request_id"]); self.assertEqual(value["spatial_evidence"]["diagnostics"]["geometry_request_id"], metadata["geometry_request_id"])
        finally:
            server.shutdown(); server.server_close(); thread.join(timeout=2)

    def test_cache_key_ignores_photography_intent_but_changes_with_frame_set(self) -> None:
        frames = [b"a", b"b", b"c"]; first = request_for(frames, scan_id="cache-contract"); second = dict(first); second["photography_intent"] = "PORTRAIT"
        self.assertEqual(GeometrySolver.cache_key(first), GeometrySolver.cache_key(second))
        changed = request_for([b"a", b"b", b"d"], scan_id="cache-contract")
        self.assertNotEqual(GeometrySolver.cache_key(first), GeometrySolver.cache_key(changed))
    def test_wrong_declared_hash_returns_http_400_code(self) -> None:
        server = ThreadingHTTPServer(("127.0.0.1", 0), Handler); thread = threading.Thread(target=server.serve_forever, daemon=True); thread.start()
        try:
            frames = [b"a", b"b", b"c"]; metadata = request_for(frames); metadata["frame_set_hash"] = "0" * 64; boundary = "xfx-negative"; body = multipart_body(metadata, frames, boundary)
            connection = http.client.HTTPConnection("127.0.0.1", server.server_port, timeout=10); connection.request("POST", "/scene-spatial/geometry/analyze", body, {"Content-Type": f"multipart/form-data; boundary={boundary}", "Content-Length": str(len(body))}); response = connection.getresponse(); value = json.loads(response.read()); connection.close()
            self.assertEqual(response.status, 400); self.assertEqual(value["error"], "FRAME_SET_HASH_MISMATCH")
        finally:
            server.shutdown(); server.server_close(); thread.join(timeout=2)


if __name__ == "__main__": unittest.main()

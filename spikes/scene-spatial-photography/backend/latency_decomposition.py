"""Local same-class P2 latency waterfall using generated media only."""
from __future__ import annotations

import argparse
import hashlib
import http.client
import json
import threading
import time
from pathlib import Path
from urllib.parse import urlparse

import cv2
import numpy as np

from server import Handler, SOLVER, ThreadingHTTPServer
from solver import SOLVER_VERSION, frame_set_sha256, frame_sha256
from test_backend import multipart_body


def ms(started: float) -> float:
    return round((time.perf_counter() - started) * 1000, 3)


def percentile(values: list[float], ratio: float) -> float:
    return round(float(np.percentile(values, ratio)), 3)


def source_frames(count: int, seed: int) -> list[np.ndarray]:
    rng = np.random.default_rng(seed); values = []
    for index in range(count):
        noise = rng.integers(0, 256, (1920, 1080, 3), np.uint8)
        smooth = cv2.GaussianBlur(noise, (15, 15), 0)
        cv2.rectangle(smooth, (80 + index * 14, 220), (950, 1600), (60 + index * 10, 110, 170), 10)
        values.append(smooth)
    return values


def prepare(source: list[np.ndarray], scan_id: str, request_id: str, target_bytes: int) -> tuple[dict, list[bytes], dict[str, float]]:
    started = time.perf_counter(); resize_started = time.perf_counter(); working = [cv2.resize(frame, (360, 640), interpolation=cv2.INTER_AREA) for frame in source]; resize_ms = ms(resize_started)
    encode_started = time.perf_counter(); quality = 68 if len(source) == 5 else 77; frames = [cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, quality])[1].tobytes() for frame in working]; encode_ms = ms(encode_started)
    hash_started = time.perf_counter(); hashes = [hashlib.sha256(frame).hexdigest() for frame in frames]; hash_ms = ms(hash_started)
    selected = [{"frame_id": f"{scan_id}-{index}", "timestamp_ms": index * 250, "relative_yaw_deg": index * 5, "orientation_source": "CONTROLLED_FIXTURE", "width": 360, "height": 640, "working_width": 360, "working_height": 640, "source_width": 1080, "source_height": 1920, "encoded_bytes": len(frame), "frame_sha256": hashes[index], "quality": 1, "file_field": f"frame_{index}"} for index, frame in enumerate(frames)]
    request = {"geometry_request_id": request_id, "scan_id": scan_id, "frame_set_hash": frame_set_sha256(selected), "geometry_version": SOLVER_VERSION, "platform": "fixture", "camera_model_evidence": {"status": "UNKNOWN", "focal_source": "NOT_AVAILABLE_FROM_H5_CAPTURE", "principal_point_assumption": "IMAGE_CENTER_IF_BACKEND_ATTEMPTS_LIMITED_SOLVE", "distortion_assumption": "UNKNOWN", "platform_device_profile": "GENERATED_LOCAL_BASELINE", "confidence": 0}, "client_precheck": {"status": "NO_SIGNAL", "authority": "ROUTING_HINT_ONLY"}, "selected_geometry_frames": selected, "privacy": {"raw_video_upload": 0, "frame_stream_upload": 0, "provider_upload": 0, "luna_upload": 0, "selected_geometry_frame_upload": "FIRST_PARTY_BACKEND_ONLY"}}
    return request, frames, {"resize_ms": resize_ms, "encode_ms": encode_ms, "hash_ms": hash_ms, "client_preparation_ms": ms(started)}


def run_class(connection: http.client.HTTPConnection, label: str, count: int, target_bytes: int) -> dict:
    source = source_frames(count, 8100 + count); scan_id = f"local-{label.lower()}"; rows = []
    for run in range(3):
        request, frames, client = prepare(source, scan_id, f"{scan_id}-request-{run + 1}", target_bytes)
        multipart_started = time.perf_counter(); boundary = f"xfx-latency-{label}-{run}"; body = multipart_body(request, frames, boundary); multipart_ms = ms(multipart_started)
        fetch_started = time.perf_counter(); connection.request("POST", "/scene-spatial/geometry/analyze", body, {"Content-Type": f"multipart/form-data; boundary={boundary}", "Content-Length": str(len(body))}); response = connection.getresponse(); value = json.loads(response.read()); fetch_ms = ms(fetch_started)
        backend = value["timing_ms"]; backend_processing = float(backend["body_receive_ms"]) + float(backend["backend_total_after_body_received_ms"])
        rows.append({"request": run + 1, "connection": "COLD" if run == 0 else "REUSED", "http_status": response.status, "cache_status": value["cache_status"], "frame_count": count, "working_dimensions": "360x640", "payload_bytes": sum(map(len, frames)), **client, "multipart_build_ms": multipart_ms, "fetch_ms": fetch_ms, "body_receive_ms": backend["body_receive_ms"], "multipart_parse_ms": backend["multipart_parse_ms"], "validation_ms": backend["validation_ms"], "cache_ms": backend["cache_ms"], "solver_ms": backend["solver_ms"], "response_serialize_ms": backend["response_serialize_ms"], "backend_total_after_body_received_ms": backend["backend_total_after_body_received_ms"], "transport_and_queue_remainder_ms": round(max(0, fetch_ms - backend_processing), 3), "end_to_end_ms": round(client["client_preparation_ms"] + multipart_ms + fetch_ms, 3), "geometry_request_id": value["geometry_request_id"], "spatial_status": value["spatial_evidence"]["status"]})
    metrics = ("resize_ms", "encode_ms", "hash_ms", "multipart_build_ms", "fetch_ms", "body_receive_ms", "multipart_parse_ms", "validation_ms", "cache_ms", "solver_ms", "response_serialize_ms", "transport_and_queue_remainder_ms", "end_to_end_ms")
    summary = {name: {"p50": percentile([float(row[name]) for row in rows], 50), "p95": percentile([float(row[name]) for row in rows], 95)} for name in metrics}
    return {"label": label, "target_payload_bytes": target_bytes, "rows": rows, "summary": summary, "cold_warm_difference_ms": round(rows[0]["end_to_end_ms"] - percentile([float(row["end_to_end_ms"]) for row in rows[1:]], 50), 3)}


def main() -> None:
    parser = argparse.ArgumentParser(); parser.add_argument("--output", required=True); parser.add_argument("--url"); args = parser.parse_args(); SOLVER._result_cache.clear(); server = None; thread = None
    if args.url:
        parsed = urlparse(args.url); connection = http.client.HTTPSConnection(parsed.hostname, parsed.port or 443, timeout=30); path_label = f"HTTPS_QUICK_TUNNEL/{parsed.hostname}"
    else:
        server = ThreadingHTTPServer(("127.0.0.1", 0), Handler); thread = threading.Thread(target=server.serve_forever, daemon=True); thread.start(); connection = http.client.HTTPConnection("127.0.0.1", server.server_port, timeout=30); path_label = "LOCALHOST_HTTP_KEEP_ALIVE"
    try:
        quick = run_class(connection, "QUICK", 5, 124_485); wide = run_class(connection, "WIDE", 7, 220_363)
    finally:
        connection.close()
        if server is not None and thread is not None: server.shutdown(); server.server_close(); thread.join(timeout=2)
    limitations = ["PYTHON_GENERATED_CLIENT_NOT_BROWSER_MAIN_THREAD", "THREE_REQUEST_BOUNDED_SEQUENCE_PER_CLASS"]
    if not args.url: limitations.append("LOCALHOST_NOT_OPPO_TUNNEL")
    else: limitations.append("WORKSTATION_THROUGH_TUNNEL_NOT_OPPO_RADIO")
    output = {"schema": "xfx.p2-e2e-latency-decomposition", "schema_version": "0.3", "source": "GENERATED_MEDIA_ONLY", "path": path_label, "privacy": {"real_user_media": 0, "provider": 0, "luna": 0}, "classes": [quick, wide], "limitations": limitations}
    path = Path(args.output); path.parent.mkdir(parents=True, exist_ok=True); path.write_text(json.dumps(output, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__": main()

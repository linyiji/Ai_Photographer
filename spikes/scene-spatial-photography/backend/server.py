"""Minimal isolated first-party multipart API for the Scene Spatial spike."""
from __future__ import annotations

import argparse
import json
import re
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from solver import GeometrySolver, SOLVER_VERSION


MAX_BODY_BYTES = 6 * 1024 * 1024
SOLVER = GeometrySolver()


def _elapsed_ms(started: float) -> float:
    return round((time.perf_counter() - started) * 1000, 3)


def parse_multipart(content_type: str, body: bytes) -> tuple[dict, list[bytes]]:
    match = re.search(r"boundary=(?:\"([^\"]+)\"|([^;\s]+))", content_type, re.IGNORECASE)
    if match is None:
        raise ValueError("MULTIPART_BOUNDARY_REQUIRED")
    boundary = (match.group(1) or match.group(2)).encode("ascii"); marker = b"--" + boundary; delimiter = b"\r\n" + marker
    if not body.startswith(marker + b"\r\n"):
        raise ValueError("MULTIPART_BODY_INVALID")
    metadata = None; files: dict[str, bytes] = {}; cursor = len(marker) + 2
    while cursor < len(body):
        header_end = body.find(b"\r\n\r\n", cursor)
        if header_end < 0:
            raise ValueError("MULTIPART_PART_INVALID")
        header_bytes = body[cursor:header_end]; payload_start = header_end + 4; next_boundary = body.find(delimiter, payload_start)
        if next_boundary < 0:
            raise ValueError("MULTIPART_CLOSING_BOUNDARY_REQUIRED")
        payload = body[payload_start:next_boundary]
        disposition = next((line.decode("latin-1") for line in header_bytes.split(b"\r\n") if line.lower().startswith(b"content-disposition:")), "")
        name_match = re.search(r'name="([^"]+)"', disposition); name = name_match.group(1) if name_match else None
        if name == "metadata": metadata = json.loads(payload.decode("utf-8"))
        elif name and name.startswith("frame_"): files[name] = payload
        cursor = next_boundary + len(delimiter)
        if body[cursor:cursor + 2] == b"--": break
        if body[cursor:cursor + 2] != b"\r\n": raise ValueError("MULTIPART_BOUNDARY_INVALID")
        cursor += 2
    if metadata is None:
        raise ValueError("METADATA_REQUIRED")
    ordered = [files[frame["file_field"]] for frame in metadata.get("selected_geometry_frames", []) if frame.get("file_field") in files]
    return metadata, ordered


class Handler(BaseHTTPRequestHandler):
    server_version = "SceneSpatialSpike/0.2"
    protocol_version = "HTTP/1.1"

    def do_GET(self) -> None:
        if self.path == "/scene-spatial/geometry/health":
            self._json(200, {"status": "ok", "solver_version": SOLVER_VERSION, "authority": "FIRST_PARTY_BACKEND_GEOMETRY_SOLVER"})
        else:
            self._json(404, {"error": "NOT_FOUND"})

    def do_POST(self) -> None:
        handler_enter = time.perf_counter(); geometry_request_id = "UNKNOWN"
        if self.path != "/scene-spatial/geometry/analyze":
            self._json(404, {"error": "NOT_FOUND"}); return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > MAX_BODY_BYTES:
                raise ValueError("PAYLOAD_SIZE_OUT_OF_BOUNDS")
            body_read_start = time.perf_counter(); body = self.rfile.read(length); body_read_end = time.perf_counter(); body_receive_ms = round((body_read_end - body_read_start) * 1000, 3)
            parse_start = time.perf_counter(); metadata, frames = parse_multipart(self.headers.get("Content-Type", ""), body); parse_end = time.perf_counter(); multipart_parse_ms = round((parse_end - parse_start) * 1000, 3)
            geometry_request_id = str(metadata.get("geometry_request_id", "UNKNOWN")); result = SOLVER.analyze(metadata, frames)
            timing = result["timing_ms"]; validation_ms = float(timing.get("validation_ms", 0)); cache_ms = float(timing.get("cache_ms", 0)); solver_ms = float(timing.get("solver_ms", 0))
            trace = {
                "request_handler_enter": 0.0,
                "request_body_read_start": round((body_read_start - handler_enter) * 1000, 3),
                "request_body_read_end": round((body_read_end - handler_enter) * 1000, 3),
                "multipart_parse_start": round((parse_start - handler_enter) * 1000, 3),
                "multipart_parse_end": round((parse_end - handler_enter) * 1000, 3),
            }
            validation_start = trace["multipart_parse_end"]; validation_end = round(validation_start + validation_ms, 3); cache_end = round(validation_end + cache_ms, 3); solver_end = round(cache_end + solver_ms, 3)
            trace.update({"validation_start": validation_start, "validation_end": validation_end, "cache_lookup_start": validation_end, "cache_lookup_end": cache_end, "solver_start": cache_end, "solver_end": solver_end, "response_serialize_start": round(_elapsed_ms(handler_enter), 3)})
            timing.update({"body_receive_ms": body_receive_ms, "multipart_parse_ms": multipart_parse_ms, "validation_ms": validation_ms, "cache_ms": cache_ms, "solver_ms": solver_ms})
            result["backend_trace_ms"] = trace
            self._timed_json(200, result, body_read_end)
            print(f"scene-spatial-backend request_id={geometry_request_id} status=200 cache={result['cache_status']} body={body_receive_ms}ms parse={multipart_parse_ms}ms solver={solver_ms}ms", flush=True)
        except (ValueError, KeyError, json.JSONDecodeError) as error:
            self._json(400, {"geometry_request_id": geometry_request_id, "error": str(error)})
        except Exception as error:  # pragma: no cover - bounded spike diagnostic
            self._json(500, {"geometry_request_id": geometry_request_id, "error": "GEOMETRY_SOLVER_FAILED", "detail": type(error).__name__})

    def _timed_json(self, status: int, value: dict, body_read_end: float) -> None:
        serialize_started = time.perf_counter(); json.dumps(value, ensure_ascii=False); serialize_ms = _elapsed_ms(serialize_started)
        value["timing_ms"]["response_serialize_ms"] = serialize_ms
        value["timing_ms"]["backend_total_after_body_received_ms"] = round((time.perf_counter() - body_read_end) * 1000, 3)
        value["backend_trace_ms"]["response_serialize_end"] = round(value["backend_trace_ms"]["response_serialize_start"] + serialize_ms, 3)
        self._json(status, value)

    def _json(self, status: int, value: dict) -> None:
        encoded = (json.dumps(value, ensure_ascii=False, separators=(",", ":")) + "\n").encode("utf-8")
        self.send_response(status); self.send_header("Content-Type", "application/json; charset=utf-8"); self.send_header("Content-Length", str(len(encoded))); self.end_headers(); self.wfile.write(encoded)

    def log_message(self, format: str, *args: object) -> None:
        print("scene-spatial-backend", format % args)


def main() -> None:
    parser = argparse.ArgumentParser(); parser.add_argument("--host", default="127.0.0.1"); parser.add_argument("--port", type=int, default=8765); args = parser.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), Handler)
    print(f"Scene Spatial V0.2 backend listening on http://{args.host}:{args.port}", flush=True)
    server.serve_forever()


if __name__ == "__main__": main()

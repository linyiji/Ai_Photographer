"""Minimal isolated first-party multipart API for the Scene Spatial spike."""
from __future__ import annotations

import argparse
import json
from email.parser import BytesParser
from email.policy import default
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from solver import GeometrySolver, SOLVER_VERSION


MAX_BODY_BYTES = 6 * 1024 * 1024
SOLVER = GeometrySolver()


def parse_multipart(content_type: str, body: bytes) -> tuple[dict, list[bytes]]:
    message = BytesParser(policy=default).parsebytes(b"Content-Type: " + content_type.encode("ascii") + b"\r\nMIME-Version: 1.0\r\n\r\n" + body)
    if not message.is_multipart():
        raise ValueError("MULTIPART_REQUIRED")
    metadata = None; files: dict[str, bytes] = {}
    for part in message.iter_parts():
        name = part.get_param("name", header="content-disposition")
        payload = part.get_payload(decode=True) or b""
        if name == "metadata": metadata = json.loads(payload.decode("utf-8"))
        elif name and name.startswith("frame_"): files[name] = payload
    if metadata is None:
        raise ValueError("METADATA_REQUIRED")
    ordered = [files[frame["file_field"]] for frame in metadata.get("selected_geometry_frames", []) if frame.get("file_field") in files]
    return metadata, ordered


class Handler(BaseHTTPRequestHandler):
    server_version = "SceneSpatialSpike/0.2"

    def do_GET(self) -> None:
        if self.path == "/scene-spatial/geometry/health":
            self._json(200, {"status": "ok", "solver_version": SOLVER_VERSION, "authority": "FIRST_PARTY_BACKEND_GEOMETRY_SOLVER"})
        else:
            self._json(404, {"error": "NOT_FOUND"})

    def do_POST(self) -> None:
        if self.path != "/scene-spatial/geometry/analyze":
            self._json(404, {"error": "NOT_FOUND"}); return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > MAX_BODY_BYTES:
                raise ValueError("PAYLOAD_SIZE_OUT_OF_BOUNDS")
            metadata, frames = parse_multipart(self.headers.get("Content-Type", ""), self.rfile.read(length))
            self._json(200, SOLVER.analyze(metadata, frames))
        except (ValueError, KeyError, json.JSONDecodeError) as error:
            self._json(400, {"error": str(error)})
        except Exception as error:  # pragma: no cover - bounded spike diagnostic
            self._json(500, {"error": "GEOMETRY_SOLVER_FAILED", "detail": type(error).__name__})

    def _json(self, status: int, value: dict) -> None:
        encoded = (json.dumps(value, ensure_ascii=False) + "\n").encode("utf-8")
        self.send_response(status); self.send_header("Content-Type", "application/json; charset=utf-8"); self.send_header("Content-Length", str(len(encoded))); self.end_headers(); self.wfile.write(encoded)

    def log_message(self, format: str, *args: object) -> None:
        print("scene-spatial-backend", format % args)


def main() -> None:
    parser = argparse.ArgumentParser(); parser.add_argument("--host", default="127.0.0.1"); parser.add_argument("--port", type=int, default=8765); args = parser.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), Handler)
    print(f"Scene Spatial V0.2 backend listening on http://{args.host}:{args.port}", flush=True)
    server.serve_forever()


if __name__ == "__main__": main()

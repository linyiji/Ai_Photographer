from __future__ import annotations

import hashlib
import os
import re
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from ..repository import Repository
from ..service import DomainError


MAX_ASSET_BYTES = 20 * 1024 * 1024
ASSET_ID_PATTERN = re.compile(r"^upload-[a-f0-9]{24}$")
ALLOWED_TYPES = {
    "image/jpeg": {"extensions": {".jpg", ".jpeg"}, "signature": lambda data: data.startswith(b"\xff\xd8\xff")},
    "image/png": {"extensions": {".png"}, "signature": lambda data: data.startswith(b"\x89PNG\r\n\x1a\n")},
    "image/webp": {"extensions": {".webp"}, "signature": lambda data: len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP"},
}


class DevelopmentLocalStorageAdapter:
    adapter_id = "development-local-storage-v1"
    adapter_version = "1.0.0"
    support_level = "SUPPORTED"

    def __init__(self, root: Path, repository: Repository, max_bytes: int = MAX_ASSET_BYTES):
        self.root = root.resolve()
        self.repository = repository
        self.max_bytes = max_bytes
        self.root.mkdir(parents=True, exist_ok=True)

    async def store_upload(self, upload: UploadFile) -> dict:
        mime_type = (upload.content_type or "").lower()
        original_name = Path(upload.filename or "").name
        extension = Path(original_name).suffix.lower()
        rules = ALLOWED_TYPES.get(mime_type)
        if not rules or extension not in rules["extensions"]:
            raise DomainError("INVALID_ASSET", "MIME type and extension are not an allowed image pair.", 422)
        asset_id = f"upload-{uuid4().hex[:24]}"
        stored_name = f"{asset_id}{extension}"
        target = self._safe_target(stored_name)
        temporary = self._safe_target(f".{asset_id}.part")
        size = 0
        digest = hashlib.sha256()
        prefix = bytearray()
        try:
            with temporary.open("xb") as output:
                while chunk := await upload.read(1024 * 1024):
                    size += len(chunk)
                    if size > self.max_bytes:
                        raise DomainError("INVALID_ASSET", f"Asset exceeds {self.max_bytes} bytes.", 413)
                    if len(prefix) < 16:
                        prefix.extend(chunk[: 16 - len(prefix)])
                    digest.update(chunk)
                    output.write(chunk)
            if size == 0 or not rules["signature"](bytes(prefix)):
                raise DomainError("INVALID_ASSET", "Asset is empty or its content signature does not match MIME.", 422)
            os.replace(temporary, target)
            created_at = datetime.now(UTC).isoformat()
            metadata = {"asset_id": asset_id, "asset_kind": "UPLOADED_BINARY", "mime_type": mime_type, "size_bytes": size, "sha256": digest.hexdigest(), "created_at": created_at, "source": "USER_AUTHORIZED_UPLOAD", "storage_ref": f"local-asset://{asset_id}", "original_name": original_name}
            try:
                with self.repository.connect() as connection:
                    connection.execute("INSERT INTO stored_assets VALUES(?,?,?,?,?,?,?,?,?)", (asset_id, mime_type, size, metadata["sha256"], created_at, metadata["source"], metadata["storage_ref"], stored_name, original_name))
            except Exception as exc:
                target.unlink(missing_ok=True)
                raise DomainError("STORAGE_FAILURE", "Asset metadata could not be persisted.", 503) from exc
            return metadata
        except DomainError:
            temporary.unlink(missing_ok=True)
            raise
        finally:
            await upload.close()

    def metadata(self, asset_id: str) -> dict:
        self._validate_asset_id(asset_id)
        with self.repository.connect() as connection:
            row = connection.execute("SELECT * FROM stored_assets WHERE asset_id=?", (asset_id,)).fetchone()
        if not row:
            raise DomainError("ASSET_NOT_FOUND", "Stored asset does not exist.", 404)
        result = dict(row)
        result.pop("stored_name", None)
        return result

    def content(self, asset_id: str) -> tuple[Path, dict]:
        self._validate_asset_id(asset_id)
        with self.repository.connect() as connection:
            row = connection.execute("SELECT * FROM stored_assets WHERE asset_id=?", (asset_id,)).fetchone()
        if not row:
            raise DomainError("ASSET_NOT_FOUND", "Stored asset does not exist.", 404)
        target = self._safe_target(row["stored_name"])
        if not target.is_file():
            raise DomainError("STORAGE_FAILURE", "Stored asset content is unavailable.", 503)
        metadata = dict(row)
        metadata.pop("stored_name", None)
        return target, metadata

    def _safe_target(self, generated_name: str) -> Path:
        if Path(generated_name).name != generated_name or any(token in generated_name for token in ("..", "\\", "/", ":")):
            raise DomainError("INVALID_ASSET", "Unsafe storage identity.", 422)
        target = (self.root / generated_name).resolve()
        if target.parent != self.root:
            raise DomainError("INVALID_ASSET", "Storage path escaped the configured root.", 422)
        return target

    @staticmethod
    def _validate_asset_id(asset_id: str) -> None:
        if not ASSET_ID_PATTERN.fullmatch(asset_id):
            raise DomainError("INVALID_ASSET", "Invalid stable asset identity.", 422)

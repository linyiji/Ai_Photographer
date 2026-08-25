from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime
from uuid import uuid4

from ..service import DomainError, SessionService
from .gateway import AIProviderGateway
from .models import AIProviderRequest, AIProviderResponse
from .registry import ModelRegistry, PromptRegistry
from .validation import validate_candidate_envelope


class CaptureQAAdapter:
    capability = "QA"

    def parse_candidate(
        self,
        response: AIProviderResponse,
        request: AIProviderRequest,
    ) -> tuple[dict | None, list[str]]:
        candidate = {
            "schema_version": "1.0.0",
            "candidate_id": f"qa-candidate-{uuid4().hex[:16]}",
            "candidate_kind": "QA",
            "created_at": datetime.now(UTC).isoformat(),
            "producer": {
                "producer_id": response.model_identifier,
                "producer_type": "AI_CAPABILITY",
            },
            "confidence": response.structured_output.get("confidence"),
            "evidence_refs": list(request.input_asset_ids),
            "payload": response.structured_output,
            "disposition": "CANDIDATE",
            "promotion_gate": "M06_CAPTURE_QA_PROVIDER_ACCEPTANCE",
        }
        errors = validate_candidate_envelope(candidate)
        return (candidate if not errors else None), errors


class CaptureQAShadowService:
    def __init__(
        self,
        sessions: SessionService,
        storage,
        gateway: AIProviderGateway,
        prompts: PromptRegistry,
        models: ModelRegistry,
    ):
        self.sessions = sessions
        self.storage = storage
        self.gateway = gateway
        self.prompts = prompts
        self.models = models
        self.adapter = CaptureQAAdapter()

    @staticmethod
    def _canonical_digest(session: dict) -> str:
        projection = {
            "workflow_stage": session["workflow_stage"],
            "revision": session["revision"],
            "state": session["state"],
            "candidates": session["candidates"],
            "assets": session["assets"],
            "events": session["events"],
        }
        return hashlib.sha256(
            json.dumps(projection, sort_keys=True, separators=(",", ":")).encode()
        ).hexdigest()

    def run(self, session_id: str, fixture_signal: str = "already_good") -> dict:
        before = self.sessions.get(session_id)
        capture = before["state"].get("capture", {})
        uploaded_asset_id = capture.get("uploaded_asset_id")
        if before["workflow_stage"] != "QA" or not uploaded_asset_id:
            raise DomainError(
                "UNCONFIRMED_ASSET",
                "Capture QA shadow requires an accepted uploaded CaptureAsset at QA.",
                422,
            )
        path, metadata = self.storage.content(uploaded_asset_id)
        prompt = self.prompts.get("capture-qa-shadow")
        model = self.models.get("fixture-capture-qa-v1")
        request = AIProviderRequest(
            capability="QA",
            prompt=prompt,
            model=model,
            input_asset_ids=[uploaded_asset_id, capture["asset_id"]],
            context={
                "fixture_signal": fixture_signal,
                "selected_target": before["state"].get("selected_target"),
                "shot_direction": before["state"].get("shot"),
                "reality_context": before["state"].get("reality"),
            },
            image_bytes=path.read_bytes(),
            mime_type=metadata["mime_type"],
        )
        before_digest = self._canonical_digest(before)
        result = self.gateway.execute(self.adapter, request, session_id)
        after = self.sessions.get(session_id)
        after_digest = self._canonical_digest(after)
        if before_digest != after_digest:
            raise RuntimeError("Shadow QA mutated canonical Session authority")
        return {
            "mode": "SHADOW",
            "canonical_adapter": "FAKE_INTERNAL_ONLY",
            "shadow_adapter": "XFX_FIXTURE_PROVIDER",
            "candidate_result": result.model_dump(mode="json"),
            "shadow_state_mutation": 0,
            "canonical_stage": after["workflow_stage"],
            "canonical_revision": after["revision"],
        }

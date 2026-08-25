from __future__ import annotations

from uuid import uuid4

from .models import AIProviderRequest, AIProviderResponse, ModelSpec


class ProviderFailure(Exception):
    def __init__(self, classification: str, message: str, retryable: bool = False):
        super().__init__(message)
        self.classification = classification
        self.retryable = retryable


class FixtureAIProvider:
    provider_id = "XFX_FIXTURE_PROVIDER"

    SIGNAL_OUTPUTS = {
        "already_good": ("ACCEPT", ["composition_match"], ["composition_match"]),
        "good_match": ("ACCEPT", ["target_match"], ["target_match"]),
        "subject_too_small": ("RETAKE_FRAMING", ["subject_too_small"], ["subject_too_small"]),
        "subject_too_large": ("RETAKE_FRAMING", ["subject_too_large"], ["subject_too_large"]),
        "horizontal_offset": ("RETAKE_POSITION", ["horizontal_offset"], ["horizontal_offset"]),
        "subject_missing": ("RETAKE_POSITION", ["subject_missing"], ["subject_missing"]),
        "blur": ("RETAKE_MICRO", ["blur"], ["blur"]),
        "underexposure": ("ACCEPT_WITH_REPAIR", ["underexposure"], ["underexposure"]),
        "severe_underexposure": ("RETAKE_MICRO", ["severe_underexposure"], ["severe_underexposure"]),
        "overexposure": ("ACCEPT_WITH_REPAIR", ["overexposure"], ["overexposure"]),
        "severe_overexposure": ("RETAKE_MICRO", ["severe_overexposure"], ["severe_overexposure"]),
        "low_contrast": ("ACCEPT_WITH_REPAIR", ["low_contrast"], ["low_contrast"]),
        "background_distraction": ("RETAKE_FRAMING", ["background_distraction"], ["background_distraction"]),
        "partial_occlusion": ("RETAKE_POSITION", ["partial_occlusion"], ["partial_occlusion"]),
        "orientation_issue": ("RETAKE_MICRO", ["orientation_issue"], ["orientation_issue"]),
        "invalid_aspect": ("RETAKE_FRAMING", ["invalid_aspect"], ["invalid_aspect"]),
        "retake_framing": ("RETAKE_FRAMING", ["framing_mismatch"], ["framing_mismatch"]),
        "fixable_light": ("ACCEPT_WITH_REPAIR", ["fixable_light"], ["fixable_light"]),
        "pose_mismatch": ("RETAKE_POSE", ["pose_mismatch"], ["pose_mismatch"]),
        "plan_mismatch": ("REPLAN", ["shot_plan_mismatch"], ["shot_plan_mismatch"]),
        "occlusion_and_blur": ("RETAKE_POSITION", ["partial_occlusion", "blur"], ["partial_occlusion", "blur"]),
        "good_low_texture": ("ACCEPT", ["target_match", "low_texture_non_blocking"], ["target_match"]),
    }

    def __init__(self, model: ModelSpec, fault: str | None = None):
        self.model = model
        self.fault = fault
        self.call_count = 0

    def execute(self, request: AIProviderRequest) -> AIProviderResponse:
        self.call_count += 1
        if self.fault == "PROVIDER_TIMEOUT":
            raise ProviderFailure("TIMEOUT", "Fixture timeout", retryable=True)
        if self.fault == "PROVIDER_RATE_LIMIT":
            raise ProviderFailure("RATE_LIMIT", "Fixture rate limit", retryable=True)
        if self.fault == "PROVIDER_UNAVAILABLE":
            raise ProviderFailure("PROVIDER_UNAVAILABLE", "Fixture unavailable", retryable=True)
        if self.fault == "PROVIDER_AUTH":
            raise ProviderFailure("AUTH", "Authorization: fixture-secret", retryable=False)
        if self.fault == "PROVIDER_INVALID_OUTPUT":
            output = {"technical_result": "FREE_TEXT", "technical_reasons": "looks okay"}
        else:
            signal = str(request.context.get("fixture_signal", "already_good"))
            result, reasons, observations = self.SIGNAL_OUTPUTS.get(
                signal,
                ("ACCEPT", ["no_critical_issue"], ["no_critical_issue"]),
            )
            output = {
                "technical_result": result,
                "technical_reasons": reasons,
                "observations": observations,
                "confidence": 0.95,
            }
        return AIProviderResponse(
            provider_request_id=f"fixture-{uuid4().hex[:12]}",
            model_identifier=f"{self.model.model_id}@{self.model.model_version}",
            structured_output=output,
            usage={"input_tokens": 0, "output_tokens": 0},
            estimated_cost=0.0,
        )

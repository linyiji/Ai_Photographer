from __future__ import annotations

import json
from pathlib import Path

from .models import ModelSpec, PromptSpec


class PromptRegistry:
    def __init__(self, path: Path):
        self.path = path
        self._items = {
            item["prompt_id"]: PromptSpec.model_validate(item)
            for item in json.loads(path.read_text(encoding="utf-8"))["prompts"]
        }

    def get(self, prompt_id: str) -> PromptSpec:
        if prompt_id not in self._items:
            raise KeyError(f"Unknown prompt: {prompt_id}")
        return self._items[prompt_id]


class ModelRegistry:
    def __init__(self, path: Path):
        self.path = path
        self._items = {
            item["model_spec_id"]: ModelSpec.model_validate(item)
            for item in json.loads(path.read_text(encoding="utf-8"))["models"]
        }

    def get(self, model_spec_id: str) -> ModelSpec:
        if model_spec_id not in self._items:
            raise KeyError(f"Unknown model spec: {model_spec_id}")
        return self._items[model_spec_id]

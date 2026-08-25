"""Governed platform runtime and development storage adapters."""

from .runtime import PlatformAdapterRegistry
from .storage import DevelopmentLocalStorageAdapter

__all__ = ["DevelopmentLocalStorageAdapter", "PlatformAdapterRegistry"]

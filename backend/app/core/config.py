"""Application configuration using environment variables."""

import json
import os
from typing import Any

from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Accora Core application settings.

    All sensitive values are loaded from environment variables.
    Never hard-code secrets in source code.
    """

    app_name: str = "Accora Core API"
    app_version: str = "0.1.0"
    debug: bool = False

    # CORS
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "file://",
    ]

    # AI Provider (Google Gemini / Mock / Alibaba Cloud)
    ai_provider: str = "gemini"  # "gemini" | "mock" | "alibaba"
    gemini_api_key: str = ""
    gemini_model_id: str = "gemini-3.5-flash-lite"
    gemini_endpoint: str = ""

    alibaba_api_key: str = ""
    alibaba_model_id: str = "qwen-turbo"
    alibaba_endpoint: str = ""

    # Data & Database
    demo_mode: bool = False  # Disabled by default for production; configure via ACCORA_DEMO_MODE
    database_path: str = "accora.db"

    model_config = {"env_file": [".env", "../.env"], "env_prefix": "ACCORA_", "extra": "ignore"}

    @field_validator("gemini_api_key", mode="before")
    @classmethod
    def assemble_gemini_api_key(cls, v: Any) -> str:
        key = ""
        if v and str(v).strip():
            key = str(v).strip()
        else:
            key = (os.environ.get("ACCORA_GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY") or "").strip()
        if key.lower().startswith("api key "):
            key = key[8:].strip()
        elif key.lower().startswith("bearer "):
            key = key[7:].strip()
        return key

    @field_validator("gemini_model_id", mode="before")
    @classmethod
    def assemble_gemini_model_id(cls, v: Any) -> str:
        val = ""
        if v and str(v).strip():
            val = str(v).strip()
        else:
            val = (os.environ.get("ACCORA_GEMINI_MODEL") or os.environ.get("GEMINI_MODEL") or "gemini-3.5-flash-lite").strip()
        if val in ("gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash"):
            val = "gemini-3.5-flash-lite"
        return val

    @field_validator("cors_origins", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> list[str]:
        if isinstance(v, str):
            v = v.strip()
            if not v:
                return []
            if v.startswith("[") and v.endswith("]"):
                try:
                    parsed = json.loads(v)
                    if isinstance(parsed, list):
                        return [str(item).strip() for item in parsed if str(item).strip()]
                except Exception:
                    pass
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        if isinstance(v, list):
            return [str(item).strip() for item in v if str(item).strip()]
        return v


settings = Settings()

"""Application configuration using environment variables."""

import json
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

    # AI Provider (Alibaba Cloud)
    ai_provider: str = "mock"  # "alibaba" | "mock"
    alibaba_api_key: str = ""
    alibaba_model_id: str = "qwen-turbo"
    alibaba_endpoint: str = ""

    # Data & Database
    demo_mode: bool = False  # Disabled by default for production; configure via ACCORA_DEMO_MODE
    database_path: str = "accora.db"

    model_config = {"env_file": ".env", "env_prefix": "ACCORA_"}

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

"""Application configuration using environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Accora application settings.

    All sensitive values are loaded from environment variables.
    Never hard-code secrets in source code.
    """

    app_name: str = "Accora API"
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

    # Data
    demo_mode: bool = True

    model_config = {"env_file": ".env", "env_prefix": "ACCORA_"}


settings = Settings()

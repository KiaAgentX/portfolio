from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=False)

    app_env: str = "dev"
    tenant_id: str = "default"
    log_level: str = "INFO"
    public_base_url: str = "http://localhost:8080"
    port: int = 8080

    database_url: str = "postgresql+asyncpg://hermes:hermes@localhost:5432/hermesdesk"
    redis_url: str = "redis://localhost:6379/0"

    s3_endpoint: str = "http://localhost:9000"
    s3_region: str = "us-east-1"
    s3_bucket: str = "hermesdesk"
    s3_access_key_id: str = "minio"
    s3_secret_access_key: str = "minio-minio"
    s3_force_path_style: bool = True

    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: str = ""

    openai_base_url: str = "https://openrouter.ai/api/v1"
    openai_api_key: str = ""
    llm_model: str = "openai/gpt-4o"
    router_model: str = "openai/gpt-4o-mini"
    embedding_model: str = "text-embedding-3-small"

    hermes_base_url: str = "http://localhost:8642/v1"
    hermes_api_key: str = "hermes-local-key"

    telegram_customer_bot_token: str = ""
    telegram_customer_secret_token: str = ""
    telegram_admin_bot_token: str = ""
    telegram_admin_secret_token: str = ""
    telegram_admin_user_ids: str = ""

    whatsapp_provider: str = "meta"
    meta_waba_token: str = ""
    meta_waba_phone_id: str = ""
    meta_app_secret: str = ""
    meta_verify_token: str = "change-me-meta-verify"
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_whatsapp_from: str = ""

    email_provider: str = "resend"
    resend_api_key: str = ""
    sendgrid_api_key: str = ""
    email_from: str = "desk@example.com"
    email_inbound_secret: str = ""

    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    jwt_hours: int = 8
    admin_bootstrap_email: str = "admin@local"
    admin_bootstrap_password: str = "changeme"

    approval_timeout_sec: int = 600
    ack_on_ingest: bool = True
    embed_tickets: bool = False
    dev_inline_jobs: bool = False
    max_inbound_chars: int = 8000
    max_reply_chars: int = 4000

    @property
    def admin_telegram_ids(self) -> list[int]:
        if not self.telegram_admin_user_ids.strip():
            return []
        return [int(x.strip()) for x in self.telegram_admin_user_ids.split(",") if x.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

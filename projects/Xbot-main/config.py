"""Launch-bot configuration — everything from environment variables."""
from __future__ import annotations

import os
from dataclasses import dataclass, field

from dotenv import load_dotenv

load_dotenv()


def _getenv(name: str, default: str = "") -> str:
    return (os.environ.get(name, default) or "").strip()


def _getenv_int(name: str, default: int) -> int:
    try:
        return int((os.environ.get(name, str(default)) or "").strip())
    except ValueError:
        return default


def _getenv_float(name: str, default: float) -> float:
    try:
        return float((os.environ.get(name, str(default)) or "").strip())
    except ValueError:
        return default


def _getenv_bool(name: str, default: bool) -> bool:
    val = (os.environ.get(name, "") or "").strip().lower()
    if not val:
        return default
    return val in ("1", "true", "yes", "y", "on")


def _getenv_id_set(name: str) -> set[int]:
    raw = (os.environ.get(name, "") or "").strip()
    if not raw:
        return set()
    out: set[int] = set()
    for part in raw.split(","):
        part = part.strip()
        if part.isdigit():
            out.add(int(part))
    return out


DEFAULT_SYSTEM_PROMPT = (
    "You are a helpful Telegram assistant (Arena-agent style). "
    "Answer clearly and concisely. Support Persian (Farsi) and English: "
    "always reply in the same language the user writes in. "
    "Keep formatting light for Telegram."
)


@dataclass
class Settings:
    telegram_token: str = field(default_factory=lambda: _getenv("TELEGRAM_BOT_TOKEN"))
    openai_api_key: str = field(default_factory=lambda: _getenv("OPENAI_API_KEY"))
    openai_base_url: str = field(
        default_factory=lambda: _getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    )
    chat_model: str = field(default_factory=lambda: _getenv("CHAT_MODEL", "gpt-4o-mini"))
    max_tokens: int = field(default_factory=lambda: _getenv_int("MAX_TOKENS", 1500))
    temperature: float = field(default_factory=lambda: _getenv_float("TEMPERATURE", 0.7))
    system_prompt: str = field(default_factory=lambda: _getenv("SYSTEM_PROMPT", DEFAULT_SYSTEM_PROMPT))
    max_history: int = field(default_factory=lambda: _getenv_int("MAX_HISTORY", 30))

    image_model: str = field(default_factory=lambda: _getenv("IMAGE_MODEL", "dall-e-3"))
    image_api_key: str = field(default_factory=lambda: _getenv("IMAGE_API_KEY"))
    image_base_url: str = field(default_factory=lambda: _getenv("IMAGE_BASE_URL").rstrip("/"))

    tts_model: str = field(default_factory=lambda: _getenv("TTS_MODEL", "tts-1"))
    tts_voice: str = field(default_factory=lambda: _getenv("TTS_VOICE", "alloy"))
    stt_model: str = field(default_factory=lambda: _getenv("STT_MODEL", "whisper-1"))
    audio_api_key: str = field(default_factory=lambda: _getenv("AUDIO_API_KEY"))
    audio_base_url: str = field(default_factory=lambda: _getenv("AUDIO_BASE_URL").rstrip("/"))

    # voice output: "edge" (free, great Persian) or "openai"
    tts_provider: str = field(default_factory=lambda: _getenv("TTS_PROVIDER", "edge").lower())
    tts_gender: str = field(default_factory=lambda: _getenv("TTS_GENDER", "female").lower())
    edge_voice_fa_female: str = field(default_factory=lambda: _getenv("EDGE_VOICE_FA_FEMALE", "fa-IR-DilaraNeural"))
    edge_voice_fa_male: str = field(default_factory=lambda: _getenv("EDGE_VOICE_FA_MALE", "fa-IR-FaridNeural"))
    edge_voice_en_female: str = field(default_factory=lambda: _getenv("EDGE_VOICE_EN_FEMALE", "en-US-AvaNeural"))
    edge_voice_en_male: str = field(default_factory=lambda: _getenv("EDGE_VOICE_EN_MALE", "en-US-AndrewNeural"))
    edge_rate: str = field(default_factory=lambda: _getenv("EDGE_RATE", "+0%"))
    fa_threshold: float = field(default_factory=lambda: _getenv_float("FA_THRESHOLD", 0.2))
    default_mode: str = field(default_factory=lambda: _getenv("DEFAULT_MODE", "text").lower())

    # access: empty allowed = public; admins approve orders/quotes/tickets
    allowed_user_ids: set[int] = field(default_factory=lambda: _getenv_id_set("ALLOWED_USER_IDS"))
    admin_ids: set[int] = field(default_factory=lambda: _getenv_id_set("ADMIN_IDS"))

    db_path: str = field(default_factory=lambda: _getenv("DB_PATH", "data/bot.db"))
    catalog_path: str = field(default_factory=lambda: _getenv("CATALOG_PATH", "catalog.json"))
    port: int = field(default_factory=lambda: _getenv_int("PORT", 0))
    default_lang: str = field(default_factory=lambda: _getenv("LAUNCH_LANG", "fa").lower() or "fa")

    # unified launcher (run.py): bot + web in one process
    run_bot: bool = field(default_factory=lambda: _getenv_bool("RUN_BOT", True))
    run_web: bool = field(default_factory=lambda: _getenv_bool("RUN_WEB", True))
    # web admin panel login (REQUIRED for /admin — pick strong values!)
    web_password: str = field(default_factory=lambda: _getenv("WEB_PASSWORD"))
    web_secret: str = field(default_factory=lambda: _getenv("WEB_SECRET", "change-me-in-prod"))
    # public URL of the deployment (for links in bot messages, optional)
    base_url: str = field(default_factory=lambda: _getenv("BASE_URL").rstrip("/"))


settings = Settings()

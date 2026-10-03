"""llm layer: model clients — chat/vision/image/speech + conversation memory.

Pure model access: no Telegram/Flask imports. Callers pass plain data in
and get plain data out. Settings are read from config at call time so
admin overrides (refresh_settings) apply without restart.
"""
from __future__ import annotations

import asyncio
import base64
import logging
import os

import httpx
from openai import AsyncOpenAI

from config import settings

log = logging.getLogger("launch-llm")

_chat_client: AsyncOpenAI | None = None
_image_client: AsyncOpenAI | None = None
_audio_client: AsyncOpenAI | None = None


def chat_client() -> AsyncOpenAI:
    global _chat_client
    if _chat_client is None:
        _chat_client = AsyncOpenAI(
            api_key=settings.openai_api_key, base_url=settings.openai_base_url, timeout=120.0
        )
    return _chat_client


def image_client() -> AsyncOpenAI:
    global _image_client
    if _image_client is None:
        _image_client = AsyncOpenAI(
            api_key=settings.image_api_key or settings.openai_api_key,
            base_url=settings.image_base_url or settings.openai_base_url,
            timeout=180.0,
        )
    return _image_client


def audio_client() -> AsyncOpenAI:
    global _audio_client
    if _audio_client is None:
        _audio_client = AsyncOpenAI(
            api_key=settings.audio_api_key or settings.openai_api_key,
            base_url=settings.audio_base_url or settings.openai_base_url,
            timeout=180.0,
        )
    return _audio_client


def reset_clients() -> None:
    """Drop cached clients (call after connection keys change)."""
    global _chat_client, _image_client, _audio_client
    _chat_client = _image_client = _audio_client = None


# ------------------------------------------------------- conversation memory

_histories: dict[int, list[dict]] = {}
_lock = asyncio.Lock()


async def remember(user_id: int, role: str, content: str, max_history: int = 30) -> None:
    async with _lock:
        h = _histories.setdefault(user_id, [])
        h.append({"role": role, "content": content})
        if len(h) > max_history:
            del h[: len(h) - max_history]


async def history(user_id: int) -> list[dict]:
    async with _lock:
        return list(_histories.get(user_id, []))


async def clear_history(user_id: int) -> None:
    async with _lock:
        _histories.pop(user_id, None)


# ------------------------------------------------------------------ chat

async def chat_complete(messages: list[dict], model: str = "",
                        temperature: float | None = None,
                        max_tokens: int | None = None) -> str:
    """One chat completion. `messages` may include multimodal (vision) parts."""
    resp = await chat_client().chat.completions.create(
        model=model or settings.chat_model,
        messages=messages,  # type: ignore[arg-type]
        temperature=settings.temperature if temperature is None else temperature,
        max_tokens=settings.max_tokens if max_tokens is None else max_tokens,
    )
    return ((resp.choices[0].message.content or "").strip() or "(empty response)")


async def list_models() -> list[str]:
    models = await chat_client().models.list()
    return sorted(m.id for m in models.data)


# ------------------------------------------------------------------ image

async def generate_image(prompt: str) -> bytes:
    """Generate one PNG/JPEG image, return raw bytes."""
    resp = await image_client().images.generate(
        model=settings.image_model, prompt=prompt, size="1024x1024", n=1
    )
    item = resp.data[0]
    if getattr(item, "b64_json", None):
        return base64.b64decode(item.b64_json)
    if getattr(item, "url", None):
        async with httpx.AsyncClient(timeout=120.0) as http:
            r = await http.get(item.url)
            r.raise_for_status()
            return r.content
    raise RuntimeError("no image data")


# ------------------------------------------------------------------ speech

async def transcribe(raw: bytes, filename: str = "voice.ogg") -> str:
    """Speech → text (Whisper-compatible endpoint)."""
    tr = await audio_client().audio.transcriptions.create(
        model=settings.stt_model, file=(filename, raw)
    )
    return (tr.text or "").strip()


def is_fa(text: str) -> bool:
    letters = [ch for ch in text if ch.isalpha()]
    if not letters:
        return True
    fa = sum(1 for ch in letters if "؀" <= ch <= "ۿ")
    return (fa / len(letters)) >= settings.fa_threshold


def edge_voice_for(text: str) -> str:
    male = settings.tts_gender == "male"
    if is_fa(text):
        return settings.edge_voice_fa_male if male else settings.edge_voice_fa_female
    return settings.edge_voice_en_male if male else settings.edge_voice_en_female


def mp3_to_ogg(mp3: bytes) -> bytes:
    import shutil
    import subprocess
    import tempfile

    exe = shutil.which("ffmpeg")
    if not exe:
        try:
            import imageio_ffmpeg

            exe = imageio_ffmpeg.get_ffmpeg_exe()
        except Exception:
            raise RuntimeError("ffmpeg not installed")
    with tempfile.TemporaryDirectory() as tmp:
        src = os.path.join(tmp, "in.mp3")
        dst = os.path.join(tmp, "out.ogg")
        with open(src, "wb") as f:
            f.write(mp3)
        subprocess.run(
            [exe, "-y", "-loglevel", "error", "-i", src,
             "-c:a", "libopus", "-b:a", "48k", dst],
            check=True, timeout=120,
        )
        with open(dst, "rb") as f:
            return f.read()


async def speak(text: str) -> tuple[bytes, str]:
    """Text → speech. Returns (audio_bytes, 'ogg'|'mp3'). Auto FA/EN voice."""
    text = text[:1500]
    if settings.tts_provider == "openai":
        audio = await audio_client().audio.speech.create(
            model=settings.tts_model, voice=settings.tts_voice,
            input=text, response_format="opus",
        )
        return audio.read(), "ogg"
    import edge_tts

    communicate = edge_tts.Communicate(text, edge_voice_for(text), rate=settings.edge_rate)
    buf = bytearray()
    async for chunk in communicate.stream():
        if chunk.get("type") == "audio":
            buf += chunk["data"]
    if not buf:
        raise RuntimeError("edge-tts returned no audio")
    try:
        return await asyncio.to_thread(mp3_to_ogg, bytes(buf)), "ogg"
    except Exception as exc:
        log.warning("ffmpeg missing (%s); sending mp3", exc)
        return bytes(buf), "mp3"

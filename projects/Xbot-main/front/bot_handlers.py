"""front layer — Telegram handlers. Every user-facing string goes through
t(key, lang) with the user's OWN language (chosen at /start, /lang to change).

Business rules live in back.services, persistence in data.store,
model calls in llm.client — this module only talks Telegram.
"""
from __future__ import annotations

import asyncio
import base64
import io
import logging

from telegram import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    ReplyKeyboardMarkup,
    Update,
)
from telegram.constants import ChatAction
from telegram.ext import (
    Application,
    CallbackQueryHandler,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

from back import services
from back.games import hokm as hokm_engine
from back.games import hokm_view
from back.games.hokm_personas import PERSONAS
from config import settings
from data import store
from front.i18n import t
from llm import client as llm

log = logging.getLogger("launch-bot")

TELEGRAM_LIMIT = 4000
MAX_FILE_BYTES = 200_000
MAX_VOICE_BYTES = 25_000_000
TEXT_EXTENSIONS = {
    ".txt", ".md", ".markdown", ".py", ".js", ".ts", ".json", ".csv",
    ".log", ".html", ".htm", ".xml", ".yaml", ".yml", ".ini", ".cfg",
    ".toml", ".sh", ".sql", ".java", ".c", ".cpp", ".go", ".rs",
}

REFRESHABLE = (
    "chat_model", "system_prompt", "max_tokens", "temperature", "max_history",
    "image_model", "tts_provider", "tts_gender", "edge_rate", "default_mode",
) + store.CONNECTION_KEYS

CATALOG: dict = {"services": []}
_llm_fingerprint = ""

_captures: dict[int, dict] = {}
_last_answers: dict[tuple[int, int], str] = {}


# ------------------------------------------------------- catalog + settings

def load_catalog() -> None:
    global CATALOG
    CATALOG = store.get_catalog(seed=settings.catalog_path)


def refresh_settings() -> None:
    """Copy DB overrides into `settings` + bust LLM clients if keys changed."""
    global _llm_fingerprint
    try:
        cur = store.all_settings()
    except Exception:
        return
    for key in REFRESHABLE:
        if key in cur and cur[key] not in (None, ""):
            old = getattr(settings, key, None)
            val: object = cur[key]
            if isinstance(old, int):
                try:
                    val = int(cur[key])
                except ValueError:
                    continue
            elif isinstance(old, float):
                try:
                    val = float(cur[key])
                except ValueError:
                    continue
            setattr(settings, key, val)
    fp = "|".join(str(getattr(settings, k, "")) for k in
                  ("openai_api_key", "openai_base_url", "image_api_key", "image_base_url",
                   "audio_api_key", "audio_base_url"))
    if fp != _llm_fingerprint:
        _llm_fingerprint = fp
        llm.reset_clients()


def get_welcome(lang: str) -> str:
    key = "welcome_text_en" if lang == "en" else "welcome_text"
    return store.get_setting(key, t("start.welcome", lang))


def get_help(lang: str) -> str:
    key = "help_text_en" if lang == "en" else "help_text"
    return store.get_setting(key, t("help.text", lang))


# ---------------------------------------------------------------- helpers

def _chunks(text: str, size: int = TELEGRAM_LIMIT) -> list[str]:
    if len(text) <= size:
        return [text]
    out, buf = [], ""
    for line in text.splitlines(keepends=True):
        if len(buf) + len(line) > size:
            if buf:
                out.append(buf)
                buf = ""
            while len(line) > size:
                out.append(line[:size])
                line = line[size:]
            buf = line
        else:
            buf += line
    if buf:
        out.append(buf)
    return out or ["..."]


async def _allowed(update: Update) -> bool:
    refresh_settings()
    if not settings.allowed_user_ids:
        return True
    user = update.effective_user
    if user and user.id in settings.allowed_user_ids:
        return True
    if update.effective_message:
        lang = store.user_lang(user.id) if user else "fa"
        await update.effective_message.reply_text(t("error.private", lang))
    return False


def _is_admin(user_id: int) -> bool:
    return user_id in settings.admin_ids


def _wants_reply(update: Update, context: ContextTypes.DEFAULT_TYPE) -> bool:
    chat = update.effective_chat
    if chat is None or chat.type == "private":
        return True
    msg = update.message
    if not msg:
        return False
    me_id = context.bot.id
    if msg.reply_to_message and msg.reply_to_message.from_user and msg.reply_to_message.from_user.id == me_id:
        return True
    if msg.entities and msg.text:
        me_mention = f"@{context.bot.username or ''}".lower()
        for ent in msg.entities:
            if ent.type == "mention" and msg.text[ent.offset: ent.offset + ent.length].lower() == me_mention:
                return True
            if ent.type == "text_mention" and ent.user and ent.user.id == me_id:
                return True
    return False


def main_kb(lang: str) -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        [
            [KeyboardButton(t("menu.catalog", lang)), KeyboardButton(t("menu.quote", lang))],
            [KeyboardButton(t("menu.support", lang)), KeyboardButton(t("menu.orders", lang))],
            [KeyboardButton(t("menu.search", lang)), KeyboardButton(t("menu.image", lang))],
            [KeyboardButton(t("menu.mode", lang)), KeyboardButton(t("menu.help", lang))],
        ],
        resize_keyboard=True,
    )


MENU_KEYS = ("catalog", "quote", "support", "orders", "search", "image", "mode", "help")


def _menu_key(text: str) -> str | None:
    """Match a menu button in EITHER language (user may have switched)."""
    for key in MENU_KEYS:
        if text == t(f"menu.{key}", "fa") or text == t(f"menu.{key}", "en"):
            return key
    return None


def lang_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [InlineKeyboardButton(t("lang.fa", "fa"), callback_data="lang:fa")],
        [InlineKeyboardButton(t("lang.en", "en"), callback_data="lang:en")],
    ])


def fmt_kb(user_id: int, msg_id: int, mode: str, lang: str) -> InlineKeyboardMarkup:
    v_label = t("fmt.v_on", lang) if mode == "voice" else t("fmt.v", lang)
    t_label = t("fmt.t", lang) if mode == "voice" else t("fmt.t_on", lang)
    return InlineKeyboardMarkup(
        [[
            InlineKeyboardButton(v_label, callback_data=f"fmt:v:{user_id}:{msg_id}"),
            InlineKeyboardButton(t_label, callback_data=f"fmt:t:{user_id}:{msg_id}"),
        ]]
    )


def approval_kb(ref: str, lang: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([[
        InlineKeyboardButton(t("approvals.ok", lang), callback_data=f"ap:ok:{ref}"),
        InlineKeyboardButton(t("approvals.no", lang), callback_data=f"ap:no:{ref}"),
    ]])


async def _notify_admins(context: ContextTypes.DEFAULT_TYPE, key: str,
                         kb=None, kb_ref: str | None = None, **kw) -> None:
    """Send a locale key rendered in EACH admin's own language."""
    for aid, text in services.texts_for_admins(settings.admin_ids, key, **kw):
        markup = kb
        if kb_ref:
            markup = approval_kb(kb_ref, store.user_lang(aid))
        try:
            await context.bot.send_message(aid, text, reply_markup=markup)
        except Exception as exc:
            log.warning("notify admin %s failed: %s", aid, exc)


async def _notify_user(context: ContextTypes.DEFAULT_TYPE, user_id: int,
                       key: str | None = None, text: str | None = None,
                       kb=None, **kw) -> None:
    """Notify a customer in THEIR language (locale key or raw text)."""
    if not user_id:
        return
    msg = t(key, store.user_lang(user_id), **kw) if key else (text or "")
    try:
        await context.bot.send_message(user_id, msg, reply_markup=kb)
    except Exception as exc:
        log.warning("notify user %s failed: %s", user_id, exc)


async def send_answer(message, user_id: int, text: str, with_buttons: bool = True) -> None:
    """Send a text answer with 🔊/📝 buttons (+ auto voice in voice mode)."""
    u = store.user_get(user_id)
    mode, lang = u.get("mode", "text") or "text", u.get("lang", "fa") or "fa"
    parts = _chunks(text)
    last = None
    for i, ch in enumerate(parts):
        is_last = i == len(parts) - 1
        if is_last and with_buttons:
            last = await message.reply_text(ch, reply_markup=fmt_kb(user_id, 0, mode, lang))
            try:
                await last.edit_reply_markup(reply_markup=fmt_kb(user_id, last.message_id, mode, lang))
            except Exception:
                pass
            _remember_answer(user_id, last.message_id, text)
        else:
            last = await message.reply_text(ch)
    if mode == "voice" and with_buttons:
        try:
            data, kind = await llm.speak(text)
            if kind == "ogg":
                await message.reply_voice(voice=io.BytesIO(data))
            else:
                await message.reply_audio(audio=io.BytesIO(data), title="voice")
        except Exception as exc:
            log.warning("auto voice failed: %s", exc)


def _remember_answer(user_id: int, msg_id: int, text: str) -> None:
    _last_answers[(user_id, msg_id)] = text[:1500]
    if len(_last_answers) > 300:
        for k in list(_last_answers)[:100]:
            del _last_answers[k]


async def _chat_complete(user_id: int, user_text: str, model: str) -> str:
    await llm.remember(user_id, "user", user_text, settings.max_history)
    messages = [{"role": "system", "content": settings.system_prompt}] + await llm.history(user_id)
    text = await llm.chat_complete(messages, model)
    await llm.remember(user_id, "assistant", text, settings.max_history)
    return text


# ---------------------------------------------------------------- commands

async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _allowed(update):
        return
    u = update.effective_user
    # NOTE: existence check BEFORE get-or-create (else is_new is always False).
    is_new = not store.user_exists(u.id)
    user = store.user_get(u.id, u.first_name or "", settings.default_mode, settings.default_lang)
    if is_new:
        # first contact → user picks their language (persisted on users.lang)
        await update.message.reply_text(t("lang.ask", "fa"), reply_markup=lang_kb())  # type: ignore[union-attr]
        return
    lang = user.get("lang", "fa") or "fa"
    await update.message.reply_text(get_welcome(lang), reply_markup=main_kb(lang))  # type: ignore[union-attr]


async def cmd_lang(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _allowed(update):
        return
    uid = update.effective_user.id  # type: ignore[union-attr]
    lang = store.user_lang(uid)
    await update.message.reply_text(t("lang.ask", lang), reply_markup=lang_kb())  # type: ignore[union-attr]


async def cmd_help(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _allowed(update):
        return
    uid = update.effective_user.id  # type: ignore[union-attr]
    lang = store.user_lang(uid)
    await update.message.reply_text(get_help(lang), reply_markup=main_kb(lang))  # type: ignore[union-attr]


async def cmd_id(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    u = update.effective_user
    lang = store.user_lang(u.id)  # type: ignore[union-attr]
    await update.message.reply_text(t("id.reply", lang, uid=u.id))  # type: ignore[union-attr]


async def cmd_new(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _allowed(update):
        return
    uid = update.effective_user.id  # type: ignore[union-attr]
    await llm.clear_history(uid)
    await update.message.reply_text(t("new.done", store.user_lang(uid)))  # type: ignore[union-attr]


async def cmd_mode(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _allowed(update):
        return
    uid = update.effective_user.id  # type: ignore[union-attr]
    u = store.user_get(uid)
    mode, lang = u.get("mode", "text") or "text", u.get("lang", "fa") or "fa"
    await update.message.reply_text(  # type: ignore[union-attr]
        t("mode.show", lang, mode=t(f"mode.{mode}", lang)),
        reply_markup=fmt_kb(uid, 0, mode, lang),
    )


async def cmd_models(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _allowed(update):
        return
    uid = update.effective_user.id  # type: ignore[union-attr]
    lang = store.user_lang(uid)
    try:
        ids = await llm.list_models()
    except Exception as exc:
        await update.message.reply_text(t("models.fail", lang, err=exc))  # type: ignore[union-attr]
        return
    cur = store.user_get(uid).get("model") or settings.chat_model
    lines = [t("models.cur", lang, model=cur), "", t("models.list", lang)] + [f"• {i}" for i in ids[:60]]
    await update.message.reply_text("\n".join(lines))  # type: ignore[union-attr]


async def cmd_model(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _allowed(update):
        return
    uid = update.effective_user.id  # type: ignore[union-attr]
    lang = store.user_lang(uid)
    if not context.args:
        cur = store.user_get(uid).get("model") or settings.chat_model
        await update.message.reply_text(t("model.cur", lang, model=cur))  # type: ignore[union-attr]
        return
    store.user_set(uid, model=context.args[0].strip())
    await llm.clear_history(uid)
    await update.message.reply_text(t("model.done", lang, model=context.args[0].strip()))  # type: ignore[union-attr]


async def cmd_ask(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _allowed(update):
        return
    uid = update.effective_user.id  # type: ignore[union-attr]
    lang = store.user_lang(uid)
    prompt = " ".join(context.args).strip()
    if not prompt:
        await update.message.reply_text(t("ask.usage", lang))  # type: ignore[union-attr]
        return
    await context.bot.send_chat_action(update.effective_chat.id, ChatAction.TYPING)  # type: ignore[union-attr]
    try:
        ans = await _chat_complete(uid, prompt, store.user_get(uid).get("model") or "")
    except Exception as exc:
        ans = t("error.model", lang, err=exc)
    await send_answer(update.message, uid, ans)


async def cmd_search(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _allowed(update):
        return
    uid = update.effective_user.id  # type: ignore[union-attr]
    lang = store.user_lang(uid)
    query = " ".join(context.args).strip()
    if not query:
        await update.message.reply_text(t("search.usage", lang))  # type: ignore[union-attr]
        return
    await context.bot.send_chat_action(update.effective_chat.id, ChatAction.TYPING)  # type: ignore[union-attr]
    try:
        from ddgs import DDGS
    except ImportError:
        try:
            from duckduckgo_search import DDGS  # type: ignore[no-redef]
        except ImportError:
            await update.message.reply_text(t("search.noengine", lang))  # type: ignore[union-attr]
            return
    try:
        results = await asyncio.to_thread(lambda: DDGS().text(query, max_results=5))
    except Exception as exc:
        await update.message.reply_text(t("search.fail", lang, err=exc))  # type: ignore[union-attr]
        return
    if not results:
        await update.message.reply_text(t("search.empty", lang))  # type: ignore[union-attr]
        return
    parts = [t("search.title", lang, query=query)]
    for i, r in enumerate(results, 1):
        parts.append(f"\n{i}. {r.get('title', '-')}\n{r.get('href', '')}\n{(r.get('body') or '')[:200]}")
    await send_answer(update.message, uid, "\n".join(parts))


async def cmd_image(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _allowed(update):
        return
    uid = update.effective_user.id  # type: ignore[union-attr]
    lang = store.user_lang(uid)
    prompt = " ".join(context.args).strip()
    if not prompt:
        await update.message.reply_text(t("image.usage", lang))  # type: ignore[union-attr]
        return
    await context.bot.send_chat_action(update.effective_chat.id, ChatAction.UPLOAD_PHOTO)  # type: ignore[union-attr]
    try:
        raw = await llm.generate_image(prompt)
        await update.message.reply_photo(io.BytesIO(raw), caption=f"🎨 {prompt[:900]}")  # type: ignore[union-attr]
    except Exception as exc:
        await update.message.reply_text(t("image.fail", lang, err=exc))  # type: ignore[union-attr]


async def cmd_say(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _allowed(update):
        return
    uid = update.effective_user.id  # type: ignore[union-attr]
    lang = store.user_lang(uid)
    text = " ".join(context.args).strip()
    if not text:
        await update.message.reply_text(t("say.usage", lang))  # type: ignore[union-attr]
        return
    await context.bot.send_chat_action(update.effective_chat.id, ChatAction.UPLOAD_VOICE)  # type: ignore[union-attr]
    try:
        data, kind = await llm.speak(text)
        if kind == "ogg":
            await update.message.reply_voice(io.BytesIO(data))  # type: ignore[union-attr]
        else:
            await update.message.reply_audio(io.BytesIO(data), title="voice")  # type: ignore[union-attr]
    except Exception as exc:
        await update.message.reply_text(t("say.fail", lang, err=exc))  # type: ignore[union-attr]


# ------------------------------------------------------------ sales commands

async def cmd_catalog(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _allowed(update):
        return
    uid = update.effective_user.id  # type: ignore[union-attr]
    lang = store.user_lang(uid)
    rows = []
    for s in CATALOG.get("services", []):
        name, _ = services.svc_display(CATALOG, s["code"], lang)
        rows.append([InlineKeyboardButton(name, callback_data=f"ord:view:{s['code']}")])
    if not rows:
        await update.message.reply_text(t("catalog.empty", lang))  # type: ignore[union-attr]
        return
    await update.message.reply_text(t("catalog.title", lang), reply_markup=InlineKeyboardMarkup(rows))  # type: ignore[union-attr]


async def cmd_orders(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _allowed(update):
        return
    uid = update.effective_user.id  # type: ignore[union-attr]
    lang = store.user_lang(uid)
    items = store.user_orders(uid)
    if not items:
        await update.message.reply_text(t("orders.empty", lang))  # type: ignore[union-attr]
        return
    lines = [t("orders.title", lang)]
    for o in items:
        name, _ = services.svc_display(CATALOG, o["code"] or "", lang)
        icon = "🛒" if o["kind"] == "order" else "🧾"
        extra = t("orders.qty", lang, n=o["qty"]) if o["kind"] == "order" else ""
        why = t("orders.why", lang, why=o["why"]) if o["status"] == "rejected" and o["why"] else ""
        lines.append(f"\n{icon} {o['ref']} — {name}{extra}\n   {services.badge(o['status'], lang)}{why}")
    await update.message.reply_text("\n".join(lines))  # type: ignore[union-attr]


async def cmd_quote(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _allowed(update):
        return
    uid = update.effective_user.id  # type: ignore[union-attr]
    lang = store.user_lang(uid)
    rows = []
    for s in CATALOG.get("services", []):
        name, _ = services.svc_display(CATALOG, s["code"], lang)
        rows.append([InlineKeyboardButton(name, callback_data=f"q:svc:{s['code']}")])
    if not rows:
        await update.message.reply_text(t("quote.empty", lang))  # type: ignore[union-attr]
        return
    await update.message.reply_text(t("quote.pick", lang), reply_markup=InlineKeyboardMarkup(rows))  # type: ignore[union-attr]


async def cmd_support(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _allowed(update):
        return
    uid = update.effective_user.id  # type: ignore[union-attr]
    lang = store.user_lang(uid)
    kb = InlineKeyboardMarkup([
        [InlineKeyboardButton(t("support.urgent", lang), callback_data="t:sev:urgent")],
        [InlineKeyboardButton(t("support.normal", lang), callback_data="t:sev:normal")],
        [InlineKeyboardButton(t("support.question", lang), callback_data="t:sev:question")],
    ])
    await update.message.reply_text(t("support.ask", lang), reply_markup=kb)  # type: ignore[union-attr]


async def cmd_tickets(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _allowed(update):
        return
    uid = update.effective_user.id  # type: ignore[union-attr]
    lang = store.user_lang(uid)
    if _is_admin(uid):
        items = store.list_tickets(True, 20)
        title = t("tickets.title_admin", lang)
    else:
        items = store.user_tickets(uid)
        title = t("tickets.title", lang)
    if not items:
        await update.message.reply_text(t("tickets.none", lang))  # type: ignore[union-attr]
        return
    rows = []
    lines = [title]
    for x in items:
        thread = store.thread(x["ref"])
        first = (thread[0]["text"] if thread else "")[:70]
        lines.append(f"\n🎫 {x['ref']} — {services.badge(x['status'], lang)}\n   {first}…")
        rows.append([InlineKeyboardButton(f"💬 {x['ref']}", callback_data=f"t:view:{x['ref']}")])
    await update.message.reply_text("\n".join(lines), reply_markup=InlineKeyboardMarkup(rows))  # type: ignore[union-attr]


async def cmd_approvals(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    refresh_settings()
    uid = update.effective_user.id  # type: ignore[union-attr]
    lang = store.user_lang(uid)
    if not _is_admin(uid):
        await update.message.reply_text(t("admin.only", lang))  # type: ignore[union-attr]
        return
    items = store.list_orders("pending", 20)
    if not items:
        await update.message.reply_text(t("approvals.empty", lang))  # type: ignore[union-attr]
        return
    for o in items:
        name, _ = services.svc_display(CATALOG, o["code"] or "", lang)
        icon = "🛒" if o["kind"] == "order" else "🧾"
        if o["kind"] == "quote":
            desc = t("approvals.descr", lang, text=(o["descr"] or "")[:300])
        else:
            desc = t("approvals.qty", lang, n=o["qty"])
        who = store.user_name(o["user_id"]) if o["user_id"] else t("approvals.web", lang)
        who = who or o["user_id"]
        await update.message.reply_text(  # type: ignore[union-attr]
            f"{icon} {o['ref']}\n👤 {who} ({o['user_id']})\n{name}{desc}",
            reply_markup=approval_kb(o["ref"], lang),
        )


# ------------------------------------------------------------ admin commands

async def cmd_admin(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    refresh_settings()
    if not await _allowed(update):
        return
    uid = update.effective_user.id  # type: ignore[union-attr]
    lang = store.user_lang(uid)
    if not _is_admin(uid):
        await update.message.reply_text(t("admin.only", lang))  # type: ignore[union-attr]
        return
    st = store.stats()
    weblink = t("admin.weblink", lang, url=settings.base_url) if settings.base_url else ""
    await update.message.reply_text(  # type: ignore[union-attr]
        t("admin.panel", lang, pend=st["pending"], open=st["open_tickets"],
          users=st["users"], weblink=weblink)
    )


async def cmd_settings(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    refresh_settings()
    if not await _allowed(update):
        return
    uid = update.effective_user.id  # type: ignore[union-attr]
    lang = store.user_lang(uid)
    if not _is_admin(uid):
        await update.message.reply_text(t("admin.only", lang))  # type: ignore[union-attr]
        return
    cur = store.all_settings()
    lines = [t("settings.title", lang), ""]
    last_group = ""
    for key, group, _kind in store.SETTING_DEFS:
        if group != last_group:
            lines.append(f"— {t(f'settings.group.{group}', lang)} —")
            last_group = group
        val = cur.get(key, "")
        shown = (val[:70] + "…") if len(val) > 70 else (val or t("settings.empty", lang))
        lines.append(f"• {key} ({t(f'settings.label.{key}', lang)}) = {shown}")
    lines.append(t("settings.footer", lang))
    await update.message.reply_text("\n".join(lines))  # type: ignore[union-attr]


async def cmd_set(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    refresh_settings()
    if not await _allowed(update):
        return
    uid = update.effective_user.id  # type: ignore[union-attr]
    lang = store.user_lang(uid)
    if not _is_admin(uid):
        await update.message.reply_text(t("admin.only", lang))  # type: ignore[union-attr]
        return
    if len(context.args) < 2:
        await update.message.reply_text(t("set.usage", lang))  # type: ignore[union-attr]
        return
    key = context.args[0].strip()
    value = " ".join(context.args[1:]).strip()
    allowed = store.SETTING_KEYS | set(store.CONNECTION_KEYS)
    if key not in allowed:
        await update.message.reply_text(t("set.unknown", lang, keys=", ".join(sorted(allowed))))  # type: ignore[union-attr]
        return
    if value == "-":
        store.del_setting(key)
        refresh_settings()
        await update.message.reply_text(t("set.deleted", lang, name=key))  # type: ignore[union-attr]
        return
    err = services.validate_setting(key, value, lang)
    if err:
        await update.message.reply_text(f"⚠️ {err}")  # type: ignore[union-attr]
        return
    store.set_setting(key, value)
    refresh_settings()
    shown = (value[:200] + "…") if len(value) > 200 else value
    await update.message.reply_text(t("set.done", lang, name=key, value=shown))  # type: ignore[union-attr]


# ---------------------------------------------------------------- hokm game

def _hokm_load(uid: int) -> dict | None:
    """Load validated hokm state for a Telegram user (None if missing/stale)."""
    rec = store.load_game(hokm_view.session_key("tg", uid))
    if not rec or rec.get("game") != "hokm":
        return None
    st = rec.get("state")
    if not isinstance(st, dict) or st.get("v") != 1 or not isinstance(st.get("hands"), list):
        return None
    return st


def _hokm_kb(st: dict, owner: int, lang: str) -> InlineKeyboardMarkup | None:
    acts = hokm_view.board_actions(st)
    rows: list[list[InlineKeyboardButton]] = []
    if acts["cards"]:
        row: list[InlineKeyboardButton] = []
        for c in acts["cards"]:
            row.append(InlineKeyboardButton(hokm_view.card_text(c),
                                            callback_data=hokm_view.cb(owner, "play", c)))
            if len(row) == 4:
                rows.append(row)
                row = []
        if row:
            rows.append(row)
    if acts["suits"]:
        rows.append([InlineKeyboardButton(f"{hokm_view.SUIT_SYM[x]} {hokm_view.suit_name(x, lang)}",
                                          callback_data=hokm_view.cb(owner, "declare", x))
                     for x in acts["suits"]])
    nav = []
    if acts["next"]:
        nav.append(InlineKeyboardButton(t("hokm.b.next", lang),
                                        callback_data=hokm_view.cb(owner, "next")))
    if acts["new"]:
        nav.append(InlineKeyboardButton(t("hokm.b.new", lang),
                                        callback_data=hokm_view.cb(owner, "new")))
    if nav:
        rows.append(nav)
    return InlineKeyboardMarkup(rows) if rows else None


async def _hokm_say(pid: str, ctx: str, lang: str, fallback: str) -> str:
    """Persona line via LLM (short, in-voice) with canned fallback."""
    if not settings.openai_api_key or pid not in PERSONAS:
        return fallback
    try:
        out = await llm.chat_complete(
            [{"role": "system", "content": PERSONAS[pid][f"prompt_{lang}"]},
             {"role": "user", "content": ctx}], "")
        out = (out or "").strip().replace("\n", " ")[:300]
        return out or fallback
    except Exception as exc:
        log.warning("hokm banter failed: %s", exc)
        return fallback


async def _hokm_banter(send, uid: int, lang: str, evs: list[dict], st: dict) -> None:
    """Send up to 2 persona lines for notable events (`send` is async str->None)."""
    for seat, canned, ev in hokm_view.pick_banter(evs, lang):
        line = await _hokm_say(hokm_view.persona_id(seat),
                                hokm_view.event_context(ev, st, lang), lang, canned)
        try:
            await send(hokm_view.format_say(seat, line, lang))
        except Exception as exc:
            log.warning("hokm banter send failed: %s", exc)


async def cmd_hokm(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _allowed(update):
        return
    u = update.effective_user
    uid = u.id  # type: ignore[union-attr]
    store.user_get(uid, u.first_name or "")  # type: ignore[union-attr]
    lang = store.user_lang(uid)
    arg = (context.args[0].lower() if context.args else "").strip()
    skey = hokm_view.session_key("tg", uid)
    if arg == "stop":
        store.delete_game(skey)
        await update.message.reply_text(t("hokm.stopped", lang))  # type: ignore[union-attr]
        return
    if arg and arg != "new":
        await update.message.reply_text(t("hokm.usage", lang))  # type: ignore[union-attr]
        return
    st = None if arg == "new" else _hokm_load(uid)
    if st is None:  # fresh match
        st = hokm_engine.new_match()
        evs = hokm_view.drain_agents(st)
        store.save_game(skey, "hokm", st)
        head = t("hokm.new_match", lang, name=hokm_view.seat_name(st["hakem"], lang))
        if arg == "new":
            head = t("hokm.restarted", lang) + "\n" + head
        await update.message.reply_text(  # type: ignore[union-attr]
            head + "\n\n" + hokm_view.render_table(st, lang),
            reply_markup=_hokm_kb(st, uid, lang))
        start = await _hokm_say("mate", head, lang, t("hokm.say.start", lang))
        await update.message.reply_text(hokm_view.format_say(2, start, lang))  # type: ignore[union-attr]
        await _hokm_banter(update.message.reply_text, uid, lang, evs, st)  # type: ignore[union-attr]
        return
    evs = hokm_view.drain_agents(st)  # safety: never resume on an agent turn
    if evs:
        store.save_game(skey, "hokm", st)
    await update.message.reply_text(  # type: ignore[union-attr]
        hokm_view.render_table(st, lang), reply_markup=_hokm_kb(st, uid, lang))
    await _hokm_banter(update.message.reply_text, uid, lang, evs, st)  # type: ignore[union-attr]


# ---------------------------------------------------------------- callbacks

async def on_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    q = update.callback_query
    await q.answer()
    if not await _allowed(update):
        return
    uid = q.from_user.id
    lang = store.user_lang(uid)
    parts = (q.data or "").split(":")
    tag = parts[0] if parts else ""

    # ---- 🌍 language picker ----
    if tag == "lang" and len(parts) == 2 and parts[1] in ("fa", "en"):
        lang = store.set_lang(uid, parts[1])
        await q.message.reply_text(t("lang.changed", lang))
        await q.message.reply_text(get_welcome(lang), reply_markup=main_kb(lang))
        return

    # ---- 🔊/📝 format buttons ----
    if tag == "fmt" and len(parts) == 4:
        _, which, owner, mid = parts
        if int(owner) != uid:
            await q.answer(t("fmt.not_yours", lang), show_alert=False)
            return
        text = _last_answers.get((uid, int(mid)), "")
        if which == "v":
            store.user_set(uid, mode="voice")
            try:
                await q.message.edit_reply_markup(reply_markup=fmt_kb(uid, int(mid), "voice", lang))
            except Exception:
                pass
            if not text:
                await q.answer(t("fmt.voice_short", lang))
                await q.message.reply_text(t("fmt.voice_enabled", lang))
                return
            await q.message.reply_chat_action(ChatAction.UPLOAD_VOICE)
            try:
                data, kind = await llm.speak(text)
                if kind == "ogg":
                    await q.message.reply_voice(io.BytesIO(data))
                else:
                    await q.message.reply_audio(io.BytesIO(data), title="voice")
            except Exception as exc:
                await q.message.reply_text(t("say.fail", lang, err=exc))
        else:
            store.user_set(uid, mode="text")
            try:
                await q.message.edit_reply_markup(reply_markup=fmt_kb(uid, int(mid), "text", lang))
            except Exception:
                pass
            await q.answer(t("fmt.text_short", lang))
        return

    # ---- catalog / order ----
    if tag == "ord":
        action = parts[1] if len(parts) > 1 else ""
        if action == "view" and len(parts) == 3:
            s = store.svc_by_code(CATALOG, parts[2])
            if not s:
                return
            name, desc = services.svc_display(CATALOG, parts[2], lang)
            kb = InlineKeyboardMarkup([
                [InlineKeyboardButton(t("catalog.quote_btn", lang), callback_data=f"q:svc:{s['code']}")],
                [InlineKeyboardButton(t("catalog.order_btn", lang), callback_data=f"ord:buy:{s['code']}:1")],
            ])
            price = services.price_display(CATALOG, s, lang)
            await q.message.reply_text(t("catalog.detail", lang, name=name, desc=desc, price=price), reply_markup=kb)
            return
        if action == "buy" and len(parts) == 4:
            code, n = parts[2], max(1, min(9, int(parts[3])))
            name, _ = services.svc_display(CATALOG, code, lang)
            kb = InlineKeyboardMarkup([
                [InlineKeyboardButton("➖", callback_data=f"ord:buy:{code}:{max(1, n - 1)}"),
                 InlineKeyboardButton(str(n), callback_data="noop"),
                 InlineKeyboardButton("➕", callback_data=f"ord:buy:{code}:{min(9, n + 1)}")],
                [InlineKeyboardButton(t("catalog.confirm", lang), callback_data=f"ord:yes:{code}:{n}")],
            ])
            try:
                await q.message.edit_text(t("catalog.buy", lang, name=name, n=n), reply_markup=kb)
            except Exception:
                await q.message.reply_text(t("catalog.buy", lang, name=name, n=n), reply_markup=kb)
            return
        if action == "yes" and len(parts) == 4:
            code, n = parts[2], int(parts[3])
            ref = store.new_ref("ORD")
            store.create_order(ref, uid, "order", code, n)
            name, _ = services.svc_display(CATALOG, code, lang)
            try:
                await q.message.edit_text(t("catalog.ordered", lang, ref=ref, name=name, n=n))
            except Exception:
                pass
            who = q.from_user.first_name or uid
            await _notify_admins(
                context, "catalog.notify", kb_ref=ref, ref=ref, who=who, uid=uid,
                name=lambda L: services.svc_display(CATALOG, code, L)[0], n=n,
            )
            return

    # ---- quote ----
    if tag == "q" and len(parts) == 3 and parts[1] == "svc":
        _captures[uid] = {"kind": "qdesc", "code": parts[2]}
        name, _ = services.svc_display(CATALOG, parts[2], lang)
        await q.message.reply_text(t("quote.ask", lang, name=name))
        return

    # ---- ticket ----
    if tag == "t":
        action = parts[1] if len(parts) > 1 else ""
        if action == "sev" and len(parts) == 3:
            _captures[uid] = {"kind": "tdesc", "sev": parts[2]}
            await q.message.reply_text(t("support.describe", lang))
            return
        if action == "view" and len(parts) == 3:
            ref = parts[2]
            x = store.get_ticket(ref)
            if not x or (x["user_id"] != uid and not _is_admin(uid)):
                await q.answer(t("tickets.notfound", lang))
                return
            thread = store.thread(ref)
            lines = [t("tickets.view_title", lang, ref=ref,
                       status=services.badge(x["status"], lang),
                       sev=services.sev_label(x["sev"], lang)), ""]
            for m in thread[-10:]:
                who = "👔" if m["from_mgr"] else "👤"
                lines.append(f"{who} {m['text'][:400]}")
            kb = InlineKeyboardMarkup([
                [InlineKeyboardButton(t("tickets.reply_btn", lang), callback_data=f"t:rep:{ref}")]
            ] + ([[InlineKeyboardButton(t("tickets.done_btn", lang), callback_data=f"t:st:{ref}:resolved")]] if _is_admin(uid) else []))
            await q.message.reply_text("\n".join(lines), reply_markup=kb)
            return
        if action == "rep" and len(parts) == 3:
            ref = parts[2]
            x = store.get_ticket(ref)
            if not x or (x["user_id"] != uid and not _is_admin(uid)):
                return
            _captures[uid] = {"kind": "trep", "ref": ref, "mgr": _is_admin(uid) and x["user_id"] != uid}
            await q.message.reply_text(t("tickets.write", lang))
            return
        if action == "st" and len(parts) == 4:
            if not _is_admin(uid):
                return
            ref, stt = parts[2], parts[3]
            store.set_ticket(ref, stt)
            x = store.get_ticket(ref)
            await q.message.reply_text(t("tickets.status_changed", lang, ref=ref,
                                         status=services.badge(stt, lang)))
            if x and x["user_id"]:
                await _notify_user(context, x["user_id"], key="tickets.status_changed",
                                   ref=ref, status=services.badge(stt, store.user_lang(x["user_id"])))
            return

    # ---- approvals (manager) ----
    if tag == "ap":
        if not _is_admin(uid):
            await q.answer(t("admin.only", lang))
            return
        action = parts[1] if len(parts) > 1 else ""
        if action in ("ok", "no") and len(parts) == 3:
            ref = parts[2]
            o = store.get_order(ref)
            if not o or o["status"] != "pending":
                await q.answer(t("approvals.done_before", lang))
                return
            if action == "ok":
                services.approve_order(ref)
                try:
                    await q.message.edit_text(q.message.text + t("approvals.approved_suffix", lang))
                except Exception:
                    pass
                await _notify_user(context, o["user_id"], key="approvals.user_approved", ref=ref)
            else:
                kb = InlineKeyboardMarkup([
                    [InlineKeyboardButton(t("approvals.r0", lang), callback_data=f"ap:why:{ref}:0")],
                    [InlineKeyboardButton(t("approvals.r1", lang), callback_data=f"ap:why:{ref}:1")],
                    [InlineKeyboardButton(t("approvals.r2", lang), callback_data=f"ap:why:{ref}:2")],
                ])
                try:
                    await q.message.edit_reply_markup(reply_markup=kb)
                except Exception:
                    pass
                await q.answer(t("approvals.ask_why", lang))
            return
        if action == "why" and len(parts) == 4:
            ref, i = parts[2], int(parts[3])
            reasons = [t("approvals.r0", lang), t("approvals.r1", lang), t("approvals.r2", lang)]
            why = reasons[i] if 0 <= i < len(reasons) else reasons[1]
            services.reject_order(ref, why)
            try:
                await q.message.edit_text(q.message.text + t("approvals.rejected_suffix", lang, why=why))
            except Exception:
                pass
            o = store.get_order(ref)
            if o:
                # reason word in the CUSTOMER's language
                ulang = store.user_lang(o["user_id"]) if o["user_id"] else "fa"
                ureasons = [t("approvals.r0", ulang), t("approvals.r1", ulang), t("approvals.r2", ulang)]
                uwhy = ureasons[i] if 0 <= i < len(ureasons) else ureasons[1]
                await _notify_user(context, o["user_id"], key="approvals.user_rejected", ref=ref, why=uwhy)
            return


    # ---- hokm game ----
    if tag == "hokm" and len(parts) >= 3:
        try:
            owner = int(parts[1])
        except ValueError:
            return
        if owner != uid:
            await q.answer(t("hokm.not_yours", lang))
            return
        action = parts[2]
        param = parts[3] if len(parts) > 3 else ""
        skey = hokm_view.session_key("tg", uid)
        if action == "new":
            st = hokm_engine.new_match()
            evs = hokm_view.drain_agents(st)
            store.save_game(skey, "hokm", st)
            text = (t("hokm.restarted", lang) + "\n"
                    + t("hokm.new_match", lang, name=hokm_view.seat_name(st["hakem"], lang))
                    + "\n\n" + hokm_view.render_table(st, lang))
            try:
                await q.message.edit_text(text, reply_markup=_hokm_kb(st, uid, lang))
            except Exception:
                await q.message.reply_text(text, reply_markup=_hokm_kb(st, uid, lang))
            await _hokm_banter(q.message.reply_text, uid, lang, evs, st)
            return
        st = _hokm_load(uid)
        if st is None:
            await q.answer(t("hokm.no_game", lang))
            return
        evs = []
        if action == "declare" and param in ("S", "H", "D", "C"):
            r = hokm_engine.declare_trump(st, 0, param)
            if not r.get("ok"):
                await q.answer(t("hokm.stale", lang))
                return
            evs.append(hokm_view.declare_event(0, param))
            evs += hokm_view.drain_agents(st)
        elif action == "play" and param:
            r = hokm_engine.play_card(st, 0, param)
            if not r.get("ok"):
                if r.get("err") == "must_follow":
                    await q.answer(t("hokm.must_follow", lang,
                                     suit=hokm_view.suit_name(r["suit"], lang)), show_alert=True)
                elif r.get("err") == "not_turn":
                    await q.answer(t("hokm.wait_turn", lang,
                                     name=hokm_view.seat_name(st["turn"], lang)))
                else:
                    await q.answer(t("hokm.stale", lang))
                return
            evs += hokm_view.result_events(r, st)
            evs += hokm_view.drain_agents(st)
        elif action == "next":
            r = hokm_engine.next_round(st)
            if not r.get("ok"):
                await q.answer(t("hokm.stale", lang))
                return
            evs += hokm_view.drain_agents(st)
        else:
            return
        store.save_game(skey, "hokm", st)
        try:
            await q.message.edit_text(hokm_view.render_table(st, lang),
                                      reply_markup=_hokm_kb(st, uid, lang))
        except Exception:
            await q.message.reply_text(hokm_view.render_table(st, lang),
                                       reply_markup=_hokm_kb(st, uid, lang))
        await _hokm_banter(q.message.reply_text, uid, lang, evs, st)
        return


# ---------------------------------------------------------------- messages

async def on_text(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _allowed(update):
        return
    msg = update.message
    if not msg or not msg.text:
        return
    if not _wants_reply(update, context):
        return
    uid = update.effective_user.id  # type: ignore[union-attr]
    store.user_get(uid, update.effective_user.first_name or "")  # type: ignore[union-attr]
    lang = store.user_lang(uid)
    text = msg.text.strip()

    # menu buttons (either language)
    menu_key = _menu_key(text)
    if menu_key:
        if menu_key == "catalog":
            await cmd_catalog(update, context)
        elif menu_key == "quote":
            await cmd_quote(update, context)
        elif menu_key == "support":
            await cmd_support(update, context)
        elif menu_key == "orders":
            await cmd_orders(update, context)
        elif menu_key == "mode":
            await cmd_mode(update, context)
        elif menu_key == "help":
            await cmd_help(update, context)
        elif menu_key == "search":
            await msg.reply_text(t("menu.search_hint", lang))
        elif menu_key == "image":
            await msg.reply_text(t("menu.image_hint", lang))
        return

    # wizard captures
    cap = _captures.pop(uid, None)
    if cap:
        if len(text) < 3:
            _captures[uid] = cap
            await msg.reply_text(t("wizard.short", lang))
            return
        kind = cap["kind"]
        if kind == "qdesc":
            ref = store.new_ref("QOT")
            store.create_order(ref, uid, "quote", cap["code"], 1, text[:500])
            name, _ = services.svc_display(CATALOG, cap["code"], lang)
            await msg.reply_text(t("quote.done", lang, ref=ref))
            who = update.effective_user.first_name or uid  # type: ignore[union-attr]
            await _notify_admins(
                context, "quote.notify", kb_ref=ref, ref=ref, who=who, uid=uid,
                name=lambda L: services.svc_display(CATALOG, cap["code"], L)[0],
                text=text[:400],
            )
            return
        if kind == "tdesc":
            ref = store.new_ref("TKT")
            store.create_ticket(ref, uid, cap["sev"], text[:500])
            await msg.reply_text(t("support.done", lang, ref=ref))
            who = update.effective_user.first_name or uid  # type: ignore[union-attr]
            kb = InlineKeyboardMarkup([[InlineKeyboardButton(f"💬 {ref}", callback_data=f"t:view:{ref}")]])
            await _notify_admins(
                context, "support.notify", kb=kb, ref=ref,
                sev=lambda L: services.sev_label(cap["sev"], L),
                who=who, uid=uid, text=text[:300],
            )
            return
        if kind == "trep":
            ref = cap["ref"]
            x = services.reply_ticket(ref, bool(cap.get("mgr")), text[:500])
            if not x:
                await msg.reply_text(t("tickets.notfound", lang))
                return
            if cap.get("mgr"):
                await msg.reply_text(t("tickets.mgr_done", lang))
                kb = InlineKeyboardMarkup([[InlineKeyboardButton(f"💬 {ref}", callback_data=f"t:view:{ref}")]])
                await _notify_user(context, x["user_id"], key="tickets.user_reply",
                                   ref=ref, text=text[:400])
                try:
                    ulang = store.user_lang(x["user_id"])
                    await context.bot.send_message(
                        x["user_id"], t("tickets.continue", ulang), reply_markup=kb)
                except Exception:
                    pass
            else:
                await msg.reply_text(t("tickets.customer_done", lang))
                kb = InlineKeyboardMarkup([[InlineKeyboardButton(f"💬 {ref}", callback_data=f"t:view:{ref}")]])
                await _notify_admins(context, "tickets.newmsg", kb=kb, ref=ref, text=text[:300])
            return

    # free chat
    await context.bot.send_chat_action(update.effective_chat.id, ChatAction.TYPING)  # type: ignore[union-attr]
    try:
        ans = await _chat_complete(uid, text, store.user_get(uid).get("model") or "")
    except Exception as exc:
        ans = t("error.model", lang, err=exc)
    await send_answer(msg, uid, ans)


async def on_photo(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _allowed(update):
        return
    msg = update.message
    if not msg or not msg.photo or not _wants_reply(update, context):
        return
    await context.bot.send_chat_action(update.effective_chat.id, ChatAction.TYPING)  # type: ignore[union-attr]
    uid = update.effective_user.id  # type: ignore[union-attr]
    lang = store.user_lang(uid)
    try:
        f = await msg.photo[-1].get_file()
        buf = io.BytesIO()
        await f.download_to_memory(buf)
        b64 = base64.b64encode(buf.getvalue()).decode("ascii")
        prompt = msg.caption or t("photo.prompt", lang)
        model = store.user_get(uid).get("model") or settings.chat_model
        messages: list[dict] = (
            [{"role": "system", "content": settings.system_prompt}]
            + await llm.history(uid)
            + [{"role": "user", "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}},
            ]}]
        )
        text = await llm.chat_complete(messages, model)
        await llm.remember(uid, "user", f"[photo] {prompt}", settings.max_history)
        await llm.remember(uid, "assistant", text, settings.max_history)
        await send_answer(msg, uid, text)
    except Exception as exc:
        await msg.reply_text(t("photo.fail", lang, err=exc))


async def on_voice(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _allowed(update):
        return
    msg = update.message
    if not msg or not (msg.voice or msg.audio) or not _wants_reply(update, context):
        return
    await context.bot.send_chat_action(update.effective_chat.id, ChatAction.TYPING)  # type: ignore[union-attr]
    uid = update.effective_user.id  # type: ignore[union-attr]
    lang = store.user_lang(uid)
    try:
        f = await (msg.voice or msg.audio).get_file()  # type: ignore[union-attr]
        buf = io.BytesIO()
        await f.download_to_memory(buf)
        raw = buf.getvalue()
        if len(raw) > MAX_VOICE_BYTES:
            await msg.reply_text(t("voice.long", lang))
            return
        heard = await llm.transcribe(raw)
        if not heard:
            await msg.reply_text(t("voice.empty", lang))
            return
        await msg.reply_text(t("voice.heard", lang, text=heard[:1000]))
        try:
            ans = await _chat_complete(uid, heard, store.user_get(uid).get("model") or "")
        except Exception as exc:
            ans = t("error.model", lang, err=exc)
        await send_answer(msg, uid, ans)
    except Exception as exc:
        await msg.reply_text(t("voice.fail", lang, err=exc))


async def on_document(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _allowed(update):
        return
    msg = update.message
    doc = msg.document if msg else None
    if not msg or not doc or not _wants_reply(update, context):
        return
    uid = update.effective_user.id  # type: ignore[union-attr]
    lang = store.user_lang(uid)
    name = doc.file_name or "file"
    ext = ("." + name.rsplit(".", 1)[-1].lower()) if "." in name else ""
    if ext not in TEXT_EXTENSIONS:
        await msg.reply_text(t("doc.only", lang))
        return
    if (doc.file_size or 0) > MAX_FILE_BYTES:
        await msg.reply_text(t("doc.big", lang))
        return
    await context.bot.send_chat_action(update.effective_chat.id, ChatAction.TYPING)  # type: ignore[union-attr]
    try:
        f = await doc.get_file()
        buf = io.BytesIO()
        await f.download_to_memory(buf)
        content = buf.getvalue().decode("utf-8", errors="replace")[:12000]
        model = store.user_get(uid).get("model") or settings.chat_model
        summary = await llm.chat_complete(
            [  # type: ignore[list-item]
                {"role": "system", "content": settings.system_prompt},
                {"role": "user", "content": t("doc.prompt", lang, name=name, content=content)},
            ],
            model,
        )
        await llm.remember(uid, "user", f"[file: {name}]", settings.max_history)
        await llm.remember(uid, "assistant", summary, settings.max_history)
        await send_answer(msg, uid, summary)
    except Exception as exc:
        await msg.reply_text(t("doc.fail", lang, err=exc))


async def on_error(update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
    log.exception("Update failed: %s", context.error)


# ---------------------------------------------------------------- wiring

def build_app() -> Application:
    app = Application.builder().token(settings.telegram_token).build()
    for cmd, fn in [
        ("start", cmd_start), ("lang", cmd_lang), ("help", cmd_help), ("id", cmd_id),
        ("new", cmd_new), ("mode", cmd_mode), ("models", cmd_models), ("model", cmd_model),
        ("ask", cmd_ask), ("search", cmd_search), ("image", cmd_image), ("say", cmd_say),
        ("catalog", cmd_catalog), ("orders", cmd_orders), ("quote", cmd_quote),
        ("support", cmd_support), ("tickets", cmd_tickets), ("approvals", cmd_approvals),
        ("settings", cmd_settings), ("set", cmd_set), ("admin", cmd_admin),
        ("hokm", cmd_hokm),
    ]:
        app.add_handler(CommandHandler(cmd, fn))
    app.add_handler(CallbackQueryHandler(on_callback))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, on_text))
    app.add_handler(MessageHandler(filters.PHOTO, on_photo))
    app.add_handler(MessageHandler(filters.VOICE | filters.AUDIO, on_voice))
    app.add_handler(MessageHandler(filters.Document.ALL, on_document))
    app.add_error_handler(on_error)
    return app

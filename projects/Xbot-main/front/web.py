"""front layer — webapp: public panels for everyone, admin panels after login.

Fully bilingual: ?lang=fa|en switches (saved in a cookie), every string via
t(key, lang). Roles: 👤 visitor → public only · 👔 admin → public + admin.
Shares SQLite with the bot via data.store; domain rules via back.services.
"""
from __future__ import annotations

import asyncio
import html
import logging
from functools import wraps

import httpx
from flask import Flask, abort, redirect, render_template_string, request, session, url_for

from back import services
from back.games import hokm as hokm_engine
from back.games import hokm_view
from back.games.hokm_personas import PERSONAS
from llm import client as llm
from config import settings
from data import store
from front.i18n import t

log = logging.getLogger("launch-web")

app = Flask(__name__)
app.secret_key = settings.web_secret or "change-me-in-prod"
app.config.update(SESSION_COOKIE_HTTPONLY=True, SESSION_COOKIE_SAMESITE="Lax")

REJECT_REASONS = ("r0", "r1", "r2")  # → approvals.r<i> in the admin's language

BASE = """<!DOCTYPE html><html lang="{{ lang }}" dir="{{ dir }}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{{ title }} — {{ site }}</title>
<style>
:root{--bg:#0f172a;--card:#1e293b;--line:#334155;--txt:#f1f5f9;--mut:#94a3b8;--acc:#22d3ee;--grn:#34d399;--red:#f87171;--amb:#fbbf24}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(1200px 600px at 80% -10%,#164e63,transparent),var(--bg);color:var(--txt);font-family:Tahoma,Vazirmatn,system-ui,sans-serif;min-height:100vh}
.wrap{max-width:960px;margin:0 auto;padding:20px 16px 60px}
nav{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 20px}
nav a{background:rgba(255,255,255,.06);border:1px solid var(--line);color:var(--txt);text-decoration:none;padding:8px 14px;border-radius:999px;font-size:14px}
nav a:hover{border-color:var(--acc)}
.card{background:rgba(30,41,59,.88);border:1px solid var(--line);border-radius:16px;padding:18px;margin:12px 0}
.mut{color:var(--mut)}.grid{display:grid;gap:12px}@media(min-width:700px){.grid{grid-template-columns:1fr 1fr}}
.btn{display:inline-block;background:var(--acc);color:#06202a;border:0;border-radius:10px;padding:10px 18px;font-weight:700;cursor:pointer;text-decoration:none;font-size:15px;font-family:inherit}
.btn.g{background:var(--grn)}.btn.r{background:var(--red);color:#2a0606}.btn.o{background:transparent;border:1px solid var(--line);color:var(--txt)}
.btn.sm{padding:6px 12px;font-size:13px}
input,select,textarea{width:100%;background:#0b1220;border:1px solid var(--line);color:var(--txt);border-radius:10px;padding:10px;font-size:15px;font-family:inherit}
label{display:block;margin:10px 0 4px;color:var(--mut);font-size:14px}
.thread{border-right:3px solid var(--line);padding:8px 12px 8px 0;margin:8px 0}
html[dir="ltr"] .thread{border-right:0;border-left:3px solid var(--line);padding:8px 0 8px 12px}
.thread.mgr{border-color:var(--acc)}
.badge{display:inline-block;padding:2px 10px;border-radius:999px;font-size:13px;background:#334155}
.badge.ok{background:#064e3b;color:#a7f3d0}.badge.no{background:#7f1d1d;color:#fecaca}.badge.wait{background:#78350f;color:#fde68a}
table{width:100%;border-collapse:collapse;font-size:14px}td,th{border-bottom:1px solid var(--line);padding:8px;text-align:right;vertical-align:top}
html[dir="ltr"] td,html[dir="ltr"] th{text-align:left}
h1{font-size:24px}h2{font-size:19px;margin-top:0}code{direction:ltr;unicode-bidi:embed;background:#0b1220;padding:2px 8px;border-radius:6px}
form.inline{display:inline}form.inline select{width:auto;display:inline-block}
.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
</style></head><body><div class="wrap">
<h1>🚀 {{ site }}</h1>
<nav>{{ nav|safe }}</nav>
{{ body|safe }}
<p class="mut" style="margin-top:30px;font-size:13px">{{ footer }}</p>
</div></body></html>"""


# ---------------------------------------------------------------- helpers

def esc(s) -> str:
    return html.escape("" if s is None else str(s))


def get_lang() -> str:
    q = (request.args.get("lang") or "").strip().lower()
    if q in ("fa", "en"):
        return q
    c = (request.cookies.get("lb_lang") or "").strip().lower()
    if c in ("fa", "en"):
        return c
    d = (settings.default_lang or "fa").strip().lower()
    return d if d in ("fa", "en") else "fa"


@app.after_request
def _persist_lang(resp):
    q = (request.args.get("lang") or "").strip().lower()
    if q in ("fa", "en"):
        resp.set_cookie("lb_lang", q, max_age=31536000, samesite="Lax", httponly=True)
    return resp


def nav_html(lang: str) -> str:
    if session.get("admin"):
        links = [
            ("/", t("web.nav.public", lang)), ("/catalog", t("web.nav.catalog", lang)),
            ("/quote", t("web.nav.quote", lang)), ("/support", t("web.nav.support", lang)),
            ("/track", t("web.nav.track", lang)), ("/hokm", t("web.nav.hokm", lang)),
            ("/admin", t("web.nav.dash", lang)),
            ("/admin/orders", t("web.nav.orders", lang)),
            ("/admin/tickets", t("web.nav.tickets", lang)),
            ("/admin/catalog", t("web.nav.catedit", lang)),
            ("/admin/settings", t("web.nav.settings", lang)),
            ("/admin/users", t("web.nav.users", lang)),
            ("/admin/logout", t("web.nav.logout", lang)),
        ]
    else:
        links = [
            ("/", t("web.nav.home", lang)), ("/catalog", t("web.nav.catalog", lang)),
            ("/quote", t("web.nav.quote", lang)), ("/support", t("web.nav.support", lang)),
            ("/track", t("web.nav.track", lang)), ("/hokm", t("web.nav.hokm", lang)),
            ("/admin/login", t("web.nav.login", lang)),
        ]
    out = "".join(f'<a href="{u}">{x}</a>' for u, x in links)
    other = "en" if lang == "fa" else "fa"
    base = request.path if request.method == "GET" else "/"
    out += f'<a href="{base}?lang={other}">{t(f"lang.{other}", other)}</a>'
    return out


def page(title: str, body: str, lang: str):
    return render_template_string(
        BASE, lang=lang, dir="rtl" if lang == "fa" else "ltr",
        title=title, site=t("web.title", lang),
        nav=nav_html(lang), body=body, footer=t("web.footer", lang),
    )


def login_required(fn):
    @wraps(fn)
    def wrapper(*a, **kw):
        if not session.get("admin"):
            return redirect(url_for("admin_login"))
        return fn(*a, **kw)
    return wrapper


def badge_html(status: str, lang: str) -> str:
    cls = {"approved": "ok", "resolved": "ok", "rejected": "no",
           "pending": "wait", "open": "wait", "waiting": "wait"}.get(status, "")
    return f'<span class="badge {cls}">{esc(services.badge(status, lang))}</span>'


def tg_send(chat_id: int, text: str) -> bool:
    """DM a Telegram user from the web (best-effort, never raises)."""
    token = settings.telegram_token
    if not token or ":" not in token or not chat_id:
        return False
    try:
        with httpx.Client(timeout=15.0) as http:
            r = http.post(
                f"https://api.telegram.org/bot{token}/sendMessage",
                json={"chat_id": chat_id, "text": text[:4000]},
            )
            return r.status_code == 200
    except Exception as exc:
        log.warning("tg_send failed: %s", exc)
        return False


def notify_admins(key: str, **kw) -> None:
    """Admin notification rendered in each admin's own language."""
    for aid, text in services.texts_for_admins(settings.admin_ids, key, **kw):
        tg_send(aid, text)


# ---------------------------------------------------------------- public

@app.get("/healthz")
def healthz():
    return "OK", 200


@app.get("/")
def home():
    lang = get_lang()
    cat = store.get_catalog()
    n = len(cat.get("services", []))
    st = store.stats()
    return page(t("web.nav.home", lang), f"""
    <div class="card"><h2>{t("web.home.hero", lang)}</h2>
    <p class="mut">{t("web.home.sub", lang)}</p>
    <div class="row">
      <a class="btn" href="/catalog">{t("web.home.catalog_btn", lang, n=n)}</a>
      <a class="btn o" href="/quote">{t("web.nav.quote", lang)}</a>
      <a class="btn o" href="/support">{t("web.nav.support", lang)}</a>
      <a class="btn o" href="/track">{t("web.nav.track", lang)}</a>
      <a class="btn o" href="/hokm">{t("web.nav.hokm", lang)}</a>
    </div></div>
    <div class="card"><h2>{t("web.home.chat_title", lang)}</h2>
    <p class="mut">{t("web.home.chat_sub", lang)}</p></div>
    <p class="mut">{t("web.home.stats", lang, orders=st["orders"], tickets=st["tickets"])}</p>
    """, lang)


@app.get("/catalog")
def catalog():
    lang = get_lang()
    cat = store.get_catalog()
    cards = []
    for s in cat.get("services", []):
        name, desc = services.svc_display(cat, s.get("code"), lang)
        price = services.price_display(cat, s, lang)
        cards.append(f"""<div class="card"><h2>{esc(name)}</h2>
        <p class="mut">{esc(desc)}</p>
        <p>💰 {esc(price)}</p>
        <div class="row"><a class="btn sm" href="/order/{esc(s.get("code"))}">{t("web.catalog.order_btn", lang)}</a>
        <a class="btn o sm" href="/quote/{esc(s.get("code"))}">{t("web.catalog.quote_btn", lang)}</a></div></div>""")
    body = '<div class="grid">' + "".join(cards) + "</div>" if cards else f'<div class="card">{t("web.catalog.empty", lang)}</div>'
    return page(t("web.nav.catalog", lang), body, lang)


def _qty(form) -> int:
    try:
        return max(1, min(9, int(form.get("qty", "1") or 1)))
    except (ValueError, TypeError):
        return 1


@app.get("/order/<code>")
def order_form(code):
    lang = get_lang()
    cat = store.get_catalog()
    if not store.svc_by_code(cat, code):
        abort(404)
    return page(t("web.order.title", lang), f"""<div class="card"><h2>🛒 {esc(services.svc_display(cat, code, lang)[0])}</h2>
    <form method="post">
    <label>{t("web.order.qty", lang)}</label><input name="qty" type="number" min="1" max="9" value="1">
    <label>{t("web.order.contact", lang)}</label><input name="contact" maxlength="100">
    <label>{t("web.order.note", lang)}</label><textarea name="note" rows="3" maxlength="500"></textarea>
    <p><button class="btn">{t("web.order.submit", lang)}</button></p></form></div>""", lang)


@app.post("/order/<code>")
def order_submit(code):
    lang = get_lang()
    cat = store.get_catalog()
    if not store.svc_by_code(cat, code):
        abort(404)
    qty = _qty(request.form)
    contact = (request.form.get("contact") or "").strip()[:100]
    note = (request.form.get("note") or "").strip()[:500]
    ref = store.new_ref("ORD")
    store.create_order(ref, 0, "order", code, qty, " | ".join(x for x in (contact, note) if x))
    notify_admins("web.notify.order", ref=ref,
                  name=lambda L: services.svc_display(cat, code, L)[0],
                  qty=qty, contact=contact, note=note)
    return page(t("web.order.done_title", lang), f"""<div class="card"><h2>{t("web.order.done_title", lang)}</h2>
    <p>{t("web.order.done_code", lang, ref=ref)}</p>
    <p class="mut">{t("web.order.save_code", lang)}</p>
    <p><a class="btn" href="/track?ref={ref}">{t("web.order.track_btn", lang)}</a></p></div>""", lang)


@app.get("/quote")
def quote_pick():
    lang = get_lang()
    cat = store.get_catalog()
    items = "".join(
        f'<div class="card"><h2>{esc(services.svc_display(cat, s.get("code"), lang)[0])}</h2>'
        f'<p><a class="btn sm" href="/quote/{esc(s.get("code"))}">{t("web.quote.pick_btn", lang)}</a></p></div>'
        for s in cat.get("services", [])
    ) or f'<div class="card">{t("web.catalog.empty", lang)}</div>'
    return page(t("web.nav.quote", lang), items, lang)


@app.get("/quote/<code>")
def quote_form(code):
    lang = get_lang()
    cat = store.get_catalog()
    if not store.svc_by_code(cat, code):
        abort(404)
    return page(t("web.quote.title", lang), f"""<div class="card"><h2>🧾 {esc(services.svc_display(cat, code, lang)[0])}</h2>
    <form method="post">
    <label>{t("web.quote.descr", lang)}</label><textarea name="descr" rows="4" maxlength="500" required></textarea>
    <label>{t("web.quote.contact", lang)}</label><input name="contact" maxlength="100">
    <p><button class="btn">{t("web.quote.submit", lang)}</button></p></form></div>""", lang)


@app.post("/quote/<code>")
def quote_submit(code):
    lang = get_lang()
    cat = store.get_catalog()
    if not store.svc_by_code(cat, code):
        abort(404)
    descr = (request.form.get("descr") or "").strip()[:500]
    contact = (request.form.get("contact") or "").strip()[:100]
    if len(descr) < 3:
        return page(t("web.quote.title", lang), f'<div class="card">⚠️ {t("web.short", lang)}</div>', lang)
    ref = store.new_ref("QOT")
    store.create_order(ref, 0, "quote", code, 1, " | ".join(x for x in (contact, descr) if x))
    notify_admins("web.notify.quote", ref=ref,
                  name=lambda L: services.svc_display(cat, code, L)[0],
                  contact=contact, descr=descr)
    return page(t("web.quote.done_title", lang), f"""<div class="card"><h2>{t("web.quote.done_title", lang)}</h2>
    <p>{t("web.quote.done_code", lang, ref=ref)}</p>
    <p><a class="btn" href="/track?ref={ref}">{t("web.order.track_btn", lang)}</a></p></div>""", lang)


@app.get("/support")
def support_form():
    lang = get_lang()
    return page(t("web.nav.support", lang), f"""<div class="card"><h2>{t("web.support.title", lang)}</h2>
    <form method="post">
    <label>{t("web.support.sev", lang)}</label><select name="sev">
      <option value="urgent">{t("support.urgent", lang)}</option>
      <option value="normal" selected>{t("support.normal", lang)}</option>
      <option value="question">{t("support.question", lang)}</option></select>
    <label>{t("web.support.text", lang)}</label><textarea name="text" rows="4" maxlength="500" required></textarea>
    <label>{t("web.support.contact", lang)}</label><input name="contact" maxlength="100">
    <p><button class="btn">{t("web.support.submit", lang)}</button></p></form></div>""", lang)


@app.post("/support")
def support_submit():
    lang = get_lang()
    sev = (request.form.get("sev") or "normal").strip()[:20]
    if sev not in ("urgent", "normal", "question"):
        sev = "normal"
    text = (request.form.get("text") or "").strip()[:500]
    contact = (request.form.get("contact") or "").strip()[:100]
    if len(text) < 3:
        return page(t("web.nav.support", lang), f'<div class="card">⚠️ {t("web.short", lang)}</div>', lang)
    ref = store.new_ref("TKT")
    store.create_ticket(ref, 0, sev, " | ".join(x for x in (contact, text) if x))
    notify_admins("web.notify.ticket", ref=ref,
                  sev=lambda L: services.sev_label(sev, L), contact=contact, text=text)
    return page(t("web.support.done_title", lang), f"""<div class="card"><h2>{t("web.support.done_title", lang)}</h2>
    <p>{t("web.support.done_code", lang, ref=ref)}</p>
    <p><a class="btn" href="/track?ref={ref}">{t("web.support.talk_btn", lang)}</a></p></div>""", lang)


@app.get("/track")
def track():
    lang = get_lang()
    ref = (request.args.get("ref") or "").strip().upper()
    body = f"""<div class="card"><h2>{t("web.track.title", lang)}</h2>
    <form method="get"><label>{t("web.track.label", lang)}</label>
    <input name="ref" maxlength="20" dir="ltr" style="text-align:left">
    <p><button class="btn">{t("web.track.show", lang)}</button></p></form></div>"""
    if not ref:
        return page(t("web.nav.track", lang), body, lang)
    if ref.startswith("ORD-") or ref.startswith("QOT-"):
        o = store.get_order(ref)
        if not o:
            return page(t("web.nav.track", lang), body + f'<div class="card">⚠️ {t("web.track.notfound", lang)}</div>', lang)
        cat = store.get_catalog()
        icon = "🛒" if o["kind"] == "order" else "🧾"
        extra = t("orders.qty", lang, n=o["qty"]) if o["kind"] == "order" else ""
        why = f"<p>{t('orders.why', lang, why=o['why'])}</p>" if o["status"] == "rejected" and o["why"] else ""
        body += f"""<div class="card"><h2>{icon} <code>{esc(ref)}</code></h2>
        <p>{esc(services.svc_display(cat, o["code"], lang)[0])}{esc(extra)}</p>
        <p>{badge_html(o["status"], lang)}</p>{why}</div>"""
    elif ref.startswith("TKT-"):
        x = store.get_ticket(ref)
        if not x:
            return page(t("web.nav.track", lang), body + f'<div class="card">⚠️ {t("web.track.notfound", lang)}</div>', lang)
        msgs = "".join(
            f'<div class="thread{" mgr" if m["from_mgr"] else ""}">'
            f"{t('web.track.mgr', lang) if m['from_mgr'] else t('web.track.you', lang)}: {esc(m['text'])}</div>"
            for m in store.thread(ref)
        )
        body += f"""<div class="card"><h2>🎫 <code>{esc(ref)}</code></h2>
        <p>{badge_html(x["status"], lang)} {esc(services.sev_label(x["sev"], lang))}</p>{msgs}
        <form method="post" action="/track/{esc(ref)}/reply">
        <label>{t("web.track.reply_label", lang)}</label><textarea name="text" rows="3" maxlength="500" required></textarea>
        <p><button class="btn sm">{t("web.track.send", lang)}</button></p></form></div>"""
    else:
        body += f'<div class="card">⚠️ {t("web.track.badref", lang)}</div>'
    return page(t("web.nav.track", lang), body, lang)


@app.post("/track/<ref>/reply")
def track_reply(ref):
    lang = get_lang()
    ref = (ref or "").strip().upper()
    if not store.get_ticket(ref):
        abort(404)
    text = (request.form.get("text") or "").strip()[:500]
    if len(text) >= 2:
        services.reply_ticket(ref, False, text)
        notify_admins("web.notify.reply", ref=ref, text=text)
    return redirect(f"/track?ref={ref}")


# ---------------------------------------------------------------- hokm game

_HOKM_WEB_KEY = "hokm:web"

_HOKM_CSS = '''.hwrap{display:grid;gap:12px}
@media(min-width:860px){.hwrap{grid-template-columns:1.15fr 1fr}}
.pcard{display:inline-block;background:#f8fafc;color:#0f172a;border-radius:10px;padding:10px 4px;margin:3px;min-width:54px;text-align:center;font-weight:700;font-size:16px;border:2px solid transparent;cursor:pointer;font-family:inherit}
button.pcard:disabled{opacity:.4;cursor:default}
button.pcard:not(:disabled):hover{border-color:var(--acc)}
.pcard.red{color:#dc2626}
#chatlog{height:400px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;margin-bottom:10px}
.msg{background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:10px;padding:8px 10px;font-size:14px;max-width:95%}
.msg .who{font-size:12px;color:var(--mut);margin-bottom:2px}
.msg.sys{background:transparent;border-style:dashed;text-align:center;color:var(--mut);font-size:13px}
.msg.you{align-self:flex-end;border-color:var(--acc)}
#toast{display:none;background:#78350f;border:1px solid var(--amb);border-radius:10px;padding:8px 12px;margin:8px 0;font-size:14px}
.seatline{margin:6px 0;font-size:14px}
#chatform{display:flex;gap:8px}
#chatform input{flex:1}'''

_HOKM_JS = '''const board = document.getElementById("board");
const chatlog = document.getElementById("chatlog");
const toast = document.getElementById("toast");
let chatLen = -1;
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function red(t){return t.indexOf("♥")>=0||t.indexOf("♦")>=0;}
function showToast(m){toast.textContent=m;toast.style.display="block";clearTimeout(toast._t);toast._t=setTimeout(()=>toast.style.display="none",3000);}
function render(s){
  let h = "";
  h += '<p class="mut">' + esc(s.score_text) + "<br>" + esc(s.tricks_text) + "</p>";
  if (s.trump_text) h += "<p>" + esc(s.trump_text) + "</p>";
  h += "<p>" + esc(s.trick_text) + "</p>";
  if (s.last_text) h += '<p class="mut">' + esc(s.last_text) + "</p>";
  if (s.result) h += "<p><b>" + esc(s.result).replace(/\\n/g,"<br>") + "</b></p>";
  h += '<p class="seatline">' + s.counts.map(c=>"<span>"+esc(c.name)+" ×"+c.n+"</span>").join(" • ") + "</p>";
  if (s.prompt) h += "<p><b>" + esc(s.prompt) + "</b></p>";
  if (s.suits.length) h += '<div class="row">' + s.suits.map(x=>'<button class="btn sm" data-suit="'+x.suit+'">'+esc(x.sym)+" "+esc(x.name)+"</button>").join("") + "</div>";
  h += '<p class="mut">' + esc(s.hand_title) + "</p><div>";
  h += s.hand.map(c=>'<button class="pcard'+(red(c.text)?" red":"")+'" data-card="'+c.card+'"'+(c.playable?"":" disabled")+">"+esc(c.text)+"</button>").join("");
  h += "</div>";
  let nav = "";
  if (s.next) nav += '<button class="btn sm" data-act="next">' + esc(s.b_next) + "</button> ";
  if (s.new) nav += '<button class="btn o sm" data-act="new">' + esc(s.b_new) + "</button>";
  if (nav) h += '<div class="row" style="margin-top:10px">' + nav + "</div>";
  board.innerHTML = h;
  board.querySelectorAll("[data-card]").forEach(b=>b.addEventListener("click",()=>act({action:"play",card:b.getAttribute("data-card")})));
  board.querySelectorAll("[data-suit]").forEach(b=>b.addEventListener("click",()=>act({action:"declare",suit:b.getAttribute("data-suit")})));
  board.querySelectorAll("[data-act]").forEach(b=>b.addEventListener("click",()=>act({action:b.getAttribute("data-act")})));
  if (s.chat.length !== chatLen) {
    const first = chatLen < 0;
    const nearBottom = chatlog.scrollHeight - chatlog.scrollTop - chatlog.clientHeight < 120;
    chatlog.innerHTML = s.chat.map(m=>{
      if (m.by === "sys") return '<div class="msg sys">' + esc(m.text) + "</div>";
      return '<div class="msg' + (m.by === "you" ? " you" : "") + '"><div class="who">' + esc(m.name) + "</div>" + esc(m.text) + "</div>";
    }).join("");
    chatLen = s.chat.length;
    if (first || nearBottom) chatlog.scrollTop = chatlog.scrollHeight;
  }
}
async function act(payload){
  try{
    const r = await fetch("/hokm/api/act",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    const j = await r.json();
    if(!j.ok && j.msg) showToast(j.msg);
    if(j.state) render(j.state);
  }catch(e){ showToast("..."); }
}
async function poll(){
  try{
    const r = await fetch("/hokm/api/state");
    const j = await r.json();
    if(j.state) render(j.state);
  }catch(e){}
}
document.getElementById("chatform").addEventListener("submit",ev=>{
  ev.preventDefault();
  const inp = document.getElementById("chatinput");
  const v = inp.value.trim();
  if(!v) return;
  inp.value = "";
  act({action:"chat",text:v});
});
document.getElementById("newbtn").addEventListener("click",()=>act({action:"new"}));
poll();
setInterval(poll,2500);'''


def _hokm_web_load() -> dict | None:
    rec = store.load_game(_HOKM_WEB_KEY)
    if not rec or rec.get("game") != "hokm":
        return None
    st = rec.get("state")
    if not isinstance(st, dict) or st.get("v") != 1 or not isinstance(st.get("hands"), list):
        return None
    return st


def _hokm_web_feed(st: dict, lang: str, evs: list[dict]) -> None:
    for e in evs:
        hokm_view.chat_append(st, "sys", hokm_view.event_context(e, st, lang).split("\n")[0])
    for seat, canned, _ev in hokm_view.pick_banter(evs, lang):
        hokm_view.chat_append(st, hokm_view.persona_id(seat), canned)


def _hokm_llm_say(pid: str, user_text: str, st: dict, lang: str, fallback: str) -> str:
    if not settings.openai_api_key or pid not in PERSONAS:
        return fallback
    try:
        ctx = hokm_view.table_status(st, lang) + "\n\n" + user_text
        out = asyncio.run(llm.chat_complete(
            [{"role": "system", "content": PERSONAS[pid][f"prompt_{lang}"]},
             {"role": "user", "content": ctx}], ""))
        return ((out or "").strip().replace("\n", " ")[:500]) or fallback
    except Exception as exc:
        log.warning("hokm web chat failed: %s", exc)
        return fallback


@app.get("/hokm")
def hokm_page():
    lang = get_lang()
    body = f'''<div id="toast"></div>
<div class="hwrap">
<div class="card"><div id="board"><p class="mut">...</p></div>
<p><button class="btn o sm" id="newbtn">{t("hokm.web.new", lang)}</button></p></div>
<div class="card"><h2>{t("hokm.web.chat_title", lang)}</h2>
<div id="chatlog"></div>
<form id="chatform"><input id="chatinput" maxlength="500" placeholder="{t("hokm.web.chat_ph", lang)}" autocomplete="off">
<button class="btn sm">{t("hokm.web.send", lang)}</button></form>
<p class="mut" style="font-size:13px">{t("hokm.web.auto", lang)}</p></div>
</div>
<style>{_HOKM_CSS}</style>
<script>{_HOKM_JS}</script>'''
    return page(t("hokm.title", lang), body, lang)


@app.get("/hokm/api/state")
def hokm_api_state():
    lang = get_lang()
    st = _hokm_web_load()
    if st is None:
        st = hokm_engine.new_match()
        evs = hokm_view.drain_agents(st)
        hokm_view.chat_append(st, "sys", t("hokm.new_match", lang,
                                           name=hokm_view.seat_name(st["hakem"], lang)))
        _hokm_web_feed(st, lang, evs)
        store.save_game(_HOKM_WEB_KEY, "hokm", st)
    else:
        evs = hokm_view.drain_agents(st)
        if evs:
            _hokm_web_feed(st, lang, evs)
            store.save_game(_HOKM_WEB_KEY, "hokm", st)
    return {"ok": True, "state": hokm_view.web_state(st, lang)}


@app.post("/hokm/api/act")
def hokm_api_act():
    lang = get_lang()
    data = request.get_json(silent=True) or {}
    action = str(data.get("action") or "").strip()
    st = _hokm_web_load()
    if action == "new" or st is None:
        st = hokm_engine.new_match()
        evs = hokm_view.drain_agents(st)
        hokm_view.chat_append(st, "sys", t("hokm.new_match", lang,
                                           name=hokm_view.seat_name(st["hakem"], lang)))
        _hokm_web_feed(st, lang, evs)
        store.save_game(_HOKM_WEB_KEY, "hokm", st)
        return {"ok": True, "state": hokm_view.web_state(st, lang)}
    if action == "chat":
        text = str(data.get("text") or "").strip()[:500]
        if not text:
            return {"ok": False}
        hokm_view.chat_append(st, "you", text)
        pid = hokm_view.chat_persona(text, st)
        reply = _hokm_llm_say(pid, text, st, lang, hokm_view.ack_line(pid, lang))
        hokm_view.chat_append(st, pid, reply)
        store.save_game(_HOKM_WEB_KEY, "hokm", st)
        return {"ok": True, "state": hokm_view.web_state(st, lang)}
    if action == "next":
        r = hokm_engine.next_round(st)
        if not r.get("ok"):
            return {"ok": False, "msg": t("hokm.stale", lang),
                    "state": hokm_view.web_state(st, lang)}
        evs = hokm_view.drain_agents(st)
    elif action == "declare":
        suit = str(data.get("suit") or "").strip().upper()
        r = hokm_engine.declare_trump(st, 0, suit) if suit in ("S", "H", "D", "C") else {"ok": False}
        if not r.get("ok"):
            return {"ok": False, "msg": t("hokm.stale", lang),
                    "state": hokm_view.web_state(st, lang)}
        evs = [hokm_view.declare_event(0, suit)] + hokm_view.drain_agents(st)
    elif action == "play":
        card = str(data.get("card") or "").strip().upper()
        r = hokm_engine.play_card(st, 0, card)
        if not r.get("ok"):
            if r.get("err") == "must_follow":
                msg = t("hokm.must_follow", lang, suit=hokm_view.suit_name(r["suit"], lang))
            elif r.get("err") == "not_turn":
                msg = t("hokm.wait_turn", lang, name=hokm_view.seat_name(st["turn"], lang))
            else:
                msg = t("hokm.stale", lang)
            return {"ok": False, "msg": msg, "state": hokm_view.web_state(st, lang)}
        evs = hokm_view.result_events(r, st) + hokm_view.drain_agents(st)
    else:
        return {"ok": False, "msg": t("hokm.stale", lang),
                "state": hokm_view.web_state(st, lang)}
    _hokm_web_feed(st, lang, evs)
    store.save_game(_HOKM_WEB_KEY, "hokm", st)
    return {"ok": True, "state": hokm_view.web_state(st, lang)}


# ---------------------------------------------------------------- admin auth

@app.get("/admin/login")
def admin_login():
    lang = get_lang()
    if session.get("admin"):
        return redirect(url_for("admin_home"))
    return page(t("web.login.title", lang), f"""<div class="card"><h2>{t("web.login.title", lang)}</h2>
    <form method="post"><label>{t("web.login.password", lang)}</label>
    <input name="password" type="password" dir="ltr" style="text-align:left">
    <p><button class="btn">{t("web.login.submit", lang)}</button></p></form></div>""", lang)


@app.post("/admin/login")
def admin_login_post():
    lang = get_lang()
    if not settings.web_password:
        return page(t("web.login.title", lang), f'<div class="card">⚠️ {t("web.login.nopw", lang)}</div>', lang)
    if (request.form.get("password") or "") == settings.web_password:
        session["admin"] = True
        return redirect(url_for("admin_home"))
    return page(t("web.login.title", lang), f"""<div class="card"><h2>{t("web.login.title", lang)}</h2>
    <p>⚠️ {t("web.login.wrong", lang)}</p>
    <form method="post"><label>{t("web.login.password", lang)}</label>
    <input name="password" type="password" dir="ltr" style="text-align:left">
    <p><button class="btn">{t("web.login.submit", lang)}</button></p></form></div>""", lang)


@app.get("/admin/logout")
def admin_logout():
    session.clear()
    return redirect(url_for("home"))


# ---------------------------------------------------------------- admin panels

@app.get("/admin")
@login_required
def admin_home():
    lang = get_lang()
    st = store.stats()
    cat = store.get_catalog()
    pend = store.list_orders("pending", 5)
    pend_html = "".join(
        f"<p>{'🛒' if o['kind'] == 'order' else '🧾'} <code>{esc(o['ref'])}</code> — "
        f"{esc(services.svc_display(cat, o['code'], lang)[0])}</p>" for o in pend
    ) or f'<p class="mut">{t("web.dash.empty_queue", lang)}</p>'
    open_t = store.list_tickets(True, 5)
    tick_html = "".join(
        f'<p>🎫 <a href="/admin/tickets/{esc(x["ref"])}"><code>{esc(x["ref"])}</code></a> '
        f"{esc(services.sev_label(x['sev'], lang))}</p>" for x in open_t
    ) or f'<p class="mut">{t("web.dash.empty_tickets", lang)}</p>'
    return page(t("web.nav.dash", lang), f"""
    <div class="grid">
    <div class="card"><h2>{t("web.dash.stats", lang)}</h2>
    <p>{t("web.dash.users", lang, n=st["users"])}</p>
    <p>{t("web.dash.pending", lang, n=st["pending"], total=st["orders"])}</p>
    <p>{t("web.dash.open", lang, n=st["open_tickets"], total=st["tickets"])}</p></div>
    <div class="card"><h2>{t("web.dash.recent_pending", lang)}</h2>{pend_html}
    <p><a class="btn sm" href="/admin/orders">{t("web.nav.orders", lang)}</a></p></div></div>
    <div class="card"><h2>{t("web.dash.recent_tickets", lang)}</h2>{tick_html}
    <p><a class="btn sm o" href="/admin/tickets">{t("web.nav.tickets", lang)}</a></p></div>
    """, lang)


@app.get("/admin/orders")
@login_required
def admin_orders():
    lang = get_lang()
    only_pending = request.args.get("st", "pending") != "all"
    items = store.list_orders("pending" if only_pending else None, 50)
    cat = store.get_catalog()
    filt = (f'<p><a class="btn sm" href="/admin/orders">{t("web.orders.pending_btn", lang)}</a> '
            f'<a class="btn o sm" href="/admin/orders?st=all">{t("web.orders.all_btn", lang)}</a></p>')
    rows = []
    for o in items:
        icon = "🛒" if o["kind"] == "order" else "🧾"
        desc = esc(o["descr"] or "")[:200]
        extra = t("orders.qty", lang, n=o["qty"]) if o["kind"] == "order" else ""
        who = store.user_name(o["user_id"]) if o["user_id"] else t("web.orders.web_user", lang)
        if o["status"] == "pending":
            reasons = "".join(f"<option>{t(f'approvals.{r}', lang)}</option>" for r in REJECT_REASONS)
            actions = (f'<form class="inline" method="post" action="/admin/orders/{esc(o["ref"])}/approve">'
                       f'<button class="btn g sm">{t("web.orders.approve", lang)}</button></form> '
                       f'<form class="inline" method="post" action="/admin/orders/{esc(o["ref"])}/reject">'
                       f'<select name="why">{reasons}</select> '
                       f'<button class="btn r sm">{t("web.orders.reject", lang)}</button></form>')
        else:
            actions = f"<span class='mut'>{esc(o['why']) if o['why'] else ''}</span>"
        rows.append(f"""<div class="card"><h2>{icon} <code>{esc(o["ref"])}</code> {badge_html(o["status"], lang)}</h2>
        <p>{esc(services.svc_display(cat, o["code"], lang)[0])}{esc(extra)} • 👤 {esc(who or o["user_id"])}</p>
        <p class="mut">{desc}</p><div class="row">{actions}</div></div>""")
    return page(t("web.nav.orders", lang),
                filt + ("".join(rows) or f'<div class="card">{t("web.orders.empty", lang)}</div>'), lang)


@app.post("/admin/orders/<ref>/approve")
@login_required
def admin_approve(ref):
    o = services.approve_order(ref)
    if not o:
        abort(404)
    if o["user_id"]:
        ulang = store.user_lang(o["user_id"])
        tg_send(o["user_id"], t("approvals.user_approved", ulang, ref=ref))
    return redirect("/admin/orders")


@app.post("/admin/orders/<ref>/reject")
@login_required
def admin_reject(ref):
    lang = get_lang()
    o = store.get_order(ref)
    if not o or o["status"] != "pending":
        abort(404)
    why = (request.form.get("why") or "").strip()[:100] or t("approvals.r1", lang)
    services.reject_order(ref, why)
    if o["user_id"]:
        ulang = store.user_lang(o["user_id"])
        tg_send(o["user_id"], t("approvals.user_rejected", ulang, ref=ref, why=why))
    return redirect("/admin/orders")


@app.get("/admin/tickets")
@login_required
def admin_tickets():
    lang = get_lang()
    only_open = request.args.get("st", "open") != "all"
    items = store.list_tickets(only_open, 50)
    filt = (f'<p><a class="btn sm" href="/admin/tickets">{t("web.tickets.open_btn", lang)}</a> '
            f'<a class="btn o sm" href="/admin/tickets?st=all">{t("web.tickets.all_btn", lang)}</a></p>')
    rows = []
    for x in items:
        th = store.thread(x["ref"])
        first = esc((th[0]["text"] if th else "")[:120])
        rows.append(f"""<div class="card"><h2>🎫 <code>{esc(x["ref"])}</code> {badge_html(x["status"], lang)}
        {esc(services.sev_label(x["sev"], lang))}</h2>
        <p class="mut">{first}…</p>
        <p><a class="btn sm" href="/admin/tickets/{esc(x["ref"])}">{t("web.tickets.chat_btn", lang)}</a></p></div>""")
    return page(t("web.nav.tickets", lang),
                filt + ("".join(rows) or f'<div class="card">{t("web.tickets.empty", lang)}</div>'), lang)


@app.get("/admin/tickets/<ref>")
@login_required
def admin_ticket_view(ref):
    lang = get_lang()
    x = store.get_ticket(ref)
    if not x:
        abort(404)
    who = store.user_name(x["user_id"]) if x["user_id"] else t("web.orders.web_user", lang)
    msgs = "".join(
        f'<div class="thread{" mgr" if m["from_mgr"] else ""}">'
        f"{t('web.track.mgr', lang) if m['from_mgr'] else t('web.track.you', lang)}: {esc(m['text'])}</div>"
        for m in store.thread(ref)
    )
    return page(ref, f"""<div class="card"><h2>🎫 <code>{esc(ref)}</code> {badge_html(x["status"], lang)}
    {esc(services.sev_label(x["sev"], lang))}</h2>
    <p class="mut">👤 {esc(who or x["user_id"])}</p>{msgs}
    <form method="post" action="/admin/tickets/{esc(ref)}/reply">
    <label>{t("web.ticket.reply_label", lang)}</label><textarea name="text" rows="3" maxlength="500" required></textarea>
    <p><button class="btn sm">{t("web.ticket.send", lang)}</button></p></form>
    <form method="post" action="/admin/tickets/{esc(ref)}/resolve">
    <button class="btn g sm">{t("web.ticket.resolve", lang)}</button></form></div>""", lang)


@app.post("/admin/tickets/<ref>/reply")
@login_required
def admin_ticket_reply(ref):
    x = services.reply_ticket(ref, True, (request.form.get("text") or "").strip()[:500])
    if not x:
        abort(404)
    full = store.get_ticket(ref)
    if full and full["user_id"]:
        ulang = store.user_lang(full["user_id"])
        tg_send(full["user_id"], t("tickets.user_reply", ulang, ref=ref,
                                   text=(request.form.get("text") or "").strip()[:400]))
    return redirect(f"/admin/tickets/{ref}")


@app.post("/admin/tickets/<ref>/resolve")
@login_required
def admin_ticket_resolve(ref):
    x = store.get_ticket(ref)
    if not x:
        abort(404)
    store.set_ticket(ref, "resolved")
    if x["user_id"]:
        ulang = store.user_lang(x["user_id"])
        tg_send(x["user_id"], t("tickets.status_changed", ulang, ref=ref,
                                status=services.badge("resolved", ulang)))
    return redirect("/admin/tickets")


@app.get("/admin/catalog")
@login_required
def admin_catalog():
    lang = get_lang()
    cat = store.get_catalog()
    cur = cat.get("currency") or {}
    ok = f'<div class="card">✅ {t("web.cat.saved", lang)}</div>' if request.args.get("ok") else ""
    rows = []
    for i, s in enumerate(cat.get("services", [])):
        fa, en = s.get("fa") or {}, s.get("en") or {}
        price = "" if s.get("price") is None else s.get("price")
        rows.append(f"""<div class="card"><h2>#{i + 1} — <code>{esc(s.get("code"))}</code></h2>
        <input type="hidden" name="code_{i}" value="{esc(s.get("code"))}">
        <label>{t("web.cat.icon", lang)}</label><input name="icon_{i}" value="{esc(s.get("icon", ""))}" maxlength="8">
        <label>{t("web.cat.fa_name", lang)}</label><input name="fa_name_{i}" value="{esc(fa.get("name", ""))}" maxlength="80">
        <label>{t("web.cat.fa_desc", lang)}</label><textarea name="fa_desc_{i}" rows="2" maxlength="300">{esc(fa.get("desc", ""))}</textarea>
        <label>{t("web.cat.en_name", lang)}</label><input name="en_name_{i}" value="{esc(en.get("name", ""))}" maxlength="80">
        <label>{t("web.cat.en_desc", lang)}</label><textarea name="en_desc_{i}" rows="2" maxlength="300">{esc(en.get("desc", ""))}</textarea>
        <label>{t("web.cat.price", lang)}</label><input name="price_{i}" value="{esc(price)}" type="number" min="0" dir="ltr" style="text-align:left">
        <p><label style="display:inline"><input type="checkbox" name="del_{i}" value="1" style="width:auto"> {t("web.cat.delete", lang)}</label></p></div>""")
    return page(t("web.nav.catedit", lang), f"""{ok}
    <form method="post"><input type="hidden" name="count" value="{len(cat.get("services", []))}">
    <div class="card"><h2>{t("web.cat.currency", lang)}</h2>
    <label>{t("web.cat.cur_fa", lang)}</label><input name="currency_fa" value="{esc(cur.get("fa", ""))}" maxlength="20">
    <label>{t("web.cat.cur_en", lang)}</label><input name="currency_en" value="{esc(cur.get("en", ""))}" maxlength="20"></div>
    {"".join(rows)}
    <div class="card"><h2>{t("web.cat.new", lang)}</h2>
    <label>{t("web.cat.new_code", lang)}</label><input name="new_code" maxlength="20" dir="ltr" style="text-align:left">
    <label>{t("web.cat.icon", lang)}</label><input name="new_icon" maxlength="8" value="📦">
    <label>{t("web.cat.fa_name", lang)}</label><input name="new_fa_name" maxlength="80">
    <label>{t("web.cat.fa_desc", lang)}</label><textarea name="new_fa_desc" rows="2" maxlength="300"></textarea>
    <label>{t("web.cat.en_name", lang)}</label><input name="new_en_name" maxlength="80">
    <label>{t("web.cat.en_desc", lang)}</label><textarea name="new_en_desc" rows="2" maxlength="300"></textarea>
    <label>{t("web.cat.price", lang)}</label><input name="new_price" type="number" min="0" dir="ltr" style="text-align:left"></div>
    <p><button class="btn">{t("web.cat.save", lang)}</button></p></form>
    <p class="mut">{t("web.cat.note", lang)}</p>""", lang)


@app.post("/admin/catalog")
@login_required
def admin_catalog_save():
    lang = get_lang()
    try:
        count = max(0, min(100, int(request.form.get("count", "0") or 0)))
    except (ValueError, TypeError):
        count = 0
    services_list, seen, dup = [], set(), None
    for i in range(count):
        code = (request.form.get(f"code_{i}") or "").strip()[:20]
        if not code or request.form.get(f"del_{i}"):
            continue
        if code in seen:
            dup = code
            break
        seen.add(code)
        price_raw = (request.form.get(f"price_{i}") or "").strip()
        try:
            price = int(price_raw) if price_raw else None
        except ValueError:
            price = None
        services_list.append({
            "code": code, "icon": (request.form.get(f"icon_{i}") or "📦").strip()[:8],
            "fa": {"name": (request.form.get(f"fa_name_{i}") or code).strip()[:80],
                   "desc": (request.form.get(f"fa_desc_{i}") or "").strip()[:300]},
            "en": {"name": (request.form.get(f"en_name_{i}") or code).strip()[:80],
                   "desc": (request.form.get(f"en_desc_{i}") or "").strip()[:300]},
            "price": price,
        })
    new_code = (request.form.get("new_code") or "").strip()[:20]
    if new_code and not dup:
        if new_code in seen:
            dup = new_code
        else:
            price_raw = (request.form.get("new_price") or "").strip()
            try:
                price = int(price_raw) if price_raw else None
            except ValueError:
                price = None
            services_list.append({
                "code": new_code, "icon": (request.form.get("new_icon") or "📦").strip()[:8],
                "fa": {"name": (request.form.get("new_fa_name") or new_code).strip()[:80],
                       "desc": (request.form.get("new_fa_desc") or "").strip()[:300]},
                "en": {"name": (request.form.get("new_en_name") or new_code).strip()[:80],
                       "desc": (request.form.get("new_en_desc") or "").strip()[:300]},
                "price": price,
            })
    if dup:
        return page(t("web.nav.catedit", lang),
                    f'<div class="card">⚠️ {t("web.cat.dup", lang, code=dup)}</div>', lang)
    store.save_catalog({
        "currency": {"fa": (request.form.get("currency_fa") or "").strip()[:20],
                     "en": (request.form.get("currency_en") or "").strip()[:20]},
        "services": services_list,
    })
    return redirect("/admin/catalog?ok=1")


@app.get("/admin/settings")
@login_required
def admin_settings():
    lang = get_lang()
    cur = store.all_settings()
    ok = f'<div class="card">✅ {t("web.set.saved", lang)}</div>' if request.args.get("ok") else ""
    err = f'<div class="card">⚠️ {esc(request.args.get("err"))}</div>' if request.args.get("err") else ""
    groups: dict[str, list[str]] = {}
    for key, group, kind in store.SETTING_DEFS:
        val = esc(cur.get(key, ""))
        env_default = getattr(settings, key, "") if not key.startswith(("welcome_", "help_")) else ""
        ph = esc(t("web.set.ph_with", lang, v=str(env_default)[:60]) if env_default
                 else t("web.set.ph_blank", lang))
        if kind == "area":
            field = f'<textarea name="set_{key}" rows="4" maxlength="4000" placeholder="{ph}">{val}</textarea>'
        else:
            field = f'<input name="set_{key}" value="{val}" maxlength="2000" placeholder="{ph}" dir="ltr" style="text-align:left">'
        label = t(f"settings.label.{key}", lang)
        groups.setdefault(group, []).append(f"<label>{esc(label)} — <code>{esc(key)}</code></label>{field}")
    sections = "".join(
        f'<div class="card"><h2>{esc(t(f"settings.group.{g}", lang))}</h2>{"".join(f)}' + "</div>"
        for g, f in groups.items()
    )
    return page(t("web.nav.settings", lang), f"""{ok}{err}<form method="post">{sections}
    <p><button class="btn">{t("web.set.save", lang)}</button></p></form>
    <p class="mut">{t("web.set.note", lang)}</p>""", lang)


@app.post("/admin/settings")
@login_required
def admin_settings_save():
    lang = get_lang()
    for key, _g, _kind in store.SETTING_DEFS:
        raw = (request.form.get(f"set_{key}") or "").strip()
        if raw == "":
            store.del_setting(key)
            continue
        err = services.validate_setting(key, raw, lang)
        if err:
            return redirect(f"/admin/settings?err={key}: {err}")
        store.set_setting(key, raw)
    return redirect("/admin/settings?ok=1")


@app.get("/admin/users")
@login_required
def admin_users():
    lang = get_lang()
    users = store.list_users(100)
    rows = "".join(
        f"<tr><td><code>{u['user_id']}</code></td><td>{esc(u['name'] or '—')}</td>"
        f"<td>{esc(u['mode'])}</td><td>{esc(u['model'] or t('web.users.default_model', lang))}</td>"
        f"<td>{esc(u.get('lang') or 'fa')}</td></tr>"
        for u in users
    ) or f'<tr><td colspan="5" class="mut">{t("web.users.empty", lang)}</td></tr>'
    return page(t("web.nav.users", lang), f"""<div class="card"><h2>{t("web.users.title", lang, n=len(users))}</h2>
    <table><tr><th>{t("web.users.id", lang)}</th><th>{t("web.users.name", lang)}</th><th>{t("web.users.mode", lang)}</th><th>{t("web.users.model", lang)}</th><th>{t("web.users.lang", lang)}</th></tr>{rows}</table></div>""", lang)


# ---------------------------------------------------------------- main

def main(port: int = 5000) -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    store.init_db()
    log.info("Web on %d (admin=%s)", port, "enabled" if settings.web_password else "DISABLED — set WEB_PASSWORD")
    app.run(host="0.0.0.0", port=port, threaded=True, use_reloader=False)


if __name__ == "__main__":
    main(port=settings.port or 5000)

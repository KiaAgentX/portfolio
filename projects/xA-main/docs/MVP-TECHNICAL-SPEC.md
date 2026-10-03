# Hermes Desk MVP — Technical Specification & Implementation Plan

**Product:** Multi-channel customer service and sales desk for oil-industry companies in the Middle East  
**Users:** Arabic-speaking customers (RTL) + Arabic/English-speaking admins  
**Scope:** Minimum Viable Product only  
**Date:** 2026-09-02  
**Status:** Ready for implementation  

This document is the single source of truth for the MVP. Anything not listed here is out of scope (self-learning, RL, multi-tenant SaaS billing, ERP/SAP live integration, Baileys WhatsApp, Railway volumes for business data, auto-send without human approval).

---

## 0. Product contract (non-negotiable)

1. Customers never talk to Hermes directly. Channels hit **our** ingress. Hermes is an internal worker.
2. No outbound message and no side-effect (quote PDF, ticket, CRM write beyond staging) leaves the system without an admin **Approve**.
3. The process is stateless. Persistent data lives in Postgres, Redis, R2/S3, and Qdrant — not container disks.
4. LLM access is OpenAI-compatible (`base_url` + `api_key` + `model`). Hermes is the agent runtime that **calls** that endpoint.
5. All customer-facing copy is Modern Standard Arabic, formal, RTL. Technical oil terms (API, SAE, INCOTERMS, SKU) stay in Latin script.
6. WhatsApp is official Cloud API (Meta) or Twilio. Unofficial bridges are forbidden.

Default timeout for approval: **10 minutes**. Fallback is fail-closed (see §7.5).

---

## 1. MVP scope

### In

| Area | What ships |
|---|---|
| Channels | Telegram bot, WhatsApp (Meta Cloud API **or** Twilio — one adapter live), Email inbound+outbound |
| HITL | Web admin + Telegram Mini App, approve / reject / edit-then-approve |
| Brain | Hermes worker + 5 specialist skills, OpenAI-compatible provider |
| Data | Redis, Postgres, R2/S3, Qdrant |
| Deploy | Docker Compose locally, Railway in production |
| UI | RTL Arabic admin, JWT **or** Telegram Login |

### Out

- Live SAP/Oracle price books (CSV/static catalog only)
- Auto-send of AI drafts
- Multi-tenant billing
- Voice notes transcription (text + images only)
- Self-improving skills / memory across customers
- Railway Volume as document store
- More than one WhatsApp provider at a time

### First vertical (bounded)

B2B lubricant / fuel / specialty-chemical sales desk:

- Product FAQ and spec lookup (TDS/MSDS snippets in RAG)
- Lead capture and scoring
- Quote **request** (list price from catalog, not negotiated contracts)
- Troubleshooting → support ticket
- Internal analytics for admins (counts, not a warehouse)

---

## 2. High-level architecture

```
 Telegram     WhatsApp      Email
 (Bot API)   (Cloud/Twilio) (Resend/SendGrid inbound)
     │            │              │
     └────────────┼──────────────┘
                  ▼
           ┌─────────────┐
           │  ingress    │  FastAPI webhooks + email receiver
           │  (stateless)│
           └──────┬──────┘
                  │ LPUSH ticket.incoming
                  ▼
           ┌─────────────┐     ┌──────────┐
           │  worker     │────▶│  Hermes  │──▶ OpenAI-compatible
           │  (arq)      │     │  runtime │    base_url
           └──────┬──────┘     └──────────┘
                  │ proposed JSON
                  ▼
           ┌─────────────┐     Redis pub/sub + SSE
           │  api        │◀──────────────────────▶ admin web
           │  + HITL     │                         + Mini App
           └──────┬──────┘
                  │ on approve
                  ▼
           send via channel adapters
                  │
                  ▼
           archive transcript → R2  |  index → Postgres  |  embeddings → Qdrant
```

**Railway services (5):** `ingress` (HTTP), `api` (HTTP), `worker` (no public HTTP), `hermes` (private HTTP), plus managed **Postgres**, **Redis**, and an external **R2/S3** bucket + **Qdrant** (Railway template or Qdrant Cloud).

`ingress` and `api` may be the same FastAPI process in MVP to cut cost. Keep modules separate so they can split later. Recommended MVP deploy: **one `app` web service** (ingress+api+admin static) + **one `worker`** + **one `hermes`**.

---

## 3. Complete directory tree

```
hermes-desk/
├── README.md
├── MVP-TECHNICAL-SPEC.md          # this file (copy in repo)
├── LICENSE
├── .env.example
├── .gitignore
├── docker-compose.yml
├── docker-compose.prod.yml
├── Makefile
│
├── infra/
│   ├── railway.toml               # optional root config
│   ├── nixpacks.toml              # only if not using Dockerfiles
│   └── caddy/                     # unused in MVP; Railway provides TLS
│
├── apps/
│   ├── api/                       # FastAPI: webhooks, HITL API, admin static
│   │   ├── Dockerfile
│   │   ├── pyproject.toml
│   │   ├── alembic.ini
│   │   ├── alembic/
│   │   │   ├── env.py
│   │   │   └── versions/
│   │   │       └── 0001_init.py
│   │   └── app/
│   │       ├── __init__.py
│   │       ├── main.py            # create_app(), mounts webhooks + /api + /admin
│   │       ├── config.py          # pydantic-settings
│   │       ├── deps.py            # get_db, get_redis, get_current_admin
│   │       ├── logging.py
│   │       ├── errors.py
│   │       ├── middleware/
│   │       │   ├── __init__.py
│   │       │   ├── request_id.py
│   │       │   └── rate_limit.py
│   │       ├── auth/
│   │       │   ├── __init__.py
│   │       │   ├── jwt.py
│   │       │   └── telegram.py    # Login Widget + Mini App initData HMAC
│   │       ├── routers/
│   │       │   ├── health.py
│   │       │   ├── auth.py
│   │       │   ├── webhooks_telegram.py
│   │       │   ├── webhooks_whatsapp.py
│   │       │   ├── webhooks_email.py
│   │       │   ├── approvals.py
│   │       │   ├── tickets.py
│   │       │   ├── admin_metrics.py
│   │       │   └── sse.py
│   │       ├── schemas/
│   │       │   ├── common.py
│   │       │   ├── inbound.py
│   │       │   ├── ticket.py
│   │       │   └── approval.py
│   │       └── static/            # built admin SPA copied here in Docker
│   │
│   ├── worker/                    # arq workers: classify → hermes → HITL wait → send → archive
│   │   ├── Dockerfile
│   │   ├── pyproject.toml
│   │   └── worker/
│   │       ├── __init__.py
│   │       ├── main.py            # arq WorkerSettings
│   │       ├── settings.py
│   │       ├── jobs/
│   │       │   ├── ingest.py
│   │       │   ├── run_agents.py
│   │       │   ├── timeout.py
│   │       │   ├── send.py
│   │       │   └── archive.py
│   │       └── locks.py           # per-conversation Redis lock
│   │
│   ├── hermes/                    # Hermes Agent runtime (internal only)
│   │   ├── Dockerfile             # FROM nousresearch/hermes-agent pinned
│   │   ├── entrypoint.sh
│   │   ├── config.yaml            # generated from env on boot
│   │   └── skills/                # copied into HERMES_HOME/skills
│   │       ├── knowledge-oil/
│   │       │   └── SKILL.md
│   │       ├── customer-oil/
│   │       │   └── SKILL.md
│   │       ├── sales-oil/
│   │       │   └── SKILL.md
│   │       ├── support-oil/
│   │       │   └── SKILL.md
│   │       └── analytics-oil/
│   │           └── SKILL.md
│   │
│   └── admin/                     # Vite + React + RTL
│       ├── Dockerfile             # multi-stage: build → nginx or copy to api/static
│       ├── package.json
│       ├── vite.config.ts
│       ├── index.html
│       ├── tsconfig.json
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── i18n.ts            # ar as default
│           ├── theme.ts           # RTL, Arabic font
│           ├── api.ts
│           ├── auth.ts
│           ├── telegram.ts        # Mini App SDK
│           ├── types.ts
│           ├── pages/
│           │   ├── Login.tsx
│           │   ├── Inbox.tsx      # real-time approval queue
│           │   ├── Ticket.tsx     # original + proposal + actions
│           │   └── Metrics.tsx
│           └── components/
│               ├── TicketCard.tsx
│               ├── ApproveBar.tsx
│               ├── MessageBubble.tsx
│               └── ActionList.tsx
│
├── packages/
│   └── core/                      # shared Python library (installed by api + worker)
│       ├── pyproject.toml
│       └── hermesdesk/
│           ├── __init__.py
│           ├── types.py           # InboundMessage, ProposedResponse, Action
│           ├── ids.py             # TCK-xxxx, ulid
│           ├── arabic.py          # normalize, bidi-safe truncate
│           ├── security/
│           │   ├── __init__.py
│           │   ├── secrets.py
│           │   └── validate.py
│           ├── db/
│           │   ├── __init__.py
│           │   ├── session.py
│           │   ├── models.py
│           │   └── repos.py
│           ├── redisutil/
│           │   ├── __init__.py
│           │   ├── keys.py
│           │   ├── queue.py
│           │   └── events.py
│           ├── storage/
│           │   ├── __init__.py
│           │   ├── s3.py          # R2/S3 via boto3
│           │   ├── paths.py
│           │   └── parquet_archive.py
│           ├── rag/
│           │   ├── __init__.py
│           │   ├── qdrant.py
│           │   ├── embed.py       # OpenAI-compatible embeddings
│           │   └── ingest.py
│           ├── llm/
│           │   ├── __init__.py
│           │   └── client.py      # AsyncOpenAI(base_url, api_key)
│           ├── hermes_client/
│           │   ├── __init__.py
│           │   └── client.py      # HTTP to internal Hermes /v1/chat/completions
│           ├── agents/
│           │   ├── __init__.py
│           │   ├── router.py
│           │   ├── orchestrator.py
│           │   ├── prompts.py     # all 5 system prompts
│           │   ├── schemas.py     # pydantic outputs
│           │   └── tools/
│           │       ├── __init__.py
│           │       ├── catalog.py
│           │       ├── customers.py
│           │       ├── tickets.py
│           │       ├── quotes.py
│           │       └── metrics.py
│           └── channels/
│               ├── __init__.py
│               ├── base.py        # ChannelAdapter protocol
│               ├── telegram.py
│               ├── whatsapp_meta.py
│               ├── whatsapp_twilio.py
│               └── email.py
│
├── data/
│   ├── catalog/                   # seed products (CSV → Postgres)
│   │   ├── products.csv
│   │   └── prices.csv
│   └── knowledge/                 # seed RAG corpus (Arabic+English)
│       ├── faq.md
│       ├── tds/.gitkeep
│       └── msds/.gitkeep
│
├── scripts/
│   ├── seed_db.py
│   ├── ingest_knowledge.py
│   ├── create_admin.py
│   └── smoketest.sh
│
└── tests/
    ├── conftest.py
    ├── unit/
    │   ├── test_router.py
    │   ├── test_arabic.py
    │   ├── test_validate.py
    │   ├── test_keys.py
    │   └── test_agent_schemas.py
    ├── integration/
    │   ├── test_webhook_telegram.py
    │   ├── test_approval_flow.py
    │   ├── test_timeout.py
    │   └── test_archive.py
    └── e2e/
        └── test_happy_path.py
```

Python 3.12, Node 22. Shared lib `hermesdesk` is the domain. Apps stay thin.

---

## 4. Module descriptions

### 4.1 `packages/core/hermesdesk` — domain core

Owns types, DB models, Redis keys, S3 paths, LLM client, channel adapters, agent prompts/tools. Both `api` and `worker` depend on it. No FastAPI routers here.

### 4.2 `apps/api` — HTTP edge

- `POST /webhooks/telegram` — python-telegram-bot webhook (or raw Bot API JSON; PTB used to parse/validate `Update`)
- `POST /webhooks/whatsapp` — Meta or Twilio signature check
- `POST /webhooks/email` — Resend/SendGrid inbound
- `GET /health` — no auth, Railway healthcheck
- `POST /api/auth/login` — email/password JWT (optional)
- `POST /api/auth/telegram` — Telegram Login Widget
- `GET /api/approvals` — queue
- `POST /api/approvals/{id}/approve|reject`
- `PATCH /api/approvals/{id}` — edit draft then approve
- `GET /api/tickets/{id}`
- `GET /api/events` — SSE for inbox
- Serves `/admin` SPA and Telegram Mini App from the same origin

On inbound: validate → persist raw payload to R2 → insert ticket `received` → enqueue `ingest` job → return 200 **fast** (< 2s). Never call Hermes inside the webhook.

### 4.3 `apps/worker` — arq

Concurrency: `max_jobs=8` (tune to LLM RPM). Jobs:

| Job | Trigger | Work |
|---|---|---|
| `ingest` | webhook | normalize, attach files to R2, ACK customer, enqueue `run_agents` |
| `run_agents` | ingest | conversation lock → router → Hermes → write proposal → status `awaiting_approval` → notify admins → schedule `timeout` |
| `timeout` | eta +10 min | if still awaiting → `expired` + fallback send |
| `send` | approve | execute allowed actions, send via adapter, status `sent` |
| `archive` | after send/reject/expire | parquet + JSON to R2, optional embed |

### 4.4 `apps/hermes` — brain

Pinned image, **not** public. Exposes OpenAI-compatible `POST /v1/chat/completions` on an internal Railway private URL (`http://hermes.railway.internal:8642`).

- `approvals.mode` inside Hermes is irrelevant for customer sends; we do not let Hermes send.
- YOLO disabled. No messaging gateway enabled (no `TELEGRAM_BOT_TOKEN` in this container).
- Skills in `apps/hermes/skills/*` are the five specialists.
- Worker calls Hermes with `tools` our orchestrator also understands, **or** with a forced skill + JSON response schema.

MVP integration style (pick this, do not mix):

**Hermes as tool-loop runtime.** Worker sends:

```json
{
  "model": "hermes-agent",
  "messages": [
    {"role": "system", "content": "<specialist prompt + JSON schema>"},
    {"role": "user", "content": "<ticket bundle>"}
  ],
  "response_format": {"type": "json_object"}
}
```

If the Hermes image in use does not honor `response_format`, the system prompt requires a single JSON object and the worker parses with a strict pydantic model + retry once.

LLM provider is configured **inside Hermes** via env:

```
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_API_KEY=...
LLM_MODEL=openai/gpt-4o
```

Swapping GPT-4o / DeepSeek / vLLM is an env change, not a code change.

### 4.5 `apps/admin` — HITL UI

Vite + React, `dir="rtl"`, `lang="ar"`. Default locale Arabic. One codebase for:

- Browser dashboard at `https://<api>/admin`
- Telegram Mini App (same URLs, detects `window.Telegram.WebApp`)

Inbox polls SSE. Ticket view:

1. Original customer message (channel badge, time, attachments)
2. Proposed Arabic reply (editable textarea)
3. Proposed actions (order lookup, quote lines) as a checklist — admin can untick
4. Agent trace: which specialist, risk, citations
5. Buttons: موافقة / رفض / تعديل ثم إرسال

### 4.6 Channels

`ChannelAdapter` protocol:

```python
class ChannelAdapter(Protocol):
    name: str  # telegram | whatsapp | email
    async def send_text(self, to: str, text: str, *, reply_to: str | None) -> str: ...
    async def send_document(self, to: str, r2_key: str, filename: str) -> str: ...
    async def ack_received(self, to: str, ticket_id: str) -> None: ...
```

- **Telegram:** `python-telegram-bot` v21+, webhook mode, `secret_token` header. Outbound via `Bot.send_message`. Mini App button `web_app` on the admin bot (separate bot from the customer bot).
- **WhatsApp:** interface `WhatsAppProvider` with two impls. Env `WHATSAPP_PROVIDER=meta|twilio`. Meta: Graph API `v21.0` messages. Twilio: `from=whatsapp:+...`. Respect 24h customer-care window; outside window only pre-approved template `ticket_received`.
- **Email:** outbound Resend or SendGrid (`EMAIL_PROVIDER`). Inbound webhook with raw MIME stored on R2. Strip HTML to text with `bleach`. Attachments max 10 MB each, 25 MB total.

Customer bot ≠ admin bot on Telegram.

---

## 5. Data flow (message → agent → approval → response)

```
1. Customer sends Arabic message on Telegram/WhatsApp/Email
2. Channel vendor POST webhook → apps/api
3. Verify signature / secret
4. Persist raw JSON/MIME → r2://inbound/{tenant}/{yyyy}/{mm}/{dd}/{msg_id}
5. INSERT tickets status=received
6. INSERT messages role=customer
7. Enqueue arq job ingest(ticket_id)
8. HTTP 200 to vendor

9. ingest:
   a. Dedup by provider_message_id
   b. Upload attachments → r2://attachments/...
   c. Upsert contacts + channel_identities
   d. Send ACK: "تم استلام رسالتكم. رقم المتابعة {ticket_id}."
   e. Enqueue run_agents(ticket_id)

10. run_agents:
    a. Acquire Redis lock lock:conv:{conversation_id} (NX, TTL 120s)
    b. Load last N=20 messages + contact + catalog hints
    c. Router LLM (cheap model) → intent + specialist
    d. Call Hermes with specialist system prompt + tools
    e. Validate ProposedResponse (pydantic)
    f. If invalid JSON → one repair call; still invalid → status=needs_human, notify admin, STOP
    g. INSERT agent_runs, proposed_responses, proposed_actions
    h. status=awaiting_approval
    i. PUBLISH events:approval_needed
    j. Enqueue timeout(ticket_id) eta=now+600s
    k. Release lock

11. Admin (web or Mini App) sees card
    - Approve: POST .../approve {edited_text?, action_ids[]}
    - Reject: POST .../reject {reason}
    - Timeout: job timeout fires

12a. Approve:
     status=approved
     enqueue send(ticket_id, text, action_ids)
12b. Reject:
     status=rejected
     optional: enqueue run_agents again with admin_note (max 2 loops)
     else needs_human
12c. Timeout:
     if status still awaiting_approval:
       status=expired
       send fallback (see §7.5)
       enqueue archive

13. send:
    a. Execute actions in order (quotes, tickets) — all idempotent
    b. Adapter.send_text(final_arabic)
    c. status=sent
    d. enqueue archive

14. archive:
    Write JSON + Parquet to r2://archive/{yyyy}/{mm}/{ticket_id}/
    Upsert search_documents (Postgres FTS)
    Optionally embed customer+reply into Qdrant collection tickets
```

State machine:

```
received → acked → running → awaiting_approval → approved → sending → sent → archived
                              ↘ rejected → (rerun ≤2) → needs_human → archived
                              ↘ expired → fallback_sent → archived
running → failed → needs_human
```

Illegal transitions raise and are logged. Never jump `awaiting_approval` → `sent`.

---

## 6. Five specialists (skills + prompts)

Router (cheap, JSON) chooses **one primary**. Customer Agent always runs first as a cheap structured extract (no tools except `upsert_contact`). Analytics never runs on the customer path; admin Metrics page or explicit admin command only.

### 6.1 Shared policy block (prepended to every specialist)

```
أنت وكيل خدمة ضمن «مكتب هرمس» لشركات النفط والتزييت في الشرق الأوسط.
القواعد:
- الرد دائماً بالفصحى الرسمية، مهذب، مختصر، بلا عامية.
- المصطلحات التقنية تُكتب باللاتينية: API, SAE, HVI, INCOTERMS, SKU, TDS, MSDS.
- لا تَعِد بسعر تعاقدي أو مهلة تسليم غير موجودة في الكتالوج.
- لا تخترع مواصفات منتج. إن غاب المصدر قل «غير متوفر في قاعدة المعرفة».
- لا تطلب تحويل بنكي أو مستندات هوية حساسة في الدردشة.
- المخرجات JSON فقط حسب المخطط المعطى. بلا Markdown خارج JSON.
- النص للعميل في الحقل customer_reply_ar، اتجاه RTL.
- أي إجراء له أثر (إنشاء تذكرة، إنشاء عرض سعر) يوضع في actions ويُنفَّذ فقط بعد موافقة المشرف.
```

### 6.2 Knowledge Agent — `knowledge-oil`

**Job:** FAQ / TDS / MSDS / grade compatibility.  
**Tools:** `search_knowledge(query)`, `get_product(sku)`.  
**Not allowed:** send, price override, ticket create.

System prompt (body):

```
الدور: أخصائي معرفة منتجات التزييت والوقود.
استخرج سؤال العميل، ابحث في قاعدة المعرفة، وأعد إجابة دقيقة.
إن كان السؤال عن توافق لزوجة/مواصفة، اذكر شرط الاستخدام (ديزل ثقيل، توربين، ضاغط).
أدرج citations كمفاتيح وثائق RAG لا كروابط ويب مخترعة.
```

### 6.3 Customer Agent — `customer-oil`

**Job:** profile fields + lead score 0–100.  
**Tools:** `get_contact`, `upsert_contact`.  
**Output extra:** `lead_score`, `lead_reason`, `missing_fields`.

Extract: company, country, city, industry plant type, volume hint, language. Scoring heuristic documented in `prompts.py` (company named +20, volume +20, SKU mentioned +15, phone/email +15, tender language +20, max 100).

### 6.4 Sales Agent — `sales-oil`

**Job:** recommend SKUs, list-price quote lines.  
**Tools:** `search_products`, `get_price_list`, `draft_quote`.  
**Rules:** currency from catalog (AED/SAR/USD). `draft_quote` only stages a row `quotes.status=draft`. Send happens after HITL.

### 6.5 Support Agent — `support-oil`

**Job:** troubleshooting, severity, ticket.  
**Tools:** `search_knowledge`, `create_support_ticket`.  
**Safety:** if customer reports fire, spill, injury → `risk=critical`, `customer_reply_ar` tells them to call emergency numbers, `actions=[]` except `create_support_ticket` with severity critical. Still HITL, but timeout fallback does **not** wait 10 minutes — page all admins immediately (see §7.5).

### 6.6 Analytics Agent — `analytics-oil`

**Job:** admin-only metrics.  
**Tools:** `query_metrics` (predefined SQL, no raw SQL from the model).  
**Never** attached to inbound customer jobs.

Predefined metrics: tickets by status, median approval time, channel mix, top SKUs, expired rate.

### 6.7 Orchestrator algorithm

```
contact = CustomerAgent.extract(ticket)
intent = Router.classify(ticket, contact)  # knowledge|sales|support|other
if intent == other: primary = support (safe default)
bundle = Hermes.run(skill=primary, context={ticket, contact, last_messages})
proposal = ProposedResponse.parse(bundle)
proposal.lead_score = contact.lead_score
save and notify HITL
```

No multi-agent debate loop in MVP.

### 6.8 ProposedResponse schema (strict)

```python
class ActionType(str, Enum):
    draft_quote = "draft_quote"
    create_support_ticket = "create_support_ticket"
    upsert_contact = "upsert_contact"
    none = "none"

class ProposedAction(BaseModel):
    type: ActionType
    payload: dict
    reversible: bool = True

class ProposedResponse(BaseModel):
    customer_reply_ar: str = Field(min_length=2, max_length=4000)
    customer_reply_en: str | None = None   # optional internal
    rationale_ar: str
    risk: Literal["low", "medium", "high", "critical"]
    specialist: Literal["knowledge", "customer", "sales", "support", "analytics"]
    citations: list[str] = []
    actions: list[ProposedAction] = []
    language: Literal["ar"] = "ar"
```

Worker rejects proposals with `actions` types outside the specialist allowlist.

---

## 7. HITL, timeout, fallback

### 7.1 Admin surfaces

| Surface | Auth | Use |
|---|---|---|
| Web `/admin` | JWT (email/password) **or** Telegram Login Widget | desktop |
| Telegram Mini App | `initData` HMAC-SHA256 with bot token | phone, one tap |

Same REST API. Mini App is not a second backend.

### 7.2 Approve

Body:

```json
{
  "final_text_ar": "optional override",
  "action_ids": ["uuid", "uuid"],
  "note": "optional"
}
```

Writes `approvals` row (`decision=approved`, `admin_id`, `draft_hash`, `final_hash`). Enqueues `send`.

### 7.3 Reject

```json
{ "reason": "السعر غير صحيح", "requeue": false }
```

If `requeue=true` and `rerun_count<2`, enqueue `run_agents` with `admin_note`. Else `needs_human`.

### 7.4 Edit-then-approve

PATCH text, then same as approve. `final_hash != draft_hash` stored for audit.

### 7.5 Timeout (10 minutes)

arq `timeout` job, not Redis key expiry alone (expiry is a backup).

| Ticket.risk | On expire |
|---|---|
| low / medium | status=`expired`; **do not** send the AI draft; send template: «نعتذر عن التأخير. سيتواصل معكم أحد المختصين قريباً.»; notify admin group |
| high | same customer template; page admin via Telegram DM + repeat every 5 min × 3 |
| critical | **do not wait 10 min**; on proposal, `timeout` eta=60s and immediately page; never auto-send operational advice |

ACK in step 9d already went out. Timeout message is a second customer-visible line. Idempotent: if admin approved at t=9:59 and timeout fires at 10:00, timeout no-ops because status ≠ `awaiting_approval`.

Redis backup: `approval:ttl:{ticket_id}` TTL 600s. A `keyevent` listener is **not** required in MVP; the arq eta job is the source of truth. Redis TTL is for dashboards (`TTL` command).

---

## 8. PostgreSQL schema

UUID PKs (`gen_random_uuid()`). Timestamps `timestamptz`. All customer text `text`. MVP is single-tenant but every table still has `tenant_id text not null default 'default'` so a later split does not rewrite rows.

```sql
-- 0001_init.py

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE TABLE admins (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     text NOT NULL DEFAULT 'default',
  email         citext UNIQUE,
  password_hash text,
  telegram_user_id bigint UNIQUE,
  name          text NOT NULL,
  role          text NOT NULL CHECK (role IN ('owner', 'approver', 'viewer')),
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE contacts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     text NOT NULL DEFAULT 'default',
  display_name  text,
  company       text,
  country       text,
  city          text,
  language      text NOT NULL DEFAULT 'ar',
  lead_score    int NOT NULL DEFAULT 0 CHECK (lead_score BETWEEN 0 AND 100),
  lead_reason   text,
  metadata      jsonb NOT NULL DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE channel_identities (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id    uuid NOT NULL REFERENCES contacts(id),
  channel       text NOT NULL CHECK (channel IN ('telegram', 'whatsapp', 'email')),
  external_id   text NOT NULL,          -- telegram user id, wa_id, email
  display       text,
  UNIQUE (channel, external_id)
);

CREATE TABLE conversations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     text NOT NULL DEFAULT 'default',
  contact_id    uuid NOT NULL REFERENCES contacts(id),
  channel       text NOT NULL,
  external_thread_id text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tickets (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id     text NOT NULL UNIQUE,   -- TCK-1842
  tenant_id     text NOT NULL DEFAULT 'default',
  conversation_id uuid NOT NULL REFERENCES conversations(id),
  contact_id    uuid NOT NULL REFERENCES contacts(id),
  channel       text NOT NULL,
  status        text NOT NULL CHECK (status IN (
                  'received','acked','running','awaiting_approval',
                  'approved','rejected','sending','sent',
                  'expired','failed','needs_human','archived'
                )),
  risk          text NOT NULL DEFAULT 'low',
  intent        text,
  specialist    text,
  rerun_count   int NOT NULL DEFAULT 0,
  provider_message_id text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (channel, provider_message_id)
);

CREATE INDEX tickets_status_idx ON tickets(status, created_at DESC);

CREATE TABLE messages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id     uuid NOT NULL REFERENCES tickets(id),
  conversation_id uuid NOT NULL REFERENCES conversations(id),
  role          text NOT NULL CHECK (role IN ('customer','assistant','admin','system')),
  channel       text NOT NULL,
  text          text NOT NULL,
  raw_r2_key    text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE attachments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id    uuid NOT NULL REFERENCES messages(id),
  r2_key        text NOT NULL,
  filename      text NOT NULL,
  mime          text NOT NULL,
  bytes         int NOT NULL,
  sha256        text NOT NULL
);

CREATE TABLE products (
  sku           text PRIMARY KEY,
  name_ar       text NOT NULL,
  name_en       text NOT NULL,
  category      text NOT NULL,          -- lubricant|fuel|chemical|other
  viscosity     text,
  spec_api      text,
  spec_sae      text,
  pack_sizes    text[],
  is_active     boolean NOT NULL DEFAULT true,
  tds_r2_key    text,
  msds_r2_key   text
);

CREATE TABLE prices (
  sku           text NOT NULL REFERENCES products(sku),
  currency      text NOT NULL,          -- AED|SAR|USD
  unit          text NOT NULL,          -- L|kg|drum|mt
  list_price    numeric(12,2) NOT NULL,
  valid_from    date NOT NULL,
  valid_to      date,
  PRIMARY KEY (sku, currency, unit, valid_from)
);

CREATE TABLE agent_runs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id     uuid NOT NULL REFERENCES tickets(id),
  specialist    text NOT NULL,
  model         text NOT NULL,
  prompt_tokens int,
  completion_tokens int,
  latency_ms    int,
  input_r2_key  text,
  output_r2_key text,
  error         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE proposed_responses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id     uuid NOT NULL REFERENCES tickets(id),
  agent_run_id  uuid REFERENCES agent_runs(id),
  draft_text_ar text NOT NULL,
  rationale_ar  text NOT NULL,
  risk          text NOT NULL,
  citations     jsonb NOT NULL DEFAULT '[]',
  draft_hash    text NOT NULL,
  raw_json      jsonb NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE proposed_actions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id   uuid NOT NULL REFERENCES proposed_responses(id),
  type          text NOT NULL,
  payload       jsonb NOT NULL,
  reversible    boolean NOT NULL DEFAULT true
);

CREATE TABLE approvals (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id     uuid NOT NULL REFERENCES tickets(id),
  proposal_id   uuid NOT NULL REFERENCES proposed_responses(id),
  admin_id      uuid NOT NULL REFERENCES admins(id),
  decision      text NOT NULL CHECK (decision IN ('approved','rejected')),
  final_text_ar text,
  final_hash    text,
  reason        text,
  selected_action_ids uuid[],
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE quotes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id     uuid NOT NULL REFERENCES tickets(id),
  contact_id    uuid NOT NULL REFERENCES contacts(id),
  status        text NOT NULL CHECK (status IN ('draft','issued','void')),
  currency      text NOT NULL,
  lines         jsonb NOT NULL,         -- [{sku, qty, unit, list_price}]
  total         numeric(12,2) NOT NULL,
  pdf_r2_key    text,
  issued_at     timestamptz
);

CREATE TABLE support_tickets (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id     uuid NOT NULL REFERENCES tickets(id),
  severity      text NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  category      text,
  body_ar       text NOT NULL,
  status        text NOT NULL DEFAULT 'open',
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_events (
  id            bigserial PRIMARY KEY,
  tenant_id     text NOT NULL DEFAULT 'default',
  ticket_id     uuid,
  actor_type    text NOT NULL,          -- system|admin|agent
  actor_id      text,
  event         text NOT NULL,
  before_hash   text,
  after_hash    text,
  payload       jsonb NOT NULL DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE search_documents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id     uuid REFERENCES tickets(id),
  r2_key        text NOT NULL,
  doc_type      text NOT NULL,          -- transcript|attachment|report
  fts           tsvector,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX search_documents_fts_idx ON search_documents USING gin(fts);

-- Arabic-friendly FTS: simple config in MVP (no shipped Arabic stemmer).
-- Populate fts with to_tsvector('simple', unaccent(text)).
```

SQLAlchemy models in `hermesdesk/db/models.py` map 1:1. Alembic is the only migrator.

---

## 9. Redis keys

Prefix `hd:` (hermes desk). Avoid huge values; payloads stay in Postgres/R2.

| Key | Type | TTL | Purpose |
|---|---|---|---|
| `hd:lock:conv:{conversation_id}` | string (`ticket_id`) | 120s | one agent run per thread |
| `hd:lock:ticket:{ticket_id}` | string | 60s | send/timeout mutex |
| `hd:approval:ttl:{ticket_id}` | string (`proposal_id`) | 600s | dashboard countdown |
| `hd:dedup:{channel}:{provider_message_id}` | string | 7d | webhook retries |
| `hd:rl:ip:{ip}` | incr | 60s | HTTP rate limit |
| `hd:rl:ident:{channel}:{external_id}` | incr | 60s | per-customer rate limit |
| `hd:sse:admins` | pubsub channel | — | `{type, ticket_id}` JSON |
| `hd:metrics:incr:{name}:{yyyy-mm-dd}` | incr | 14d | cheap counters |
| `arq:queue` | arq internal | — | do not touch |

arq job names: `ingest`, `run_agents`, `timeout`, `send`, `archive`.

Pub/sub payload:

```json
{"type": "approval_needed", "ticket_id": "...", "public_id": "TCK-1842", "risk": "medium"}
```

API SSE endpoint subscribes and forwards to the browser / Mini App.

---

## 10. Worker / queue architecture

- Library: **arq** on Redis (async, matches FastAPI).
- Web process: webhook → DB → `enqueue` → 200.
- Worker process: separate Railway service, same image, different CMD.

```
CMD web:    uvicorn app.main:app --host 0.0.0.0 --port $PORT
CMD worker: arq worker.main.WorkerSettings
```

**Fairness:** queue is FIFO. `critical` jobs use arq `_queue_name="critical"` (second queue, worker listens to both, critical first).

**Concurrency:**

- Global: `max_jobs=8`
- Per conversation: Redis lock; if locked, `ingest` **defers** 5s (max 12 retries) rather than parallel Hermes runs that scramble context
- Hermes HTTP timeout 90s; on timeout ticket → `failed` / `needs_human`

**Idempotency keys:** `send` and `draft_quote` use `ticket_id + proposal_id` unique constraints so a double-approve cannot double-send.

**Poison messages:** after 3 job exceptions → `tickets.status=failed`, alert admins, do not tight-loop.

---

## 11. Object storage (R2/S3) layout

Bucket private. Server-side: R2 default encryption. Application: SHA-256 of plaintext stored in Postgres.

```
inbound/{tenant}/{yyyy}/{mm}/{dd}/{provider_message_id}.json
attachments/{tenant}/{ticket_id}/{sha256}.{ext}
agent/{tenant}/{ticket_id}/{run_id}/input.json
agent/{tenant}/{ticket_id}/{run_id}/output.json
quotes/{tenant}/{quote_id}.pdf
archive/{tenant}/{yyyy}/{mm}/{ticket_id}/transcript.json
archive/{tenant}/{yyyy}/{mm}/{ticket_id}/transcript.parquet
archive/{tenant}/{yyyy}/{mm}/{ticket_id}/attachments.json
```

Parquet schema (`transcript.parquet`):

```
ticket_id, public_id, channel, contact_id, created_at,
customer_text, final_text_ar, specialist, risk,
admin_id, decision, latency_ms
```

MVP writes one row-group per ticket (tiny files). A later job can compact monthly. Do **not** put Parquet on Railway disk.

Presigned GET URLs (15 min) for admin attachment preview. No public ACL.

---

## 12. RAG / Qdrant

- Collection `knowledge` (MVP). Optional `tickets` later — skip auto-embed of PII in MVP unless `EMBED_TICKETS=true`.
- Vectors: OpenAI-compatible embeddings endpoint (`EMBEDDING_BASE_URL` may equal `OPENAI_BASE_URL`, model e.g. `text-embedding-3-small` or OpenRouter equivalent). Dim stored in config, default 1536.
- Payload: `{sku, title_ar, title_en, doc_type, r2_key, chunk_index, text}`
- Chunk: 512 tokens, 64 overlap, keep SKU in every chunk header.
- Ingest script `scripts/ingest_knowledge.py` is manual/CI, not runtime.
- Tool `search_knowledge` → Qdrant query top_k=6, score threshold 0.25, return text to Hermes.

If Qdrant is down, Knowledge Agent must say knowledge is unavailable — no hallucinated TDS.

---

## 13. LLM client (OpenAI-compatible)

`packages/core/hermesdesk/llm/client.py`:

```python
from openai import AsyncOpenAI

def make_client(settings) -> AsyncOpenAI:
    return AsyncOpenAI(
        base_url=settings.openai_base_url.rstrip("/"),
        api_key=settings.openai_api_key,
        timeout=60.0,
        max_retries=2,
    )
```

Hermes uses the same env. Router and embeddings may use `ROUTER_MODEL` (cheaper). Never hardcode OpenAI host.

Models via env:

```
LLM_MODEL=openai/gpt-4o
ROUTER_MODEL=openai/gpt-4o-mini
EMBEDDING_MODEL=text-embedding-3-small
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_API_KEY=sk-...
HERMES_BASE_URL=http://hermes.railway.internal:8642/v1
HERMES_API_KEY=...
```

---

## 14. Admin panel UX (RTL)

- `document.documentElement.dir = "rtl"`
- Font: `IBM Plex Sans Arabic` (self-host woff2, no blocking CDN in prod if possible)
- Colors: high contrast, risk chips (أخضر / أصفر / أحمر)
- Inbox default filter: `awaiting_approval`
- One-click موافقة on the card; open ticket for edit
- Keyboard: not required in MVP
- Mini App: `expand()`, `MainButton` bound to Approve, `BackButton` to inbox
- All UI strings in `i18n.ts` Arabic first; English toggle for mixed staff

---

## 15. Security

1. **Secrets:** only env / Railway Variables. `.env` gitignored. Rotate `TELEGRAM_SECRET_TOKEN`, Meta `APP_SECRET`, JWT secret separately.
2. **Webhook auth:** Telegram `X-Telegram-Bot-Api-Secret-Token`; Meta `X-Hub-Signature-256`; Twilio request validator; Resend/SendGrid signing secret. Reject unsigned.
3. **Admin auth:** JWT 8h, HS256, `admin_id`+`role` claims. Telegram Login: verify `hash` per Telegram docs, clock skew 60s. Mini App: HMAC-SHA256 of `initData`. Role `viewer` cannot approve.
4. **Rate limits:** 60 req/min/IP on webhooks (burst 20); 10 inbound messages / 10 min / identity; 30 / min on `/api/*` per admin.
5. **Input validation:** pydantic on every payload. Text max 8000 chars. Filename sanitized. MIME allowlist: `image/jpeg|png|webp`, `application/pdf`, `text/plain`. No OLE/exe.
6. **Prompt injection:** customer text is untrusted. Tools cannot fetch arbitrary URLs. No shell tools exposed to specialists. Citations must be Qdrant IDs / SKUs, not model-invented URLs.
7. **PII:** do not log raw webhooks at INFO. Redact phone/email in worker logs. R2 private.
8. **Hermes network:** no public domain. Railway private networking only. No customer tokens in Hermes env.
9. **Headers:** CORS allow admin origin only. `X-Request-ID` on every response. TLS terminated by Railway.
10. **SQL:** SQLAlchemy parameters only. Analytics agent uses **named** queries, never `execute(model_sql)`.
11. **Idempotency & replay:** dedup keys; unique `provider_message_id`.
12. **CSRF:** Mini App + JWT Bearer (no cookies) in MVP → CSRF N/A. If cookie session added later, SameSite=Lax.

---

## 16. Configuration (`.env.example`)

```bash
APP_ENV=dev
TENANT_ID=default
LOG_LEVEL=INFO
PUBLIC_BASE_URL=https://app.example.com

DATABASE_URL=postgresql+asyncpg://user:pass@postgres:5432/hermesdesk
REDIS_URL=redis://redis:6379/0

S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET=hermesdesk
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=

QDRANT_URL=http://qdrant:6333
QDRANT_API_KEY=

OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_API_KEY=
LLM_MODEL=openai/gpt-4o
ROUTER_MODEL=openai/gpt-4o-mini
EMBEDDING_MODEL=text-embedding-3-small

HERMES_BASE_URL=http://hermes:8642/v1
HERMES_API_KEY=

TELEGRAM_CUSTOMER_BOT_TOKEN=
TELEGRAM_CUSTOMER_SECRET_TOKEN=
TELEGRAM_ADMIN_BOT_TOKEN=
TELEGRAM_ADMIN_SECRET_TOKEN=
TELEGRAM_ADMIN_USER_IDS=123,456

WHATSAPP_PROVIDER=meta
META_WABA_TOKEN=
META_WABA_PHONE_ID=
META_APP_SECRET=
META_VERIFY_TOKEN=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=

EMAIL_PROVIDER=resend
RESEND_API_KEY=
EMAIL_FROM=desk@example.com
EMAIL_INBOUND_SECRET=

JWT_SECRET=
APPROVAL_TIMEOUT_SEC=600
ACK_ON_INGEST=true
EMBED_TICKETS=false
```

---

## 17. docker-compose.yml (local)

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: hermes
      POSTGRES_PASSWORD: hermes
      POSTGRES_DB: hermesdesk
    ports: ["5432:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U hermes"]
      interval: 5s
      timeout: 3s
      retries: 10

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      retries: 10

  qdrant:
    image: qdrant/qdrant:v1.13.2
    ports: ["6333:6333"]
    volumes: [qdrant:/qdrant/storage]

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minio
      MINIO_ROOT_PASSWORD: minio-minio
    ports: ["9000:9000", "9001:9001"]
    volumes: [minio:/data]

  createbucket:
    image: minio/mc:latest
    depends_on: [minio]
    entrypoint: >
      /bin/sh -c "
      sleep 3;
      mc alias set local http://minio:9000 minio minio-minio;
      mc mb -p local/hermesdesk || true;
      "

  hermes:
    build: ./apps/hermes
    env_file: .env
    environment:
      OPENAI_BASE_URL: ${OPENAI_BASE_URL}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      LLM_MODEL: ${LLM_MODEL}
    # no public ports in prod; local only:
    ports: ["8642:8642"]
    depends_on: []

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    env_file: .env
    environment:
      DATABASE_URL: postgresql+asyncpg://hermes:hermes@postgres:5432/hermesdesk
      REDIS_URL: redis://redis:6379/0
      S3_ENDPOINT: http://minio:9000
      S3_ACCESS_KEY_ID: minio
      S3_SECRET_ACCESS_KEY: minio-minio
      S3_BUCKET: hermesdesk
      QDRANT_URL: http://qdrant:6333
      HERMES_BASE_URL: http://hermes:8642/v1
      PUBLIC_BASE_URL: http://localhost:8080
    ports: ["8080:8080"]
    depends_on:
      postgres: {condition: service_healthy}
      redis: {condition: service_healthy}

  worker:
    build:
      context: .
      dockerfile: apps/worker/Dockerfile
    env_file: .env
    environment:
      DATABASE_URL: postgresql+asyncpg://hermes:hermes@postgres:5432/hermesdesk
      REDIS_URL: redis://redis:6379/0
      S3_ENDPOINT: http://minio:9000
      S3_ACCESS_KEY_ID: minio
      S3_SECRET_ACCESS_KEY: minio-minio
      S3_BUCKET: hermesdesk
      QDRANT_URL: http://qdrant:6333
      HERMES_BASE_URL: http://hermes:8642/v1
    depends_on:
      postgres: {condition: service_healthy}
      redis: {condition: service_healthy}
      api: {condition: service_started}

volumes:
  pgdata:
  qdrant:
  minio:
```

Local MinIO stands in for R2. Production uses real R2/S3; do not run MinIO on Railway.

---

## 18. Dockerfiles (shape)

**`apps/api/Dockerfile`** (from repo root):

```
FROM node:22-alpine AS admin
WORKDIR /admin
COPY apps/admin/package.json apps/admin/package-lock.json ./
RUN npm ci
COPY apps/admin ./
RUN npm run build

FROM python:3.12-slim
WORKDIR /app
RUN pip install --no-cache-dir uv
COPY packages/core /app/packages/core
COPY apps/api /app/apps/api
RUN uv pip install --system /app/packages/core /app/apps/api
COPY --from=admin /admin/dist /app/apps/api/app/static
ENV PORT=8080
CMD ["sh", "-c", "alembic -c /app/apps/api/alembic.ini upgrade head && uvicorn app.main:app --app-dir /app/apps/api --host 0.0.0.0 --port ${PORT}"]
```

**`apps/worker/Dockerfile`:** same Python base, no Node, `CMD ["arq", "worker.main.WorkerSettings"]`.

**`apps/hermes/Dockerfile`:**

```
FROM nousresearch/hermes-agent:<PINNED_TAG>
COPY apps/hermes/skills /opt/data/skills/oil
COPY apps/hermes/entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
```

Pin the tag in the spec implementation PR; do not use `latest`.

---

## 19. Railway deployment steps

1. Create project `hermes-desk`, region **EU** (GDPR / closer to many ME routes via EU).
2. Add plugins: **PostgreSQL**, **Redis**.
3. Create **Qdrant** (Railway template or Qdrant Cloud EU). Copy URL + key.
4. Create **Cloudflare R2** bucket `hermesdesk-prod` in EU, API token with Object Read/Write. CORS: PUT/GET from `PUBLIC_BASE_URL`.
5. Services:
   - `hermes` — Dockerfile `apps/hermes/Dockerfile`, **no public domain**, private networking. Env: `OPENAI_*`, `LLM_MODEL`. Health: internal `/health` if image provides it.
   - `app` — Dockerfile `apps/api/Dockerfile`, public domain, `PORT` injected. Variables reference Postgres/Redis.
   - `worker` — Dockerfile `apps/worker/Dockerfile`, replica 1, no domain.
6. Set all secrets from §16. `HERMES_BASE_URL=http://hermes.railway.internal:8642/v1`.
7. `PUBLIC_BASE_URL=https://<app>.up.railway.app` (later custom domain).
8. Telegram: `setWebhook` to `https://<app>/webhooks/telegram` with `secret_token`. Admin bot: Mini App URL `https://<app>/admin`.
9. Meta: webhook `https://<app>/webhooks/whatsapp`, verify token, subscribe `messages`.
10. Resend/SendGrid inbound to `/webhooks/email`.
11. Run one-off: `railway run python scripts/create_admin.py` and `scripts/ingest_knowledge.py`.
12. Smoke: send Telegram message → ticket in `/admin` → approve → reply received.
13. **Do not** attach a Volume to `app` or `worker`. Hermes may use a small volume only if the upstream image refuses to boot without `HERMES_HOME`; treat it as disposable config, never business data.

`railway.toml` (app service):

```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "apps/api/Dockerfile"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "ON_FAILURE"
```

---

## 20. Testing plan

### Unit (`tests/unit`) — no IO

- Router classification fixtures (Arabic sales vs support vs knowledge)
- `ProposedResponse` rejects empty reply, oversize, unknown action types
- Arabic normalizer (strip tatweel, unify alef)
- Redis key builders
- Lead-score heuristic
- S3 path layout
- Signature helpers with canned Meta/Telegram headers

### Integration (`tests/integration`) — compose `postgres+redis+minio`

- Telegram webhook → row `tickets` + `hd:dedup:*` set + arq job in queue (arq burst worker in-process)
- Approval approve → `messages.role=assistant` + mocked channel send
- Double-approve → one send
- Timeout job with `APPROVAL_TIMEOUT_SEC=1` → `expired` + fallback send, **not** the draft
- Archive writes parquet+json to MinIO
- Invalid Hermes JSON → `needs_human`

### Contract

- Mock Hermes with a tiny FastAPI returning fixed JSON
- Mock OpenAI-compatible embeddings

### E2E (optional CI nightly)

- `test_happy_path.py` against compose stack with recorded PTB updates

### Manual acceptance (Arabic)

1. Telegram: «ما لزوجة SAE المناسبة لمحرك ديزل ثقيل في الصيف؟» → Knowledge proposal, citations, approve, RTL reply.
2. WhatsApp: «نحتاج عرض سعر 200 برميل توربين أويل» → Sales `draft_quote`, admin edits price text, approve, quote draft in DB (PDF optional MVP+).
3. Email: troubleshooting leak → Support ticket action, reject with reason, rerun once.
4. Mini App on phone: approve within 10 min.
5. Let one expire: customer gets apology template, not the draft.
6. Critical keyword «حريق في المستودع» → risk critical, instant admin page.

CI: GitHub Actions or local `make test`. Railway does not run tests on deploy in MVP; run CI on git push.

**Definition of done:** all unit+integration green; checklist 1–6 signed off by a native Arabic speaker.

---

## 21. Implementation order (developer schedule)

| Day | Deliverable |
|---|---|
| 1 | repo skeleton, compose, settings, health |
| 2 | Postgres models + Alembic + seed products |
| 3 | Redis keys, arq worker hello, ticket ingest without LLM |
| 4 | Telegram webhook + ACK + admin JWT login |
| 5 | Admin inbox dummy tickets, RTL shell |
| 6 | LLM client + Router + ProposedResponse |
| 7 | Hermes container + one skill (knowledge) + Qdrant ingest |
| 8 | HITL approve/reject/edit + send on Telegram |
| 9 | Timeout job + fallback |
| 10 | WhatsApp adapter (chosen provider) |
| 11 | Email inbound/outbound |
| 12 | Remaining 4 skills + tools (catalog, quotes, tickets, metrics) |
| 13 | Mini App initData + MainButton |
| 14 | Archive parquet + audit_events + rate limits |
| 15 | Tests + Railway deploy + webhook registration |

Do not start WhatsApp before Telegram HITL works end-to-end.

---

## 22. Risks (MVP)

| Risk | Mitigation |
|---|---|
| Hermes image API differs from OpenAI | Adapter in `hermes_client.py`; fallback: worker talks to `OPENAI_BASE_URL` with the same prompts/tools (still called “Hermes skills”) |
| No Arabic stemmer in Postgres | `simple` FTS + trigram; RAG is the real search |
| Admin bottleneck | MVP accepts this; only ACK is automatic |
| Meta 24h window | template `ticket_received` + only reply inside session |
| Hallucinated prices | prices only from `prices` table; prompt forbids invention |
| Railway egress vs R2 | worker uploads from Railway (counts as service egress); keep payloads small; attachments streamed |

---

## 23. What “done” looks like

A sales engineer at an oil-products company in the Gulf sends WhatsApp in Arabic asking for a turbine-oil quote. Within seconds he gets a ticket id. An admin in Riyadh opens the Mini App, sees the original message, the proposed reply, and a draft quote from the list price. He taps **موافقة**. The customer receives the Arabic reply. The transcript lands in R2 as JSON+Parquet. Nothing was sent before that tap. Swapping DeepSeek for GPT-4o is an env change.

That is the entire MVP.

"""Web smoke tests (needs flask — CI installs requirements.txt).

Skipped automatically where flask isn't installed (e.g. minimal sandboxes).
"""
import os
import sys
import tempfile

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

_tmp = tempfile.mkdtemp()
os.environ["DB_PATH"] = os.path.join(_tmp, "web.db")
os.environ["WEB_PASSWORD"] = "t3st-pass"
os.environ["WEB_SECRET"] = "t3st-secret"
os.environ.setdefault("TELEGRAM_BOT_TOKEN", "")

from data import store

store.init_db()

try:
    from front import web

    HAS_WEB = True
except ImportError:
    web = None  # type: ignore[assignment]
    HAS_WEB = False

pytestmark = pytest.mark.skipif(not HAS_WEB, reason="flask not installed")


def _client():
    web.app.config["TESTING"] = True
    return web.app.test_client()


def test_healthz():
    assert _client().get("/healthz").status_code == 200


def test_public_pages():
    c = _client()
    for p in ["/", "/catalog", "/quote", "/support", "/track", "/hokm"]:
        r = c.get(p)
        assert r.status_code == 200, p


def test_lang_switch():
    c = _client()
    fa = c.get("/").get_data(as_text=True)
    assert "کاتالوگ" in fa and 'lang="fa"' in fa
    en = c.get("/?lang=en").get_data(as_text=True)
    assert "Catalog" in en and 'lang="en"' in en


def test_admin_gated():
    c = _client()
    for p in ["/admin", "/admin/orders", "/admin/tickets", "/admin/catalog",
              "/admin/settings", "/admin/users"]:
        r = c.get(p, follow_redirects=False)
        assert r.status_code == 302 and "/admin/login" in r.headers["Location"], p


def test_login_flow():
    c = _client()
    bad = c.post("/admin/login", data={"password": "nope"}).get_data(as_text=True)
    assert "اشتباه" in bad
    r = c.post("/admin/login", data={"password": "t3st-pass"}, follow_redirects=False)
    assert r.status_code == 302
    assert c.get("/admin").status_code == 200
    assert c.get("/admin/settings").status_code == 200
    assert c.get("/admin/catalog").status_code == 200


def test_order_track_approve():
    c = _client()
    body = c.post("/order/SVC1", data={"qty": "2", "contact": "test-user"}).get_data(as_text=True)
    assert "ORD-" in body
    ref = "ORD-" + body.split("ORD-")[1][:4]
    assert c.get(f"/track?ref={ref}").status_code == 200
    c.post("/admin/login", data={"password": "t3st-pass"})
    r = c.post(f"/admin/orders/{ref}/approve", follow_redirects=True)
    assert r.status_code == 200
    assert store.get_order(ref)["status"] == "approved"


def test_ticket_flow():
    c = _client()
    body = c.post("/support",
                  data={"sev": "normal", "text": "web test ticket", "contact": ""}).get_data(as_text=True)
    assert "TKT-" in body
    ref = "TKT-" + body.split("TKT-")[1][:4]
    c.post("/admin/login", data={"password": "t3st-pass"})
    c.post(f"/admin/tickets/{ref}/reply", data={"text": "manager reply"})
    assert len(store.thread(ref)) == 2


def test_hokm_api():
    c = _client()
    r = c.get("/hokm/api/state")
    assert r.status_code == 200
    data = r.get_json()
    assert data["ok"] and "state" in data
    st = data["state"]
    assert st["phase"] in ("declare", "play", "round_over", "match_over")
    assert "hand" in st and "chat" in st
    r2 = c.post("/hokm/api/act", json={"action": "chat", "text": "hello table"})
    assert r2.status_code == 200 and r2.get_json()["ok"]
    assert len(r2.get_json()["state"]["chat"]) >= 2
    r3 = c.post("/hokm/api/act", json={"action": "new"})
    assert r3.status_code == 200 and r3.get_json()["ok"]


def test_hokm_js_regex_escaped():
    html = _client().get("/hokm").data.decode("utf-8")
    # The result-render regex must reach the browser as backslash-n (two
    # chars). A raw newline here is a Python-escaping bug that kills the
    # whole <script> block with "Invalid regular expression: missing /".
    assert "replace(/\\n/g" in html
    assert "replace(/" + chr(10) not in html

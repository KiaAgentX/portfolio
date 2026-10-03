import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib import request as urlreq
from urllib.error import HTTPError

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
CHAT_URL = "https://openrouter.ai/api/v1/chat/completions"
DECISIONS_URL = "https://openrouter.ai/api/alpha/decisions"
DEFAULT_CHAT_MODEL = "openrouter/free"
DEFAULT_JEV_MODEL = "typesafe/jev-1.13"
PORT = 8000

DEFAULT_QUESTIONS = {
    "is_urgent": {"type": "noul", "instructions": "Does this message express urgency or time-sensitivity?"},
    "department": {
        "type": "choice",
        "instructions": "Which team should handle this issue?",
        "criteria": {
            "billing": "Payments, invoicing, refunds, payouts",
            "technical": "Bugs, outages, integrations, system failures",
            "sales": "Pricing, upgrades, new accounts",
            "support": "General customer support questions"
        }
    },
    "severity_level": {
        "type": "score",
        "instructions": "How frustrated does the customer sound?",
        "criteria": ["Calm or neutral", "Mildly annoyed", "Clearly frustrated", "Very angry or aggressive"]
    }
}

def call_openrouter(url, payload):
    data = json.dumps(payload).encode()
    req = urlreq.Request(url, data=data, headers={
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000",
        "X-OpenRouter-Title": "Jev Chat App",
    })
    try:
        with urlreq.urlopen(req, timeout=120) as r:
            return r.status, json.loads(r.read().decode())
    except HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode())
        except Exception:
            return e.code, {"error": str(e)}
    except Exception as e:
        # DNS/timeout/connection failures: JSON 502 instead of a dead socket.
        return 502, {"error": f"Upstream unreachable: {e}"}

class Handler(BaseHTTPRequestHandler):
    def send_json(self, obj, status=200):
        body = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def serve_file(self, path, ctype):
        try:
            with open(path, "rb") as f:
                body = f.read()
            self.send_response(200)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except FileNotFoundError:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        if self.path in ("/", "/index.html"):
            self.serve_file("index.html", "text/html; charset=utf-8")
        elif self.path == "/app.js":
            self.serve_file("app.js", "application/javascript; charset=utf-8")
        elif self.path == "/style.css":
            self.serve_file("style.css", "text/css; charset=utf-8")
        elif self.path == "/api/health":
            self.send_json({"ok": True})
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        try:
            body = json.loads(self.rfile.read(length).decode() or "{}")
        except Exception:
            return self.send_json({"error": "Invalid JSON"}, 400)
        if self.path == "/api/chat":
            message = body.get("message", "")
            history = body.get("history", [])
            model = body.get("model") or DEFAULT_CHAT_MODEL
            if not message:
                return self.send_json({"error": "message is required"}, 400)
            messages = history + [{"role": "user", "content": message}]
            status, result = call_openrouter(CHAT_URL, {"model": model, "messages": messages})
            return self.send_json(result, status)
        if self.path == "/api/decisions":
            state = body.get("state", "")
            questions = body.get("questions") or DEFAULT_QUESTIONS
            model = body.get("model") or DEFAULT_JEV_MODEL
            if not state:
                return self.send_json({"error": "state is required"}, 400)
            status, result = call_openrouter(DECISIONS_URL, {"model": model, "state": state, "questions": questions})
            return self.send_json(result, status)
        return self.send_json({"error": "Not found"}, 404)

if __name__ == "__main__":
    print(f"Server: http://localhost:{PORT}")
    HTTPServer(("127.0.0.1", PORT), Handler).serve_forever()

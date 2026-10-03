#!/usr/bin/env python3
"""NEXUS local server + same-origin API proxy (byte-streaming).

Browsers (especially Firefox) preflight POST /chat/completions with
Authorization. The upstream returns 401 OPTIONS without CORS headers, which
surfaces as: NetworkError when attempting to fetch resource.

This server serves the vault UI and proxies /v1/* to the upstream so the
browser talks same-origin and never hits CORS. Upstream bytes are forwarded
in chunks so STREAM / SSE actually streams instead of buffering the body.
"""
from __future__ import annotations

import http.client
import json
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

ROOT = os.path.dirname(os.path.abspath(__file__))
UPSTREAM = os.environ.get("NEXUS_UPSTREAM", "https://9router-production-6ade.up.railway.app")
PORT = int(os.environ.get("PORT", "8787"))
HOST = os.environ.get("HOST", "0.0.0.0")
UP = urlparse(UPSTREAM)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, fmt, *args):
        sys.stderr.write("[nexus] " + (fmt % args) + "\n")

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type, Accept")
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Accel-Buffering", "no")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if self.path.startswith("/v1/") or self.path == "/v1":
            return self._proxy()
        return super().do_GET()

    def do_POST(self):
        if self.path.startswith("/v1/") or self.path == "/v1":
            return self._proxy()
        self.send_error(404)

    def _fail(self, code, message):
        data = json.dumps({"error": {"message": message}}).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self._cors()
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _proxy(self):
        length = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(length) if length else None
        headers = {}
        for key in ("Authorization", "Content-Type", "Accept"):
            val = self.headers.get(key)
            if val:
                headers[key] = val
        if "Accept" not in headers:
            headers["Accept"] = "application/json, text/event-stream"
        path = (UP.path or "").rstrip("/") + self.path
        host = UP.hostname
        port = UP.port or (443 if UP.scheme == "https" else 80)
        conn_cls = http.client.HTTPSConnection if UP.scheme == "https" else http.client.HTTPConnection
        conn = conn_cls(host, port, timeout=120)
        sent = False
        try:
            conn.request(self.command, path, body=body, headers=headers)
            resp = conn.getresponse()
            self.send_response(resp.status)
            ctype = resp.getheader("Content-Type") or "application/json"
            self.send_header("Content-Type", ctype)
            self._cors()
            self.end_headers()
            sent = True
            while True:
                chunk = resp.read(8192)
                if not chunk:
                    break
                self.wfile.write(chunk)
                try:
                    self.wfile.flush()
                except BrokenPipeError:
                    break
        except Exception as err:
            if not sent:
                self._fail(502, "Upstream unreachable: " + str(err))
        finally:
            try:
                conn.close()
            except Exception:
                pass


if __name__ == "__main__":
    os.chdir(ROOT)
    httpd = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"NEXUS by DropAgentX  →  http://127.0.0.1:{PORT}/", flush=True)
    print(f"proxy {UPSTREAM}/v1  →  http://127.0.0.1:{PORT}/v1", flush=True)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nbye")

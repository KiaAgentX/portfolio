#!/usr/bin/env python3
"""NEXUS local server + same-origin API proxy.

Browsers (especially Firefox) preflight POST /chat/completions with
Authorization. The upstream returns 401 OPTIONS without CORS headers, which
surfaces as: NetworkError when attempting to fetch resource.

This server serves the vault UI and proxies /v1/* to the upstream so the
browser talks same-origin and never hits CORS.
"""
from __future__ import annotations

import json
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = os.path.dirname(os.path.abspath(__file__))
UPSTREAM = os.environ.get("NEXUS_UPSTREAM", "https://9router-production-6ade.up.railway.app")
PORT = int(os.environ.get("PORT", "8787"))
HOST = os.environ.get("HOST", "0.0.0.0")


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

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if self.path.startswith("/v1/"):
            return self._proxy()
        return super().do_GET()

    def do_POST(self):
        if self.path.startswith("/v1/"):
            return self._proxy()
        self.send_error(404)

    def _proxy(self):
        length = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(length) if length else None
        url = UPSTREAM + self.path
        headers = {}
        for key in ("Authorization", "Content-Type", "Accept"):
            val = self.headers.get(key)
            if val:
                headers[key] = val
        req = Request(url, data=body, headers=headers, method=self.command)
        try:
            with urlopen(req, timeout=120) as resp:
                data = resp.read()
                self.send_response(resp.status)
                ctype = resp.headers.get("Content-Type", "application/json")
                self.send_header("Content-Type", ctype)
                self._cors()
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
        except HTTPError as err:
            data = err.read() or json.dumps({"error": {"message": str(err)}}).encode()
            self.send_response(err.code)
            self.send_header("Content-Type", err.headers.get("Content-Type", "application/json"))
            self._cors()
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        except URLError as err:
            data = json.dumps({"error": {"message": "Upstream unreachable: " + str(err.reason)}}).encode()
            self.send_response(502)
            self.send_header("Content-Type", "application/json")
            self._cors()
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)


if __name__ == "__main__":
    os.chdir(ROOT)
    httpd = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"NEXUS by DropAgentX  →  http://127.0.0.1:{PORT}/", flush=True)
    print(f"proxy {UPSTREAM}/v1  →  http://127.0.0.1:{PORT}/v1", flush=True)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nbye")

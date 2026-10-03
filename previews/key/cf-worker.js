// Optional Cloudflare Worker if you cannot change 9router OPTIONS.
// Deploy at https://dash.cloudflare.com → Workers → paste this.
// Then set CFG.endpoint in index.html to: https://YOUR-WORKER.workers.dev/v1

const UPSTREAM = "https://9router-production-6ade.up.railway.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept",
  "Access-Control-Max-Age": "86400"
};

export default {
  async fetch(req) {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    const inUrl = new URL(req.url);
    const out = UPSTREAM + inUrl.pathname + inUrl.search;
    const headers = new Headers();
    const auth = req.headers.get("Authorization");
    const ctype = req.headers.get("Content-Type");
    if (auth) headers.set("Authorization", auth);
    if (ctype) headers.set("Content-Type", ctype);
    const init = { method: req.method, headers };
    if (req.method !== "GET" && req.method !== "HEAD") init.body = await req.arrayBuffer();
    const resp = await fetch(out, init);
    const outHeaders = new Headers(resp.headers);
    Object.entries(corsHeaders).forEach(([k, v]) => outHeaders.set(k, v));
    return new Response(resp.body, { status: resp.status, headers: outHeaders });
  }
};

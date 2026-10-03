import type { Auth, Ticket, TicketDetail } from "./types";

const TOKEN_KEY = "hd_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(t: string | null) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

function headers(): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const t = getToken();
  if (t) h.Authorization = `Bearer ${t}`;
  const tg = window.Telegram?.WebApp?.initData;
  if (tg) h["X-Telegram-Init-Data"] = tg;
  return h;
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(path, { ...init, headers: { ...headers(), ...(init?.headers || {}) } });
  if (r.status === 401) {
    setToken(null);
    throw new Error("unauthorized");
  }
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export const api = {
  login: (email: string, password: string) =>
    req<Auth>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  me: () => req("/api/auth/me"),
  tickets: (status = "awaiting_approval") => req<Ticket[]>(`/api/tickets?status=${status}`),
  ticket: (id: string) => req<TicketDetail>(`/api/tickets/${id}`),
  approve: (id: string, body: object) =>
    req(`/api/approvals/${id}/approve`, { method: "POST", body: JSON.stringify(body) }),
  reject: (id: string, body: object) =>
    req(`/api/approvals/${id}/reject`, { method: "POST", body: JSON.stringify(body) }),
  metrics: () => req("/api/metrics"),
};

declare global {
  interface Window {
    Telegram?: { WebApp?: { initData?: string; expand?: () => void; MainButton?: any; BackButton?: any } };
  }
}

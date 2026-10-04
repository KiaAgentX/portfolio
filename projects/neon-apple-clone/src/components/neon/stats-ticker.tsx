"use client";

import { useEffect, useState } from "react";
import { Eye, Users, ShoppingBag, Mail, Package, Activity } from "lucide-react";
import type { SiteStats } from "@/lib/types";

const DEFAULT_STATS: SiteStats = {
  visits: 0,
  newsletterSends: 0,
  bagAdditions: 0,
  subscribers: 0,
  products: 0,
};

const ITEMS = [
  { key: "visits" as const, label: "Total visits", icon: Eye, color: "#00ffd5" },
  { key: "products" as const, label: "Products live", icon: Package, color: "#ffb03a" },
  { key: "bagAdditions" as const, label: "Added to bag", icon: ShoppingBag, color: "#ff2ec4" },
  { key: "subscribers" as const, label: "Newsletter members", icon: Users, color: "#b026ff" },
];

export function StatsTicker() {
  const [stats, setStats] = useState<SiteStats>(DEFAULT_STATS);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        if (!cancelled && data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error("stats fetch error:", error);
      }
    };

    load();
    const interval = setInterval(load, 20000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <section
      className="border-y border-white/5 bg-black/40 py-5"
      aria-label="Live store statistics"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 sm:px-6 lg:grid-cols-4">
        {ITEMS.map(({ key, label, icon: Icon, color }) => (
          <div
            key={key}
            className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 transition-all duration-300 hover:border-white/15"
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
              style={{
                color,
                borderColor: `${color}44`,
                background: `${color}0d`,
                boxShadow: `0 0 14px ${color}30`,
              }}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p
                className="text-lg font-bold tabular-nums"
                style={{ color, textShadow: `0 0 12px ${color}55` }}
              >
                {stats[key].toLocaleString()}
              </p>
              <p className="truncate text-[11px] text-white/40">{label}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-white/25">
        <Activity className="h-3 w-3 animate-pulse text-[color:var(--neon-green)]" />
        Live from the database
      </p>
    </section>
  );
}

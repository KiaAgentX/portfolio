"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export function AnnouncementBar() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative z-40 flex h-9 items-center overflow-hidden border-b border-white/5 bg-gradient-to-r from-[#0b0f1a] via-[#150b1e] to-[#0b0f1a]"
      role="banner"
    >
      <div className="flex whitespace-nowrap">
        <div className="animate-marquee flex shrink-0 items-center">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className="flex items-center"
              aria-hidden={copy === 1}
            >
              {[
                "iPhone 18 Pro pre-order starts 10.16",
                "Free delivery on everything",
                "MacBook Neo — light. years ahead.",
                "Trade in. Glow up. Get credit toward your next device.",
                "Apple Watch Series 12 — every heartbeat, illuminated.",
              ].map((text) => (
                <span
                  key={`${copy}-${text}`}
                  className="mx-8 inline-flex items-center gap-2 text-[11px] font-medium tracking-wide text-white/60"
                >
                  <Zap className="h-3 w-3 text-[color:var(--neon-cyan)]" />
                  {text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

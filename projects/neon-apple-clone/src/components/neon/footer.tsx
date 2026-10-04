"use client";

import { AppleLogo } from "./apple-logo";

const FOOTER_COLUMNS: { title: string; links: string[] }[] = [
  {
    title: "Shop and Learn",
    links: ["Store", "Mac", "iPad", "iPhone", "Watch", "Vision", "AirPods", "TV & Home", "Accessories"],
  },
  {
    title: "Services",
    links: ["Apple Music", "Apple TV+", "Apple Arcade", "iCloud+", "Apple One", "Apple Pay", "Apple Books", "App Store"],
  },
  {
    title: "Apple Store",
    links: ["Find a Store", "Genius Bar", "Today at Apple", "Apple Trade In", "Order Status", "Financing", "Personal Setup"],
  },
  {
    title: "For Business",
    links: ["Apple and Business", "Shop for Business", "Education", "Healthcare", "Government"],
  },
  {
    title: "About Apple",
    links: ["Newsroom", "Leadership", "Career Opportunities", "Investors", "Ethics & Compliance", "Privacy"],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-black/60" role="contentinfo">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Link columns */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="mb-3 text-xs font-semibold text-white/85">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="text-[11px] text-white/45 transition-colors duration-200 hover:text-[color:var(--neon-cyan)] hover:drop-shadow-[0_0_6px_rgba(0,255,213,0.7)]"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Divider */}
        <div className="neon-divider my-8 opacity-50" />

        {/* Bottom row */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <AppleLogo />
            <p className="text-[11px] text-white/40">
              Copyright © 2025 Neon Apple Inc. All rights reserved.
            </p>
          </div>
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {["Privacy Policy", "Terms of Use", "Sales Policy", "Legal", "Site Map"].map(
              (item) => (
                <li key={item}>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-[11px] text-white/45 transition-colors hover:text-white"
                  >
                    {item}
                  </a>
                </li>
              )
            )}
          </ul>
          <p className="text-[11px] text-white/40">United States</p>
        </div>
      </div>
    </footer>
  );
}

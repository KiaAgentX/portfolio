"use client";

import { motion } from "framer-motion";
import { Truck, RefreshCcw, UserCheck, CreditCard, ArrowUpRight } from "lucide-react";

const PERKS = [
  {
    icon: Truck,
    color: "#00ffd5",
    title: "Free delivery",
    body: "Free next-day delivery on thousands of items, straight to your door — glowing fast.",
    cta: "Learn more",
  },
  {
    icon: RefreshCcw,
    color: "#ff2ec4",
    title: "Trade In",
    body: "Trade in your eligible device for credit toward your next one, or recycle it for free.",
    cta: "See your value",
  },
  {
    icon: UserCheck,
    color: "#b026ff",
    title: "Personal Setup",
    body: "Get one-on-one guidance online or in-store — transfer data, tune settings, glow on.",
    cta: "Book a session",
  },
  {
    icon: CreditCard,
    color: "#ffb03a",
    title: "Financing",
    body: "Pay monthly at 0% APR for up to 24 months with Apple Card Monthly Installments.",
    cta: "See plans",
  },
];

export function StorePerks() {
  return (
    <section className="relative py-20 sm:py-24" aria-label="Apple Store benefits">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            The Apple Store <span className="gradient-text">difference.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="mt-3 text-white/50"
          >
            The best way to buy the products you love — in full neon.
          </motion.p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map((perk, i) => {
            const Icon = perk.icon;
            return (
              <motion.article
                key={perk.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="neon-card group flex flex-col rounded-3xl p-6"
                style={{ "--card-accent": perk.color } as React.CSSProperties}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover:scale-110"
                  style={{
                    color: perk.color,
                    borderColor: `${perk.color}44`,
                    background: `${perk.color}0d`,
                    boxShadow: `0 0 18px ${perk.color}35`,
                  }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{perk.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-white/50">
                  {perk.body}
                </p>
                <button className="mt-4 inline-flex items-center gap-1 self-start text-xs font-semibold text-white/70 transition-colors hover:text-white">
                  <span className="border-b pb-0.5 transition-colors" style={{ borderColor: `${perk.color}66` }}>
                    {perk.cta}
                  </span>
                  <ArrowUpRight
                    className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    style={{ color: perk.color }}
                  />
                </button>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { Music, Tv, Gamepad2, Cloud, Dumbbell, Newspaper, ArrowUpRight } from "lucide-react";

const SERVICES = [
  {
    icon: Music,
    name: "Apple Music",
    desc: "110M+ songs in Spatial Audio",
    color: "#ff2ec4",
    span: "lg:col-span-2",
    tall: false,
  },
  {
    icon: Tv,
    name: "Apple TV+",
    desc: "Original stories, 4K Dolby Vision",
    color: "#0a84ff",
    span: "",
    tall: false,
  },
  {
    icon: Gamepad2,
    name: "Apple Arcade",
    desc: "200+ games, zero ads",
    color: "#39ff14",
    span: "",
    tall: false,
  },
  {
    icon: Cloud,
    name: "iCloud+",
    desc: "2TB of glowing storage",
    color: "#00e5ff",
    span: "",
    tall: false,
  },
  {
    icon: Dumbbell,
    name: "Apple Fitness+",
    desc: "Trainers, workouts, neon metrics",
    color: "#ffb03a",
    span: "",
    tall: false,
  },
  {
    icon: Newspaper,
    name: "Apple News+",
    desc: "Magazines and news, ad-free",
    color: "#b026ff",
    span: "lg:col-span-2",
    tall: false,
  },
];

export function Entertainment() {
  return (
    <section
      className="relative border-y border-white/5 bg-black/30 py-20 sm:py-24"
      aria-label="Apple entertainment services"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Entertainment, <span className="gradient-text">amplified.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="mt-3 text-white/50"
          >
            Six services. One bundle. All yours with Apple One.
          </motion.p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((svc, i) => {
            const Icon = svc.icon;
            return (
              <motion.button
                key={svc.name}
                type="button"
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className={`neon-card group relative flex min-h-40 flex-col items-start justify-between overflow-hidden rounded-3xl p-5 text-left ${svc.span}`}
                style={{ "--card-accent": svc.color } as React.CSSProperties}
                aria-label={`Explore ${svc.name}`}
              >
                {/* glow orb */}
                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-45"
                  style={{ background: svc.color }}
                  aria-hidden="true"
                />
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-110"
                  style={{
                    color: svc.color,
                    borderColor: `${svc.color}44`,
                    background: `${svc.color}0d`,
                    boxShadow: `0 0 16px ${svc.color}35`,
                  }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4">
                  <p className="flex items-center gap-1.5 text-base font-semibold text-white">
                    {svc.name}
                    <ArrowUpRight
                      className="h-4 w-4 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                      style={{ color: svc.color }}
                    />
                  </p>
                  <p className="mt-0.5 text-xs text-white/45">{svc.desc}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Apple One bundle strip */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="neon-card mt-6 flex flex-col items-center justify-between gap-4 rounded-3xl px-6 py-6 text-center sm:flex-row sm:text-left"
          style={{ "--card-accent": "#ff2ec4" } as React.CSSProperties}
        >
          <div>
            <h3 className="text-xl font-bold text-white">
              Apple One <span className="gradient-text-static">bundle</span>
            </h3>
            <p className="mt-1 text-sm text-white/50">
              All six services in one easy subscription. Free for one month.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-2xl font-bold text-white">
              <span className="text-sm font-medium text-white/40">from </span>
              <span
                className="text-[color:var(--neon-magenta)]"
                style={{ textShadow: "0 0 16px rgba(255,46,196,0.6)" }}
              >
                $19.95
              </span>
              <span className="text-sm font-medium text-white/40">/mo</span>
            </p>
            <button className="neon-btn-primary rounded-full px-5 py-2.5 text-xs font-bold">
              Try it free
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

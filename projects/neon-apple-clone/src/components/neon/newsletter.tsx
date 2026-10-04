"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setMessage(data.message ?? "You're in.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <section className="relative py-20 sm:py-24" aria-label="Newsletter signup">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
          className="scanlines neon-card relative overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-12"
          style={{ "--card-accent": "#ff2ec4" } as React.CSSProperties}
        >
          {/* glow */}
          <div
            className="animate-aurora pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full opacity-20 blur-[90px]"
            style={{ background: "#ff2ec4" }}
            aria-hidden="true"
          />

          <div className="relative">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[color:var(--neon-magenta)]/40 bg-[color:var(--neon-magenta)]/10 shadow-[0_0_24px_rgba(255,46,196,0.35)]">
              <Mail className="h-6 w-6 text-[color:var(--neon-magenta)]" />
            </div>

            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Stay in the <span className="gradient-text">glow.</span>
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/50">
              Get the latest on iPhone 18 Pro, Apple Vision Pro and more.
              Be the first to know when something luminous lands.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row"
              noValidate
            >
              <div className="flex-1">
                <Label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </Label>
                <Input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  aria-invalid={status === "error"}
                  className="h-11 rounded-full border-white/15 bg-white/5 px-5 text-sm text-white placeholder:text-white/35 focus-visible:ring-[color:var(--neon-magenta)]"
                />
              </div>
              <Button
                type="submit"
                disabled={status === "loading"}
                className="neon-btn-primary h-11 shrink-0 rounded-full border-0 px-6 text-sm font-semibold disabled:opacity-60"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Sign up
                  </>
                )}
              </Button>
            </form>

            {/* Feedback message */}
            {status === "success" && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-[color:var(--neon-cyan)]"
                role="status"
              >
                <CheckCircle2 className="h-4 w-4" />
                {message}
              </motion.p>
            )}
            {status === "error" && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-sm text-[color:var(--destructive)]"
                role="alert"
              >
                {message}
              </motion.p>
            )}

            <p className="mt-5 text-[11px] leading-relaxed text-white/30">
              By subscribing you agree to receive neon-lit news from Apple.
              Unsubscribe anytime.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

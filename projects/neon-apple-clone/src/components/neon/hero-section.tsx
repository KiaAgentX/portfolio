"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBagStore } from "@/store/bag-store";
import { useProductDialogStore } from "@/store/product-dialog-store";
import { formatPrice, type Product } from "@/lib/types";

interface HeroSectionProps {
  product: Product;
  index: number;
}

export function HeroSection({ product, index }: HeroSectionProps) {
  const addItem = useBagStore((s) => s.addItem);
  const openProduct = useProductDialogStore((s) => s.openProduct);
  const accent = product.accentColor;

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="scanlines relative overflow-hidden border-b border-white/5"
      aria-label={`${product.name} hero`}
    >
      {/* Aurora glows */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div
          className="animate-aurora absolute -top-1/4 left-1/4 h-[480px] w-[480px] rounded-full opacity-25 blur-[120px]"
          style={{ background: accent }}
        />
        <div
          className="animate-aurora absolute -bottom-1/4 right-1/4 h-[380px] w-[380px] rounded-full opacity-15 blur-[100px]"
          style={{
            background: index % 2 === 0 ? "#00ffd5" : "#b026ff",
            animationDelay: "-8s",
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-[560px] max-w-5xl flex-col items-center px-4 pb-16 pt-16 text-center sm:min-h-[620px] sm:px-6 md:pt-20">
        {/* Badge */}
        {product.badge && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="mb-4 rounded-full px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{
              color: accent,
              border: `1px solid ${accent}55`,
              background: `${accent}0d`,
              boxShadow: `0 0 18px ${accent}40`,
            }}
          >
            {product.badge}
          </motion.span>
        )}

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="animate-neon-pulse text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
          style={{ textShadow: `0 0 40px ${accent}55` }}
        >
          {product.name}
        </motion.h2>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="gradient-text-static mt-3 text-xl font-medium sm:text-2xl"
        >
          {product.tagline}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-2 text-sm text-white/50"
        >
          From {formatPrice(product.price)}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="mt-5 flex flex-wrap items-center justify-center gap-4"
        >
          <button
            onClick={() => openProduct(product)}
            className="group inline-flex items-center gap-1 text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            <span className="border-b border-white/30 pb-0.5 transition-colors group-hover:border-[color:var(--neon-cyan)] group-hover:text-[color:var(--neon-cyan)]">
              Learn more
            </span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:text-[color:var(--neon-cyan)]" />
          </button>
          <Button
            onClick={() => addItem(product.id)}
            className="neon-btn-ghost h-9 rounded-full px-6 text-sm font-semibold"
            aria-label={`Buy ${product.name}`}
          >
            Buy
          </Button>
        </motion.div>

        {/* Hero image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ delay: 0.35, duration: 0.8, ease: "easeOut" }}
          className="relative mt-10 w-full max-w-3xl"
        >
          <div
            className="animate-float-y relative aspect-[16/9] w-full overflow-hidden rounded-3xl border"
            style={{
              borderColor: `${accent}33`,
              boxShadow: `0 0 60px ${accent}26, inset 0 0 40px ${accent}0d`,
            }}
          >
            <Image
              src={product.image}
              alt={`${product.name} — ${product.tagline}`}
              fill
              priority={index === 0}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

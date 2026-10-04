"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBagStore } from "@/store/bag-store";
import { useProductDialogStore } from "@/store/product-dialog-store";
import { formatPrice, type Product } from "@/lib/types";

interface ProductGridProps {
  products: Product[];
  loading: boolean;
}

export function ProductGrid({ products, loading }: ProductGridProps) {
  const [active, setActive] = useState("All");
  const addItem = useBagStore((s) => s.addItem);
  const openProduct = useProductDialogStore((s) => s.openProduct);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ["All", ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(
    () => (active === "All" ? products : products.filter((p) => p.category === active)),
    [products, active]
  );

  return (
    <section id="latest" className="relative scroll-mt-16 py-20 sm:py-24" aria-label="The latest">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Heading */}
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl"
          >
            The latest.{" "}
            <span className="gradient-text">Take a look.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-3 text-white/50"
          >
            What&apos;s new, what&apos;s glowing, what&apos;s next.
          </motion.p>
        </div>

        {/* Category filter */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-2"
          role="tablist"
          aria-label="Filter products by category"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={active === cat}
              onClick={() => setActive(cat)}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-300 sm:text-sm ${
                active === cat
                  ? "border-[color:var(--neon-cyan)]/70 bg-[color:var(--neon-cyan)]/10 text-[color:var(--neon-cyan)] shadow-[0_0_16px_rgba(0,255,213,0.35)]"
                  : "border-white/10 text-white/60 hover:border-white/30 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-[380px] rounded-3xl border border-white/5 bg-white/5"
                />
              ))
            : filtered.map((product, i) => (
                <motion.article
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                  className="neon-card group flex flex-col overflow-hidden rounded-3xl"
                  style={{ "--card-accent": product.accentColor } as React.CSSProperties}
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <button
                      onClick={() => openProduct(product)}
                      className="absolute inset-0 z-10"
                      aria-label={`View ${product.name} details`}
                    />
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-transparent" />
                    {product.badge && (
                      <span
                        className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md"
                        style={{
                          color: product.accentColor,
                          border: `1px solid ${product.accentColor}66`,
                          background: `${product.accentColor}14`,
                        }}
                      >
                        {product.badge}
                      </span>
                    )}
                    <span className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[10px] font-medium text-white/70 backdrop-blur-md">
                      {product.category}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-[color:var(--neon-cyan)]">
                      {product.name}
                    </h3>
                    <p className="gradient-text-static mt-0.5 text-sm font-medium">
                      {product.tagline}
                    </p>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/50">
                      {product.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-white/40">
                          From
                        </p>
                        <p
                          className="text-base font-bold"
                          style={{
                            color: product.accentColor,
                            textShadow: `0 0 14px ${product.accentColor}55`,
                          }}
                        >
                          {formatPrice(product.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openProduct(product)}
                          className="group/link inline-flex items-center text-xs font-medium text-white/70 transition-colors hover:text-white"
                        >
                          <span className="border-b border-white/25 pb-0.5 transition-colors group-hover/link:border-[color:var(--neon-cyan)] group-hover/link:text-[color:var(--neon-cyan)]">
                            Learn more
                          </span>
                          <ChevronRight className="ml-0.5 h-3 w-3" />
                        </button>
                        <Button
                          onClick={() => addItem(product.id)}
                          size="sm"
                          aria-label={`Add ${product.name} to bag`}
                          className="neon-btn-primary h-8 w-8 rounded-full border-0 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
        </div>

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="py-16 text-center text-white/40">
            No products in this category yet.
          </div>
        )}
      </div>
    </section>
  );
}

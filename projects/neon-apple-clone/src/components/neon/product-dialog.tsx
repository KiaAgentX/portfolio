"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Minus, Plus, ShoppingBag, Sparkles, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useBagStore } from "@/store/bag-store";
import { useProductDialogStore } from "@/store/product-dialog-store";
import { formatPrice, type Product } from "@/lib/types";

export function ProductDialog() {
  const product = useProductDialogStore((s) => s.product);
  const open = useProductDialogStore((s) => s.open);
  const close = useProductDialogStore((s) => s.close);
  const onOpenChange = (o: boolean) => (o ? null : close());
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useBagStore((s) => s.addItem);
  const fetchBag = useBagStore((s) => s.fetchBag);

  // Reset local state whenever the dialog opens for a (new) product —
  // derived-state-during-render pattern instead of setState in an effect.
  const [prevSession, setPrevSession] = useState<string | null>(null);
  const sessionKey = open && product ? `open-${product.id}` : null;
  if (sessionKey !== prevSession) {
    setPrevSession(sessionKey);
    setQty(1);
    setAdded(false);
  }

  if (!product) return null;

  const accent = product.accentColor;

  const handleAdd = async () => {
    for (let i = 0; i < qty; i++) {
      await addItem(product.id);
    }
    await fetchBag();
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto border-white/10 bg-[#050510]/98 p-0 backdrop-blur-2xl sm:max-w-3xl"
        style={
          {
            "--card-accent": accent,
            boxShadow: `0 0 80px ${accent}30, 0 0 24px ${accent}25`,
          } as React.CSSProperties
        }
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name} details</DialogTitle>
        </DialogHeader>

        <button
          onClick={() => onOpenChange(false)}
          aria-label="Close dialog"
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white/70 backdrop-blur-md transition-colors hover:border-white/30 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Visual side */}
          <div className="relative min-h-64 overflow-hidden md:min-h-full">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 384px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-transparent md:bg-gradient-to-r" />
            {product.badge && (
              <span
                className="absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur-md"
                style={{
                  color: accent,
                  border: `1px solid ${accent}66`,
                  background: `${accent}14`,
                  boxShadow: `0 0 14px ${accent}45`,
                }}
              >
                {product.badge}
              </span>
            )}
          </div>

          {/* Content side */}
          <div className="flex flex-col p-6 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/40">
              {product.category}
            </p>
            <h2
              className="mt-1 text-3xl font-bold tracking-tight text-white"
              style={{ textShadow: `0 0 30px ${accent}55` }}
            >
              {product.name}
            </h2>
            <p className="gradient-text-static mt-1 text-lg font-medium">
              {product.tagline}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              {product.description}
            </p>

            {/* Highlights */}
            <ul className="mt-5 space-y-2">
              {product.highlights.map((h, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  className="flex items-start gap-2 text-sm text-white/75"
                >
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: accent, filter: `drop-shadow(0 0 6px ${accent})` }}
                  />
                  {h}
                </motion.li>
              ))}
            </ul>

            <Separator className="my-5 bg-white/10" />

            {/* Specs table */}
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Tech Specs
            </h3>
            <dl className="max-h-44 space-y-2 overflow-y-auto pr-1">
              {product.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-baseline justify-between gap-4 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
                >
                  <dt className="shrink-0 text-xs font-medium text-white/45">
                    {spec.label}
                  </dt>
                  <dd className="text-right text-xs font-medium text-white/85">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Price + qty + CTA */}
            <div className="mt-auto pt-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40">
                    From
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: accent, textShadow: `0 0 18px ${accent}66` }}
                  >
                    {formatPrice(product.price)}
                  </p>
                </div>
                <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-1.5 py-1">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="min-w-6 text-center text-sm font-bold text-white tabular-nums">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => Math.min(9, q + 1))}
                    aria-label="Increase quantity"
                    className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <Button
                onClick={handleAdd}
                className="neon-btn-primary mt-4 h-12 w-full rounded-full border-0 text-sm font-bold"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {added ? (
                    <motion.span
                      key="added"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex items-center"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Added to bag — {formatPrice(product.price * qty)}
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex items-center"
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Add {qty > 1 ? `${qty} ` : ""}to Bag
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
              <p className="mt-3 text-center text-[11px] text-white/35">
                Free delivery • Free returns • Pay monthly at 0% APR
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

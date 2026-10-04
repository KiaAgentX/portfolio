"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Trash2, ShoppingBag, Sparkles } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useBagStore } from "@/store/bag-store";
import { formatPrice } from "@/lib/types";

export function BagDrawer() {
  const {
    isOpen,
    setOpen,
    items,
    total,
    count,
    fetchBag,
    updateItem,
    removeItem,
  } = useBagStore();

  useEffect(() => {
    if (isOpen) fetchBag();
  }, [isOpen, fetchBag]);

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="flex w-full flex-col border-white/10 bg-[#050510]/95 p-0 backdrop-blur-2xl sm:max-w-md"
      >
        <SheetHeader className="border-b border-white/10 px-5 py-4">
          <SheetTitle className="flex items-center gap-2 text-lg font-semibold text-white">
            <ShoppingBag className="h-5 w-5 text-[color:var(--neon-cyan)]" />
            Your Bag
            {count > 0 && (
              <span className="rounded-full bg-[color:var(--neon-cyan)]/15 px-2 py-0.5 text-xs font-medium text-[color:var(--neon-cyan)]">
                {count}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <ShoppingBag className="h-8 w-8 text-white/30" />
              </div>
              <div>
                <p className="font-medium text-white">Your bag is empty.</p>
                <p className="mt-1 text-sm text-white/50">
                  Add something luminous.
                </p>
              </div>
              <Button
                onClick={() => setOpen(false)}
                className="neon-btn-primary rounded-full border-0 font-medium"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Continue shopping
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.li
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    className="neon-card rounded-2xl p-3"
                    style={
                      {
                        "--card-accent": item.product.accentColor,
                      } as React.CSSProperties
                    }
                  >
                    <div className="flex gap-3">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="truncate text-sm font-semibold text-white">
                              {item.product.name}
                            </p>
                            <p className="mt-0.5 text-xs text-white/50">
                              {formatPrice(item.product.price)} each
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            aria-label={`Remove ${item.product.name}`}
                            className="text-white/40 transition-colors hover:text-[color:var(--destructive)]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-1 py-0.5">
                            <button
                              onClick={() => updateItem(item.id, -1)}
                              aria-label="Decrease quantity"
                              className="flex h-6 w-6 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-[color:var(--neon-cyan)]"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="min-w-5 text-center text-xs font-semibold text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateItem(item.id, 1)}
                              aria-label="Increase quantity"
                              className="flex h-6 w-6 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-[color:var(--neon-cyan)]"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <p
                            className="text-sm font-bold"
                            style={{
                              color: item.product.accentColor,
                              textShadow: `0 0 12px ${item.product.accentColor}66`,
                            }}
                          >
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-white/10 bg-black/40 px-5 py-4">
            <div className="flex items-center justify-between text-sm text-white/60">
              <span>Subtotal ({count} items)</span>
              <span className="text-base font-bold text-white">
                {formatPrice(total)}
              </span>
            </div>
            <Separator className="my-3 bg-white/10" />
            <Button className="neon-btn-primary h-11 w-full rounded-full border-0 text-sm font-semibold">
              Check Out
            </Button>
            <p className="mt-2 text-center text-[11px] text-white/40">
              Free delivery and free returns on every neon order.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

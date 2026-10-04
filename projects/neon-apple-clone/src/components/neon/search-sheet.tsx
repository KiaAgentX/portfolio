"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, SearchX, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useBagStore } from "@/store/bag-store";
import { useProductDialogStore } from "@/store/product-dialog-store";
import { formatPrice, type Product } from "@/lib/types";

const SUGGESTIONS = ["iPhone", "MacBook", "Watch", "Vision", "AirPods", "iPad"];

interface SearchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchSheet({ open, onOpenChange }: SearchSheetProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const addItem = useBagStore((s) => s.addItem);
  const openProduct = useProductDialogStore((s) => s.openProduct);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setSearched(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(term)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (data.success) {
          setResults(data.products);
          setSearched(true);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("search error:", error);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query, open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="top"
        className="border-white/10 bg-black/92 backdrop-blur-2xl"
      >
        <SheetHeader>
          <SheetTitle className="sr-only">Search products</SheetTitle>
        </SheetHeader>
        <div className="mx-auto max-w-2xl pb-8">
          {/* Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--neon-cyan)]" />
            {loading && (
              <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-white/40" />
            )}
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search iPhone, Mac, Watch…"
              aria-label="Search products"
              className="h-12 rounded-full border-white/10 bg-white/5 pl-11 pr-11 text-base text-white placeholder:text-white/40 focus-visible:ring-[color:var(--neon-cyan)]"
            />
          </div>

          {/* Suggestions */}
          {query.trim().length < 2 && (
            <>
              <div className="mt-4 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/60 transition-all hover:border-[color:var(--neon-cyan)]/50 hover:text-[color:var(--neon-cyan)]"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="mt-6 text-center text-xs text-white/30">
                Quick links: iPhone 18 Pro · MacBook Neo · Series 12 · Vision Pro 2
              </p>
            </>
          )}

          {/* Results */}
          <AnimatePresence>
            {query.trim().length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 max-h-[46vh] space-y-2 overflow-y-auto pr-1"
                role="listbox"
                aria-label="Search results"
              >
                {!loading && searched && results.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-10 text-white/40">
                    <SearchX className="h-8 w-8" />
                    <p className="text-sm">
                      No results for “{query.trim()}”. Try “iPhone” or “Pro”.
                    </p>
                  </div>
                )}

                {results.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-2.5 transition-all hover:border-white/20"
                  >
                    <button
                      onClick={() => {
                        onOpenChange(false);
                        openProduct(product);
                      }}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      aria-label={`Open ${product.name} details`}
                    >
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-white/10">
                        <Image
                          src={product.image}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white group-hover:text-[color:var(--neon-cyan)]">
                          {product.name}
                        </p>
                        <p className="truncate text-xs text-white/45">
                          {product.tagline} · {formatPrice(product.price)}
                        </p>
                      </div>
                    </button>
                    <Button
                      onClick={() => addItem(product.id)}
                      size="sm"
                      aria-label={`Add ${product.name} to bag`}
                      className="neon-btn-primary h-8 w-8 shrink-0 rounded-full border-0 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
}

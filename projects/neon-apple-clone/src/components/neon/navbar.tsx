"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, ShoppingBag, Menu, X } from "lucide-react";
import { useBagStore } from "@/store/bag-store";
import { useProductDialogStore } from "@/store/product-dialog-store";
import { AppleLogo } from "./apple-logo";
import { SearchSheet } from "./search-sheet";


const NAV_LINKS = [
  "Store",
  "Mac",
  "iPad",
  "iPhone",
  "Watch",
  "Vision",
  "AirPods",
  "TV & Home",
  "Entertainment",
  "Accessories",
  "Support",
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const count = useBagStore((s) => s.count);
  const setOpen = useBagStore((s) => s.setOpen);
  const fetchBag = useBagStore((s) => s.fetchBag);
  const productDialogOpen = useProductDialogStore((s) => s.open);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`sticky top-0 z-50 border-b transition-all duration-500 ${
          scrolled
            ? "border-white/10 bg-black/70 shadow-[0_0_30px_rgba(0,255,213,0.08)] backdrop-blur-2xl"
            : "border-transparent bg-black/30 backdrop-blur-md"
        }`}
      >
        <nav
          aria-label="Global"
          className="mx-auto flex h-12 max-w-5xl items-center justify-between px-4 sm:px-6"
        >
          {/* Mobile menu trigger */}
          <button
            className="flex h-8 w-8 items-center justify-center rounded-md text-foreground/80 transition-colors hover:text-[color:var(--neon-cyan)] md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          {/* Logo */}
          <a href="#" aria-label="Neon Apple">
            <AppleLogo />
          </a>

          {/* Desktop links */}
          <ul className="hidden items-center gap-5 md:flex lg:gap-7">
            {NAV_LINKS.map((link) => (
              <li key={link}>
                <a
                  href="#latest"
                  className="group relative text-[11px] font-normal tracking-wide text-foreground/70 transition-colors duration-300 hover:text-white lg:text-xs"
                >
                  {link}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-[color:var(--neon-cyan)] to-[color:var(--neon-magenta)] shadow-[0_0_8px_rgba(0,255,213,0.9)] transition-all duration-300 group-hover:w-full" />
                </a>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/70 transition-all duration-300 hover:text-[color:var(--neon-cyan)] hover:drop-shadow-[0_0_6px_rgba(0,255,213,0.8)]"
            >
              <Search className="h-[15px] w-[15px]" />
            </button>

            <button
              onClick={() => {
                fetchBag();
                setOpen(true);
              }}
              aria-label={`Shopping bag, ${count} items`}
              className="relative flex h-8 w-8 items-center justify-center rounded-full text-foreground/70 transition-all duration-300 hover:text-[color:var(--neon-magenta)] hover:drop-shadow-[0_0_6px_rgba(255,46,196,0.9)]"
            >
              <ShoppingBag className="h-[15px] w-[15px]" />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--neon-magenta)] px-1 text-[9px] font-bold text-black shadow-[0_0_10px_rgba(255,46,196,0.9)]"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </nav>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-t border-white/5 bg-black/95 backdrop-blur-2xl md:hidden"
            >
              <ul className="max-h-[70vh] space-y-1 overflow-y-auto px-6 py-4">
                {NAV_LINKS.map((link, i) => (
                  <motion.li
                    key={link}
                    initial={{ x: -16, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <a
                      href="#latest"
                      onClick={() => setMobileOpen(false)}
                      className="block border-b border-white/5 py-2.5 text-sm text-foreground/80 transition-colors hover:text-[color:var(--neon-cyan)]"
                    >
                      {link}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Search sheet — auto-hidden while a product dialog is stacked on top */}
      <SearchSheet open={searchOpen && !productDialogOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

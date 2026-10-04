"use client";

import { create } from "zustand";
import type { Product } from "@/lib/types";

interface ProductDialogState {
  product: Product | null;
  open: boolean;
  openProduct: (product: Product) => void;
  close: () => void;
}

export const useProductDialogStore = create<ProductDialogState>((set) => ({
  product: null,
  open: false,
  openProduct: (product) => set({ product, open: true }),
  close: () => set({ open: false }),
}));

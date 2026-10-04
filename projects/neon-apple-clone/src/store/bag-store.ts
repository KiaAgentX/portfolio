"use client";

import { create } from "zustand";

export interface BagProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  accentColor: string;
}

export interface BagItem {
  id: string;
  quantity: number;
  product: BagProduct;
}

export interface BagState {
  items: BagItem[];
  count: number;
  total: number;
  isOpen: boolean;
  loading: boolean;
  justAdded: string | null;

  setOpen: (open: boolean) => void;
  fetchBag: () => Promise<void>;
  addItem: (productId: string) => Promise<void>;
  updateItem: (itemId: string, delta: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearJustAdded: () => void;
}

export const useBagStore = create<BagState>((set, get) => ({
  items: [],
  count: 0,
  total: 0,
  isOpen: false,
  loading: false,
  justAdded: null,

  setOpen: (open) => set({ isOpen: open }),

  fetchBag: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/bag");
      const data = await res.json();
      if (data.success) {
        set({
          items: data.items,
          count: data.count,
          total: data.total,
        });
      }
    } catch (error) {
      console.error("fetchBag error:", error);
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (productId) => {
    try {
      const res = await fetch("/api/bag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (data.success) {
        set({
          items: data.items,
          count: data.count,
          total: data.total,
          justAdded: productId,
        });
      }
    } catch (error) {
      console.error("addItem error:", error);
    }
  },

  updateItem: async (itemId, delta) => {
    try {
      const res = await fetch("/api/bag", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, delta }),
      });
      const data = await res.json();
      if (data.success) {
        set({
          items: data.items,
          count: data.count,
          total: data.total,
        });
      }
    } catch (error) {
      console.error("updateItem error:", error);
    }
  },

  removeItem: async (itemId) => {
    try {
      const res = await fetch(`/api/bag?itemId=${itemId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        set({
          items: data.items,
          count: data.count,
          total: data.total,
        });
      }
    } catch (error) {
      console.error("removeItem error:", error);
    }
  },

  clearJustAdded: () => set({ justAdded: null }),
}));

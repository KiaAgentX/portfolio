export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  image: string;
  category: string;
  accentColor: string;
  badge: string | null;
  featured: boolean;
  hero: boolean;
  sortOrder: number;
  specs: ProductSpec[];
  highlights: string[];
}

export interface SiteStats {
  visits: number;
  newsletterSends: number;
  bagAdditions: number;
  subscribers: number;
  products: number;
}

export function parseJsonArray<T>(raw: string | null | undefined, fallback: T[] = []): T[] {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);

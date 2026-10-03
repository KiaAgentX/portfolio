/**
 * Commerce scaffold (spec §33, roadmap 5) — intentionally data-gated.
 * The spec forbids inventing products/prices (§103: no fake data), so the
 * catalog starts EMPTY and the API answers 503 "catalog not configured"
 * until the business inserts real rows into Product (see schema) — at which
 * point this module activates with zero code changes.
 *
 * Order state machine: created → paid → delivered | cancelled.
 * Delivery of physical goods is out of process scope by design (ops CSV/API).
 */
export interface ProductView {
  id: string;
  name: string;
  description: string | null;
  priceAed: number;
  stock: number | null;
  active: boolean;
}

export interface OrderView {
  id: string;
  playerId: string;
  productId: string;
  quantity: number;
  priceAed: number;
  status: 'CREATED' | 'PAID' | 'DELIVERED' | 'CANCELLED';
  contact: string | null;
  createdAt: string;
}

interface OrderRow extends OrderView {}
const productMem: ProductView[] = []; // stays empty: gated on real data
const orderMem = new Map<string, OrderRow>();

const db = () => import('@fishkal/database').then((m) => m.prisma);
let useDb = false;

export function setCommerceDbAvailable(v: boolean): void {
  useDb = v;
}

/** Catalog only activates when the business provides real products. */
export async function listProducts(): Promise<{ available: boolean; products: ProductView[] }> {
  if (useDb) {
    try {
      const p = await db();
      const rows = await p.product.findMany({ where: { active: true }, orderBy: { priceAed: 'asc' } });
      return {
        available: rows.length > 0,
        products: rows.map((r) => ({ id: r.id, name: r.name, description: r.description, priceAed: r.priceAed, stock: r.stock, active: r.active })),
      };
    } catch {
      useDb = false;
    }
  }
  return { available: productMem.length > 0, products: [...productMem] };
}

export async function createOrder(playerId: string, productId: string, quantity: number, contact: string | null): Promise<{ ok: true; order: OrderView } | { ok: false; code: 'CATALOG_EMPTY' | 'UNKNOWN_PRODUCT' | 'OUT_OF_STOCK' }> {
  const { available, products } = await listProducts();
  if (!available) return { ok: false, code: 'CATALOG_EMPTY' };
  const product = products.find((p) => p.id === productId);
  if (!product) return { ok: false, code: 'UNKNOWN_PRODUCT' };
  if (product.stock !== null && product.stock < quantity) return { ok: false, code: 'OUT_OF_STOCK' };

  const order: OrderView = {
    id: crypto.randomUUID(),
    playerId,
    productId,
    quantity,
    priceAed: product.priceAed * quantity,
    status: 'CREATED',
    contact,
    createdAt: new Date().toISOString(),
  };
  orderMem.set(order.id, order);
  if (useDb) {
    try {
      const p = await db();
      await p.order.create({
        data: { id: order.id, playerId, productId, quantity, priceAed: order.priceAed, status: order.status },
      });
    } catch {
      useDb = false;
    }
  }
  return { ok: true, order };
}

export async function listOrders(playerId: string): Promise<OrderView[]> {
  if (useDb) {
    try {
      const p = await db();
      const rows = await p.order.findMany({ where: { playerId }, orderBy: { createdAt: 'desc' }, take: 50 });
      return rows.map((r) => ({
        id: r.id,
        playerId: r.playerId,
        productId: r.productId,
        quantity: r.quantity,
        priceAed: r.priceAed,
        status: r.status as OrderView['status'],
        contact: null,
        createdAt: r.createdAt.toISOString(),
      }));
    } catch {
      useDb = false;
    }
  }
  return [...orderMem.values()].filter((o) => o.playerId === playerId);
}

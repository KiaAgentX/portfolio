import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const SESSION_COOKIE = "neon_bag_session";

async function getSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(SESSION_COOKIE)?.value;
  if (existing) return existing;

  const newId = crypto.randomUUID();
  cookieStore.set(SESSION_COOKIE, newId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return newId;
}

async function getBagPayload(sessionId: string) {
  const items = await db.bagItem.findMany({
    where: { sessionId },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  const count = items.reduce((acc, item) => acc + item.quantity, 0);
  const total = items.reduce(
    (acc, item) => acc + item.quantity * item.product.price,
    0
  );

  return {
    items: items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        slug: item.product.slug,
        name: item.product.name,
        price: item.product.price,
        image: item.product.image,
        accentColor: item.product.accentColor,
      },
    })),
    count,
    total,
  };
}

export async function GET() {
  try {
    const sessionId = await getSessionId();
    const payload = await getBagPayload(sessionId);
    return NextResponse.json({ success: true, ...payload });
  } catch (error) {
    console.error("GET /api/bag error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bag" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionId = await getSessionId();
    const body = await req.json();
    const { productId } = body as { productId?: string };

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "productId is required" },
        { status: 400 }
      );
    }

    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    await db.bagItem.upsert({
      where: { sessionId_productId: { sessionId, productId } },
      update: { quantity: { increment: 1 } },
      create: { sessionId, productId, quantity: 1 },
    });

    await db.stat.upsert({
      where: { key: "bagAdditions" },
      update: { value: { increment: 1 } },
      create: { key: "bagAdditions", value: 1 },
    });

    const payload = await getBagPayload(sessionId);
    return NextResponse.json({
      success: true,
      message: `${product.name} added to your bag.`,
      ...payload,
    });
  } catch (error) {
    console.error("POST /api/bag error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add to bag" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const sessionId = await getSessionId();
    const body = await req.json();
    const { itemId, delta } = body as { itemId?: string; delta?: number };

    if (!itemId || typeof delta !== "number") {
      return NextResponse.json(
        { success: false, error: "itemId and delta are required" },
        { status: 400 }
      );
    }

    const item = await db.bagItem.findFirst({
      where: { id: itemId, sessionId },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      await db.bagItem.delete({ where: { id: itemId } });
    } else {
      await db.bagItem.update({
        where: { id: itemId },
        data: { quantity: newQuantity },
      });
    }

    const payload = await getBagPayload(sessionId);
    return NextResponse.json({ success: true, ...payload });
  } catch (error) {
    console.error("PATCH /api/bag error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update bag" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionId = await getSessionId();
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "itemId is required" },
        { status: 400 }
      );
    }

    await db.bagItem.deleteMany({ where: { id: itemId, sessionId } });

    const payload = await getBagPayload(sessionId);
    return NextResponse.json({ success: true, ...payload });
  } catch (error) {
    console.error("DELETE /api/bag error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove item" },
      { status: 500 }
    );
  }
}

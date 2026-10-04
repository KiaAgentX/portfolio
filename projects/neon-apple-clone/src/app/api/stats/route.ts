import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [visits, newsletter, bagAdditions, subscriberCount, productCount] =
      await Promise.all([
        db.stat.upsert({
          where: { key: "visits" },
          update: { value: { increment: 1 } },
          create: { key: "visits", value: 1 },
        }),
        db.stat.findUnique({ where: { key: "newsletter" } }),
        db.stat.findUnique({ where: { key: "bagAdditions" } }),
        db.subscriber.count(),
        db.product.count(),
      ]);

    return NextResponse.json({
      success: true,
      stats: {
        visits: visits?.value ?? 0,
        newsletterSends: newsletter?.value ?? 0,
        bagAdditions: bagAdditions?.value ?? 0,
        subscribers: subscriberCount,
        products: productCount,
      },
    });
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseJsonArray, type ProductSpec } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const q = searchParams.get("q")?.trim();
    const slug = searchParams.get("slug");

    const where: Record<string, unknown> = {};
    if (category && category !== "All") {
      where.category = category;
    }
    if (featured === "true") {
      where.featured = true;
    }
    if (slug) {
      where.slug = slug;
    }
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { tagline: { contains: q } },
        { category: { contains: q } },
        { description: { contains: q } },
      ];
    }

    const products = await db.product.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({
      success: true,
      products: products.map((p) => ({
        ...p,
        specs: parseJsonArray<ProductSpec>(p.specs),
        highlights: parseJsonArray<string>(p.highlights),
      })),
    });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

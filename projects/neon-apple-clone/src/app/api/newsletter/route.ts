import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid email" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    const subscriber = await db.subscriber.upsert({
      where: { email: email.toLowerCase() },
      update: {},
      create: { email: email.toLowerCase() },
    });

    await db.stat.upsert({
      where: { key: "newsletter" },
      update: { value: { increment: 1 } },
      create: { key: "newsletter", value: 1 },
    });

    return NextResponse.json({
      success: true,
      message: "You're in. Welcome to the neon side.",
      subscriber: { id: subscriber.id, email: subscriber.email },
    });
  } catch (error) {
    console.error("POST /api/newsletter error:", error);
    return NextResponse.json(
      { success: false, error: "Subscription failed. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const count = await db.subscriber.count();
    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error("GET /api/newsletter error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscriber count" },
      { status: 500 }
    );
  }
}

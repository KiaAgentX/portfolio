import { NextResponse } from 'next/server';
import { db } from '@/db';
import { analyses } from '@/db/schema';
import { seedDatabase } from '@/db/seed';
import { eq } from 'drizzle-orm';

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const repo = searchParams.get('repo') || 'DropAgentXBot';

    let result = await db.select().from(analyses).where(eq(analyses.repoName, repo)).limit(1);

    if (result.length === 0) {
      await seedDatabase();
      result = await db.select().from(analyses).where(eq(analyses.repoName, repo)).limit(1);
    }

    if (result.length === 0) {
      // Fallback if initial query still returns empty
      const all = await db.select().from(analyses).limit(1);
      if (all.length > 0) {
        return NextResponse.json({ success: true, data: all[0] });
      }
      return NextResponse.json({ success: false, error: 'Analysis not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error: any) {
    console.error('API /api/analysis error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

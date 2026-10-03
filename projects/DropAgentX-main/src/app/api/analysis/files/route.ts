import { NextResponse } from 'next/server';
import { db } from '@/db';
import { analyzedFiles, analyses } from '@/db/schema';
import { eq, like, or, desc, asc, sql } from 'drizzle-orm';
import { seedDatabase } from '@/db/seed';

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const repo = searchParams.get('repo') || 'DropAgentXBot';
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sortBy') || 'lines'; // 'lines', 'value', 'code', 'size', 'name'
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Find analysis ID
    let analysisRes = await db.select().from(analyses).where(eq(analyses.repoName, repo)).limit(1);
    if (analysisRes.length === 0) {
      await seedDatabase();
      analysisRes = await db.select().from(analyses).where(eq(analyses.repoName, repo)).limit(1);
    }

    if (analysisRes.length === 0) {
      return NextResponse.json({ success: false, error: 'Analysis record not found' }, { status: 404 });
    }

    const analysisId = analysisRes[0].id;

    let query = db.select().from(analyzedFiles).where(eq(analyzedFiles.analysisId, analysisId));

    const files = await query;

    let filtered = files.filter(f => {
      const matchSearch = search ? (f.path.toLowerCase().includes(search.toLowerCase()) || f.purposeFa?.toLowerCase().includes(search.toLowerCase()) || f.category.toLowerCase().includes(search.toLowerCase())) : true;
      const matchCategory = category ? (f.category.includes(category) || category === 'all') : true;
      return matchSearch && matchCategory;
    });

    // Sort
    filtered.sort((a, b) => {
      let multiplier = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'value') return (a.estimatedValueUsd - b.estimatedValueUsd) * multiplier;
      if (sortBy === 'code') return (a.codeLines - b.codeLines) * multiplier;
      if (sortBy === 'size') return (a.sizeBytes - b.sizeBytes) * multiplier;
      if (sortBy === 'name') return a.name.localeCompare(b.name) * multiplier;
      return (a.lines - b.lines) * multiplier; // default lines
    });

    // Calculate category breakdown stats
    const categoryStats: Record<string, { count: number; lines: number; codeLines: number; valueUsd: number }> = {};
    files.forEach(f => {
      if (!categoryStats[f.category]) {
        categoryStats[f.category] = { count: 0, lines: 0, codeLines: 0, valueUsd: 0 };
      }
      categoryStats[f.category].count += 1;
      categoryStats[f.category].lines += f.lines;
      categoryStats[f.category].codeLines += f.codeLines;
      categoryStats[f.category].valueUsd += f.estimatedValueUsd;
    });

    return NextResponse.json({
      success: true,
      totalFiles: files.length,
      filteredFilesCount: filtered.length,
      categoryStats,
      files: filtered,
    });
  } catch (error: any) {
    console.error('API /api/analysis/files error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

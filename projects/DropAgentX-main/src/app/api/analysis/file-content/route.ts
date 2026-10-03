import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json({ success: false, error: 'Path is required' }, { status: 400 });
    }

    // Sanitize path against directory traversal
    const normalized = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
    const localRepoDir = '/tmp/DropAgentXBot';
    const fullPath = path.join(localRepoDir, normalized);

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ success: false, error: 'File not found on disk' }, { status: 404 });
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    const stats = fs.statSync(fullPath);

    return NextResponse.json({
      success: true,
      path: normalized,
      sizeBytes: stats.size,
      content,
    });
  } catch (error: any) {
    console.error('API /api/analysis/file-content error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

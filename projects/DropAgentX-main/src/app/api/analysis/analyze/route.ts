import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const repoUrl = body.url || 'https://github.com/ImXforever/DropAgentXBot';

    // Extract owner and repo from URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      return NextResponse.json({ success: false, error: 'لینک ریپوزیتوری گیت‌هاب معتبر نیست' }, { status: 400 });
    }

    const owner = match[1];
    const repo = match[2].replace(/\.git$/, '');

    // Fetch repository tree from GitHub API
    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`, {
      headers: { 'User-Agent': 'DropAgentValuator-App' }
    });

    let treeData;
    if (!treeRes.ok) {
      // Try master branch
      const masterRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`, {
        headers: { 'User-Agent': 'DropAgentValuator-App' }
      });
      if (!masterRes.ok) {
        return NextResponse.json({ success: false, error: 'امکان دریافت ساختار کد از GitHub API وجود نداشت.' }, { status: 400 });
      }
      treeData = await masterRes.json();
    } else {
      treeData = await treeRes.json();
    }

    const tree = treeData.tree || [];
    const blobs = tree.filter((item: any) => item.type === 'blob');

    let totalFiles = blobs.length;
    let estimatedTotalLines = 0;
    let estimatedCodeLines = 0;
    let totalValueUsd = 0;

    const fileDetails = blobs.map((item: any) => {
      const path = item.path;
      const size = item.size || 500;
      const ext = path.split('.').pop()?.toLowerCase() || '';

      // Estimate line count based on average 38 bytes per line
      const estLines = Math.max(1, Math.round(size / 38));
      const estCodeLines = Math.round(estLines * 0.85);

      estimatedTotalLines += estLines;
      estimatedCodeLines += estCodeLines;

      let rate = 25;
      let category = 'کدهای عمومی و فرانت‌اند';
      let complexity = 'متوسط';

      if (['py', 'rs', 'go', 'ts', 'java'].includes(ext)) {
        if (path.includes('ai') || path.includes('engine') || path.includes('fleet') || path.includes('hermes') || path.includes('agent')) {
          rate = 45;
          category = 'موتور هوش مصنوعی و پردازش ایجنتی';
          complexity = 'بسیار بالا';
        } else if (path.includes('database') || path.includes('api') || path.includes('handler') || path.includes('admin')) {
          rate = 35;
          category = 'بک‌اند، دیتابیس و سرویس‌ها';
          complexity = 'بالا';
        } else {
          rate = 30;
          category = 'منطق برنامه‌نویسی پایتون/بک‌اند';
          complexity = 'متوسط به بالا';
        }
      } else if (['js', 'jsx', 'tsx', 'vue', 'html', 'css'].includes(ext)) {
        rate = 25;
        category = 'فرانت‌اند و رابط کاربری وب/مینی‌اپ';
        complexity = 'متوسط';
      } else {
        rate = 15;
        category = 'مستندات، داکر و کانفیگ‌ها';
        complexity = 'پایه';
      }

      const fileVal = Math.max(Math.round(estCodeLines * rate), 20);
      totalValueUsd += fileVal;

      return {
        path,
        name: path.split('/').pop() || path,
        lines: estLines,
        codeLines: estCodeLines,
        commentLines: Math.round(estLines * 0.1),
        blankLines: Math.round(estLines * 0.05),
        sizeBytes: size,
        category,
        complexity,
        ratePerLoc: rate,
        estimatedValueUsd: fileVal,
        purposeFa: `فایل ${path} در ریپوزیتوری ${repo}`
      };
    });

    return NextResponse.json({
      success: true,
      repoInfo: {
        owner,
        repo,
        url: repoUrl,
        totalFiles,
        totalLines: estimatedTotalLines,
        codeLines: estimatedCodeLines,
        estimatedValueUsd: totalValueUsd,
      },
      files: fileDetails.slice(0, 100),
    });
  } catch (error: any) {
    console.error('API /api/analysis/analyze error:', error);
    return NextResponse.json({ success: false, error: error.message || 'خطا در تحلیل پروژه' }, { status: 500 });
  }
}

import { db } from './index';
import { analyses, analyzedFiles } from './schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

export async function seedDatabase() {
  try {
    const existing = await db.select().from(analyses).where(eq(analyses.repoName, 'DropAgentXBot')).limit(1);
    if (existing.length > 0) {
      console.log('Database already seeded with DropAgentXBot');
      return existing[0].id;
    }

    const hasFeaturesData = [
      {
        category: 'موتور هوش مصنوعی و ایجنت',
        titleFa: 'یکپارچه‌سازی ایجنت Hermes با ۳ حالت اجرایی',
        titleEn: 'Hermes Agent Integration (CLI, HTTP, API)',
        descriptionFa: 'پشتیبانی کامل از ۳ حالت CLI (مستقیم با hermes-agent)، HTTP Gateway و OpenAI API fallback با حفظ سابقه جلسات چت برای هر کاربر تلگرام.',
        files: ['hermes_engine.py', 'ai_agent.py', 'config.py'],
        importance: 'critical' as const,
      },
      {
        category: 'موتور چند ایجنتی (Multi-Agent)',
        titleFa: 'سیستم چند-ایجنتی Atlas Fleet',
        titleEn: 'Atlas Multi-Agent Fleet Engine',
        descriptionFa: 'معماری پردازش موازی و تقسیم وظایف سنگین بین چند ایجنت تخصصی به صورت همزمان.',
        files: ['fleet.py', 'mcp_lite.py'],
        importance: 'high' as const,
      },
      {
        category: 'مارکت‌پلیس و اقتصاد',
        titleFa: 'فروشگاه محصولات دیجیتال و سیستم کمیسیون',
        titleEn: 'Digital Product Marketplace & Commission Engine',
        descriptionFa: 'امکان ثبت محصول توسط کاربران با کمکی AI، آپلود فایل، محاسبه اتوماتیک ۱۰٪ کمیسیون پلتفرم و رتبه‌بندی فروشندگان.',
        files: ['handlers/marketplace.py', 'handlers/products.py', 'app_api.py'],
        importance: 'critical' as const,
      },
      {
        category: 'اقتصاد کردیت و تسک‌ها',
        titleFa: 'سیستم تبلیغاتی تسک محور و رفرال',
        titleEn: 'Task Engagement System & Credit Economy',
        descriptionFa: 'تعریف تسک‌های فالو/عضویت کانال جهت کسب کردیت، سیستم معرفی (رفرال) دو طرفه و کیف پول داخلی تلگرامی.',
        files: ['handlers/tasks.py', 'handlers/wallet.py', 'handlers/referral.py'],
        importance: 'high' as const,
      },
      {
        category: 'فرانت‌اند و مینی‌اپ',
        titleFa: 'مینی‌اپ تلگرام اختصاصی RTL SPA',
        titleEn: 'Telegram Mini App (RTL Single Page App)',
        descriptionFa: 'نرم‌افزار وب‌ویو تلگرام با ۹ صفحه مجزا (خانه، کاوش، ساخت با AI، پروفایل، کیف پول و...) با دیزاین سیستم کامل فارسی.',
        files: ['web/app/index.html', 'web/app/js/core/api.js', 'web/app/js/pages/create.js'],
        importance: 'critical' as const,
      },
      {
        category: 'پنل وب ادمین',
        titleFa: 'داشبورد ادمین و کاکپیت سنپای (Senpai AI Cockpit)',
        titleEn: 'Web Admin Dashboard & Senpai AI Cockpit',
        descriptionFa: 'داشبورد بسیار غنی وب ادمین با بیش از ۴۴۰۰ خط کد جاوااسکریپت شامل کنترل آمار، مودریشن، حافظه کاربران و بکاپ تلگرام.',
        files: ['web_admin.py', 'web/admin.html', 'web/senpai/app.js', 'web/senpai/app.css'],
        importance: 'critical' as const,
      },
      {
        category: 'ابزارها و سندباکس',
        titleFa: '۱۵+ ابزار اختصاصی ایجنت و سندباکس اجرا',
        titleEn: 'Agent Tools, Web Scraper & Code Execution Sandbox',
        descriptionFa: 'تجهیز ایجنت به ابزارهای جستجوی وب، اسکرپینگ، اجرای کد امن در محیط سندباکس و سرور A2A.',
        files: ['tools.py', 'sandbox.py', 'webtools.py', 'a2a_server.py'],
        importance: 'high' as const,
      },
      {
        category: 'اتوماسیون و پشتیبانی',
        titleFa: 'گزارش روزانه و بکاپ خودکار تلگرامی',
        titleEn: 'Automated Daily Reports & Database Telegram Backup',
        descriptionFa: 'جاب‌های کرون روزانه جهت ارسال آمار پلتفرم و فایل بکاپ SQLite به کانال یا پیوی ادمین در تلگرام.',
        files: ['cron_jobs.py', 'utils.py'],
        importance: 'medium' as const,
      },
    ];

    const lacksFeaturesData = [
      {
        category: 'درگاه پرداخت',
        titleFa: 'عدم اتصال به درگاه پرداخت واقعی (زرین‌پال/کریپتو/Telegram Stars)',
        titleEn: 'Missing Real Automated Payment Gateway Integration',
        descriptionFa: 'سیستم کیف پول فعلی واریز و برداشت را به صورت دستی یا شبیه‌سازی انجام می‌دهد و فاقد Webhook واقعی اتصال به درگاه‌های زرین‌پال، آیدی‌پی، Telegram Stars یا کریپتو (TON/USDT) است.',
        impactFa: 'امکان شارژ خودکار مستقیم و فروش مستقیم دلاری/تومانی بدون دخالت ادمین وجود ندارد.',
        recommendationFa: 'افزودن ماژول payment_gateways.py با پشتیبانی از ZarinPal API v4 و Telegram Stars Invoice.',
        severity: 'critical' as const,
      },
      {
        category: 'دیتابیس و مقیاس‌پذیری',
        titleFa: 'قفل دیتابیس SQLite در همزمانی بالا (Concurrency Bottleneck)',
        titleEn: 'Database Concurrency Lock with SQLite under High Load',
        descriptionFa: 'پروژه از SQLite فایل‌محور استفاده می‌کند که در ترافیک بالای کاربران تلگرام دچار خطای database is locked می‌شود. همچنین کوئری‌ها به صورت SQL متنی در دیتابیس نوشته شده‌اند.',
        impactFa: 'افت شدید سرعت و کرش ربات در مواقع فراخوان‌های همزمان مینی‌اپ و ربات.',
        recommendationFa: 'مهاجرت به PostgreSQL همراه با SQLAlchemy Async و افزودن کشینگ Redis برای جلسات چت.',
        severity: 'critical' as const,
      },
      {
        category: 'تست‌های خودکار',
        titleFa: 'فقدان تست‌های خودکار (Unit Tests / Integration Tests)',
        titleEn: 'Zero Automated Test Coverage & CI Pipelines',
        descriptionFa: 'پروژه هیچ فایل تست واحد یا یکپارچگی (pytest/unittest) ندارد.',
        impactFa: 'احتمال بروز باگ‌های ناخواسته هنگام توسعه ویژگی‌های جدید یا آپدیت هندلرها.',
        recommendationFa: 'ایجاد پوشه tests/ و نوشتن تست‌های پوششی برای APIها و هندلرهای ربات.',
        severity: 'high' as const,
      },
      {
        category: 'معماری Event Loop',
        titleFa: 'فراخوانی همگام SQLite در توابع async تلگرام',
        titleEn: 'Synchronous SQLite DB calls blocking Python Asyncio Event Loop',
        descriptionFa: 'کدهای دیتابیس به صورت synchronous پیاده‌سازی شده‌اند که فراخوانی مستقیم آن‌ها در async def هندلرهای تلگرام باعث بلوکه شدن ایونت لوپ می‌شود.',
        impactFa: 'کند شدن پاسخ‌دهی به سایر کاربران هنگامی که یک کوئری سنگین در حال اجراست.',
        recommendationFa: 'استفاده از aiosqlite یا اجرای کوئری‌ها در executor مجزا.',
        severity: 'high' as const,
      },
      {
        category: 'امنیت وب و Rate Limiting',
        titleFa: 'محدودیت‌های احراز هویت وب پنل و عدم وجود Rate Limiter',
        titleEn: 'Basic Cookie Authentication & Lack of API Rate Limiting',
        descriptionFa: 'احراز هویت پنل وب تنها با یک کوکی رمز ساده انجام می‌شود و نرخ درخواست‌ها (Rate Limit) محدود نشده است.',
        impactFa: 'خطر حملات Brute-Force و DDoS روی سرور وب.',
        recommendationFa: 'پیاده‌سازی توکن JWT، محدودکننده درخواست (fastapi/slowapi rate limiter) و ورود دو مرحله‌ای.',
        severity: 'medium' as const,
      },
      {
        category: 'چندزبانه بودن (i18n)',
        titleFa: 'عدم پشتیبانی از چندزبانی (هاردکد بودن فارسی)',
        titleEn: 'Lack of Internationalization (i18n / Multi-language support)',
        descriptionFa: 'تمامی پیام‌های ربات و فرانت‌اند مینی‌اپ به صورت سخت‌کد (Hardcoded) به زبان فارسی نوشته شده‌اند.',
        impactFa: 'امکان گسترش پلتفرم به مارکت بین‌المللی وجود ندارد.',
        recommendationFa: 'انتقال کلمات به دیکشنری‌های i18n JSON جهت ساپورت انگلیسی و سایر زبان‌ها.',
        severity: 'medium' as const,
      },
    ];

    const techStackData = [
      { name: 'Python 3.11+', category: 'Backend Language', percentage: 46, color: '#3776AB' },
      { name: 'JavaScript (SPA & Cockpit)', category: 'Frontend UI', percentage: 38, color: '#F7DF1E' },
      { name: 'HTML5 & CSS3', category: 'Styling & Layout', percentage: 12, color: '#E34F26' },
      { name: 'SQLite / SQL', category: 'Database', percentage: 3, color: '#003B57' },
      { name: 'Docker & Shell Scripts', category: 'DevOps & Infrastructure', percentage: 1, color: '#2496ED' },
    ];

    // Create Analysis
    const [insertedAnalysis] = await db.insert(analyses).values({
      repoUrl: 'https://github.com/ImXforever/DropAgentXBot',
      repoName: 'DropAgentXBot',
      owner: 'ImXforever',
      description: 'بات تلگرام مارکت‌پلیس محصولات دیجیتال مجهز به ایجنت هوش مصنوعی Hermes، مینی‌اپ RTL تلگرام، کاکپیت سنپای ادمین و سیستم اقتصاد کردیت.',
      language: 'Python / JavaScript',
      totalFiles: 71,
      totalLines: 27517,
      codeLines: 23987,
      commentLines: 1840,
      blankLines: 1690,
      estimatedValueUsd: 708065,
      marketDevCostRangeUsd: '$85,000 - $120,000 USD',
      commercialSaleValUsd: '$35,000 - $65,000 USD',
      qualityScore: 88,
      securityScore: 80,
      architectureScore: 92,
      hasFeatures: hasFeaturesData,
      lacksFeatures: lacksFeaturesData,
      techStack: techStackData,
    }).returning();

    // Insert Analyzed Files from JSON
    const exportPath = '/tmp/dropagent_full_export.json';
    if (fs.existsSync(exportPath)) {
      const raw = fs.readFileSync(exportPath, 'utf-8');
      const items = JSON.parse(raw);

      const fileRows = items.map((item: any) => ({
        analysisId: insertedAnalysis.id,
        path: item.path,
        name: item.name,
        lines: item.lines,
        codeLines: item.codeLines,
        commentLines: item.commentLines,
        blankLines: item.blankLines,
        sizeBytes: item.sizeBytes,
        category: item.category,
        complexity: item.complexity,
        ratePerLoc: item.ratePerLoc,
        estimatedValueUsd: item.estimatedValueUsd,
        purposeFa: item.purposeFa,
        status: item.path.includes('web/_backup') ? 'legacy' : 'implemented',
      }));

      // Batch insert in chunks of 20
      for (let i = 0; i < fileRows.length; i += 20) {
        await db.insert(analyzedFiles).values(fileRows.slice(i, i + 20));
      }
      console.log(`Seeded ${fileRows.length} analyzed files successfully!`);
    }

    return insertedAnalysis.id;
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

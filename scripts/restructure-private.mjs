import fs from 'fs';
import path from 'path';

const DIR = 'C:/Users/azarakhsh/Downloads/Full/Full/Private';

const MAP = {
  'Ag.html': {
    slug: 'ag',
    readme: {
      title: 'DropAgentX — راهنمای ساخت AI Agent',
      desc: 'مقاله بلند فارسی: «برای ساخت AI Agent باید برنامه‌نویسی بلد باشی؟» — پاسخ عمیق و کاربردی همراه با پازل ۱۰۰ فیچر گیت‌هاب، چت‌بات چند-پروایدر، ماشین‌حساب هزینه و کوییز سطح‌سنجی.',
      kit: ['HTML', 'Three.js', 'Google Fonts'],
      notes: 'تک‌فایل تعاملی؛ رندر سه‌بعدی بخش‌ها با Three.js.',
    },
  },
  'DropAgentX-Architecture.html': {
    slug: 'dropagentx-architecture',
    readme: {
      title: 'DropAgentX — معماری پروژه',
      desc: 'سند معماری کامل پلتفرم DropAgentX: سرویس‌ها، جریان داده، گیت‌های LLM و توپولوژی استقرار در یک سند بصری.',
      kit: ['HTML', 'Docs'],
      notes: 'سند داخلی/استراتژیک — تک‌فایل، بدون وابستگی.',
    },
  },
  'DropAgentX-Roadmap.html': {
    slug: 'dropagentx-roadmap',
    readme: {
      title: 'DropAgentX — نقشه راه سرمایه‌گذاری',
      desc: 'نقشه راه فازها، عملکرد کنونی و چشم‌انداز آینده پلتفرم هوشمند تجارت دیجیتال DropAgentX.',
      kit: ['HTML', 'Docs'],
      notes: 'سند استراتژی/سرمایه‌گذاری — تک‌فایل.',
    },
  },
  'Fable Berger.html': {
    slug: 'fable-berger',
    readme: {
      title: '🍔 برگرساز سه‌بعدی — Fable Berger',
      desc: 'ابزار تعاملی چیدن برگر با مواد مختلف در یک صحنه سه‌بعدی زنده (Three.js).',
      kit: ['HTML', 'Three.js', 'Google Fonts'],
      notes: 'تک‌فایل؛ اجرا با باز کردن مستقیم index.html در مرورگر.',
    },
  },
  'Hermes-CompanyStructure.html': {
    slug: 'hermes-company-structure',
    readme: {
      title: 'Hermes — ساختار شرکت تجاری',
      desc: 'نمودار ساختار تجاری Hermes: شخصیت حقوقی، خطوط محصول و واحدهای عملیاتی در یک صفحه.',
      kit: ['HTML', 'Docs'],
      notes: 'سند سازمانی — تک‌فایل، بدون وابستگی.',
    },
  },
  'ImX-Landing-3D.html': {
    slug: 'imx-landing-3d',
    readme: {
      title: 'ImXforever — 3D Portfolio Landing (KIA)',
      desc: 'لندینگ سه‌بعدی پورتفولیو با هویت ذرات KIA و دموی تعاملی Pyodide.',
      kit: ['HTML', 'Three.js', 'Pyodide', 'Google Fonts'],
      notes: 'تک‌فایل؛ نسل قبلی صفحه اصلی پورتفولیو.',
    },
  },
  'SC-FINAL.html': {
    slug: 'sc-studio',
    readme: {
      title: 'SC Studio — از ایده تا نیازمندی روشن',
      desc: 'ابزار فارسی کشف پروژه و مهندسی نیازمندی: تک‌فایل، محلی، بدون سرور — «اول روشنش کن. بعد بسازش.»',
      kit: ['HTML', 'Vanilla JS'],
      notes: 'تک‌فایل بزرگ (~۶۰۰KB) با منطق کامل محلی.',
    },
  },
  'index (8).html': {
    slug: 'fishkal-deep-catch',
    readme: {
      title: 'FISHKAL — Deep Catch (Single-file Edition)',
      desc: 'سفر سینمایی تعاملی ماهیگیری در ساحل دبی — نسخه تک‌فایل مستقل FISHKAL.',
      kit: ['HTML', 'Google Fonts'],
      notes: 'تک‌فایل؛ معادل مستقل نسخه وب FISHKAL.',
    },
  },
  'template-metatrader.html': {
    slug: 'trading-god-arena',
    readme: {
      title: 'Trading God Arena v10 — Elon Musk Edition',
      desc: 'شبیه‌ساز معاملاتی با ۸ خدای هوش مصنوعی، بتل‌آرنا، درخت مهارت و مشاور ایلان — دسکتاپ‌اپتیمایز.',
      kit: ['HTML', 'Vanilla JS'],
      notes: 'تک‌فایل (~۱۹۵KB)؛ بدون سرور.',
    },
  },
  'totarial-9router.html': {
    slug: 'guide-9router',
    readme: {
      title: '9Router — مرجع کامل فارسی',
      desc: 'راهنمای جامع 9Router: نصب، پروایدرها، Fallback سه‌لایه، Media Providers و بهینه‌سازی توکن — با رندر سه‌بعدي.',
      kit: ['HTML', 'Three.js', 'Tailwind CSS', 'Font Awesome'],
      notes: 'تک‌فایل آموزشی؛ احتمالاً نیازمند اتصال اینترنت برای CDN.',
    },
  },
  'totarial-Railway.html': {
    slug: 'guide-railway',
    readme: {
      title: 'DropRail — راهنمای پلن ۵ دلاری Railway',
      desc: 'راهنمای کامل پلن Hobby دلاری Railway: از ثبت‌نام تا استقرار، مقایسه پلن‌ها و ماشین‌حساب هزینه.',
      kit: ['HTML', 'Three.js'],
      notes: 'تک‌فایل آموزشی.',
    },
  },
};

let moved = 0, readmes = 0;
for (const [file, meta] of Object.entries(MAP)) {
  const src = path.join(DIR, file);
  if (!fs.existsSync(src)) { console.log('MISSING: ' + file); continue; }
  const folder = path.join(DIR, meta.slug);
  fs.mkdirSync(folder, { recursive: true });
  const dest = path.join(folder, 'index.html');
  fs.renameSync(src, dest);
  moved++;

  const r = meta.readme;
  const md = [
    '# ' + r.title,
    '',
    r.desc,
    '',
    '## Kit',
    '',
    r.kit.map(k => '- ' + k).join('\n'),
    '',
    '## اجرا',
    '',
    '```bash',
    '# مستقیم در مرورگر باز کنید، یا:',
    'python -m http.server 8000',
    '```',
    '',
    '> ' + r.notes,
    '',
  ].join('\n');
  fs.writeFileSync(path.join(folder, 'README.md'), md);
  readmes++;
  console.log('OK ' + file + ' -> ' + meta.slug + '/');
}
console.log('moved=' + moved + ' readmes=' + readmes);

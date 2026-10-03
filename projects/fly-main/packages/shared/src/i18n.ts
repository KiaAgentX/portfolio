/**
 * Localization architecture (roadmap Block C — §101 localization + RTL).
 * UI copy lives in dictionaries keyed by stable ids. `dir()` drives the
 * document direction: Persian/Arabic flip the whole layout to RTL.
 */
export type Lang = 'en' | 'fa';
export type Dir = 'ltr' | 'rtl';

const en = {
  'hero.headline': 'FRESH FROM THE SEA.',
  'hero.sub': 'Discover Fishkal.',
  'hero.cta': 'EXPLORE',
  'boat.headline': 'HOW DEEP CAN YOU GO?',
  'boat.sub': 'The Fishkal boat leaves the marina at dawn.',
  'boat.cta': 'START THE JOURNEY',
  'underwater.sub': 'Every depth hides a different catch.',
  'game.sub': 'Descend, dodge the sharks, hook the legendary Royal Dhow Grouper.',
  'game.cta': 'PLAY NOW',
  'game.invite': 'READY TO CATCH?',
  'shop.headline': 'FROM THE OCEAN TO YOUR TABLE.',
  'shop.sub': 'Fresh catches, delivered across Dubai. (Shop opens at launch.)',
  'shop.cta': 'SHOP FRESH FISH',
  'loading.tagline': 'Diving…',
  'results.playAgain': 'Play Again',
  'game.title': 'FISHKAL: DEEP CATCH',
  'game.howto': 'Drag / A-D / ← → to steer. The hook sinks on its own. When a fish bites: hold mouse / Space to reel, release to rest — drain its stamina before the line snaps.',
  'hud.score': 'SCORE',
  'hud.depth': 'DEPTH',
  'hud.fish': 'FISH',
  'hud.line': 'LINE',
  'results.complete': 'DIVE COMPLETE',
  'results.record': 'NEW RECORD!',
  'results.serverScore': 'Server Score',
  'results.maxDepth': 'Max Depth',
  'results.fish': 'Fish',
  'results.combo': 'Best Combo',
  'results.credits': 'Credits',
  'panel.close': 'CLOSE',
  'shop.title': 'UPGRADES',
  'shop.balance': 'credits — upgrades apply from your next dive.',
  'shop.buy': 'BUY',
  'shop.max': 'MAX',
  'shop.level': 'Lv',
  'missions.title': 'MISSIONS',
  'missions.claim': 'CLAIM',
  'missions.claimed': 'CLAIMED',
  'missions.empty': 'Missions load after your first dive.',
  'collection.title': 'COLLECTION',
  'missions.first.title': 'First Catch',
  'missions.first.desc': 'Land your first fish',
  'missions.ten.title': 'Deckhand',
  'missions.ten.desc': 'Land 10 fish (total)',
  'missions.depth.title': 'Down Where It\'s Deeper',
  'missions.depth.desc': 'Reach 200m depth',
  'missions.score.title': 'Local Legend',
  'missions.score.desc': 'Score 500 in one dive',
} as const;

export type StringKey = keyof typeof en;

const fa: Record<StringKey, string> = {
  'hero.headline': 'تازه از دل دریا.',
  'hero.sub': 'کشف فیشکال',
  'hero.cta': 'کاوش کن',
  'boat.headline': 'چقدر می‌توانی عمیق بروی؟',
  'boat.sub': 'لنج فیشکال سحرگاهان از اسکله دور می‌شود.',
  'boat.cta': 'سفر را شروع کن',
  'underwater.sub': 'در هر عمق، صیدی متفاوت پنهان است.',
  'game.sub': 'شیرجه بزن، از کوسه‌ها فرار کن، گروهر افسانه‌ای را قلاب کن.',
  'game.cta': 'همین حالا بازی کن',
  'game.invite': 'آماده‌ی صید هستی؟',
  'shop.headline': 'از اقیانوس تا سفره‌ی شما.',
  'shop.sub': 'صید تازه، تحویل در سراسر دبی. (فروشگاه در زمان افتتاح).',
  'shop.cta': 'خرید ماهی تازه',
  'loading.tagline': 'در حال شیرجه…',
  'results.playAgain': 'بازی دوباره',
  'game.title': 'فیشکال: صید عمیق',
  'game.howto': 'با کشیدن یا A-D هدایت کن. قلاب خودش فرو می‌رود. وقتی ماهی گیر کرد: دکمه‌ی ماوس یا Space را نگه دار تا قرقره بچرخد، رها کن تا استراحت کند — پیش از پاره شدن نخ، استقامتش را خالی کن.',
  'hud.score': 'امتیاز',
  'hud.depth': 'عمق',
  'hud.fish': 'ماهی',
  'hud.line': 'نخ',
  'results.complete': 'شیرجه تمام شد',
  'results.record': 'رکورد جدید!',
  'results.serverScore': 'امتیاز سرور',
  'results.maxDepth': 'بیشترین عمق',
  'results.fish': 'ماهی',
  'results.combo': 'بهترین کمبو',
  'results.credits': 'سکه',
  'panel.close': 'بستن',
  'shop.title': 'ارتقاءها',
  'shop.balance': 'سکه — ارتقاءها از شیرجه‌ی بعدی اعمال می‌شوند.',
  'shop.buy': 'خرید',
  'shop.max': 'حداکثر',
  'shop.level': 'سطح',
  'missions.title': 'ماموریت‌ها',
  'missions.claim': 'دریافت',
  'missions.claimed': 'دریافت شد',
  'missions.empty': 'ماموریت‌ها بعد از اولین شیرجه فعال می‌شوند.',
  'collection.title': 'کتاب صید',
  'missions.first.title': 'اولین صید',
  'missions.first.desc': 'اولین ماهی را بیرون بکش',
  'missions.ten.title': 'خدمه‌ی کشتی',
  'missions.ten.desc': '۱۰ ماهی بگیر (مجموع)',
  'missions.depth.title': 'جایی که عمیق‌تر است',
  'missions.depth.desc': 'به عمق ۲۰۰ متر برس',
  'missions.score.title': 'افسانه‌ی محل',
  'missions.score.desc': 'در یک شیرجه ۵۰۰ امتیاز بگیر',
};

const dicts: Record<Lang, Record<StringKey, string>> = { en, fa };

export function t(lang: Lang, key: StringKey): string {
  return dicts[lang][key] ?? en[key] ?? key;
}

export function dir(lang: Lang): Dir {
  return lang === 'fa' ? 'rtl' : 'ltr';
}

export const LANGS: { id: Lang; label: string }[] = [
  { id: 'en', label: 'EN' },
  { id: 'fa', label: 'فا' },
];

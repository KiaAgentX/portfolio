/**
 * FISHKAL Telegram Bot — Phase 1 skeleton (spec §36).
 * Commands: /start /game /leaderboard /help with Mini App deep links.
 * Without TELEGRAM_BOT_TOKEN the bot exits quietly (dev-safe).
 */
import { Bot, InlineKeyboard } from 'grammy';

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.log('[bot] TELEGRAM_BOT_TOKEN not set — bot disabled. Set it in .env to enable.');
  process.exit(0);
}

const miniAppUrl = process.env.MINI_APP_URL ?? 'https://example.com';

const bot = new Bot(token);

bot.command('start', (ctx) =>
  ctx.reply(
    [
      '🌊 *Welcome to FISHKAL* — Dubai\u2019s premium seafood market.',
      '',
      'Dive into *FISHKAL: DEEP CATCH*, hook legendary fish, climb the leaderboard',
      'and enjoy fresh catches from the ocean to your table.',
      '',
      'Tap the button below to open the Mini App.',
    ].join('\n'),
    {
      parse_mode: 'Markdown',
      reply_markup: new InlineKeyboard().webApp('🎮 PLAY DEEP CATCH', `${miniAppUrl}/game`),
    },
  ),
);

bot.command('game', (ctx) =>
  ctx.reply('🎣 Ready to dive?', {
    reply_markup: new InlineKeyboard().webApp('OPEN THE GAME', `${miniAppUrl}/game`),
  }),
);

bot.command('leaderboard', (ctx) =>
  ctx.reply('🏆 Top anglers of the week:', {
    reply_markup: new InlineKeyboard().webApp('VIEW LEADERBOARD', `${miniAppUrl}/leaderboard`),
  }),
);

bot.command('help', (ctx) =>
  ctx.reply(
    [
      '*Commands*',
      '/start — welcome + Mini App link',
      '/game — open Deep Catch',
      '/leaderboard — weekly top anglers',
      '/help — this message',
    ].join('\n'),
    { parse_mode: 'Markdown' },
  ),
);

bot.catch((err) => console.error('[bot] error:', err.error));

bot.start({
  onStart: (me) => console.log(`[bot] @${me.username} is running (long polling).`),
});

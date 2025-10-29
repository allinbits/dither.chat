import type { Context } from 'telegraf';

import type { Post } from '../types/feed.js';

import process from 'node:process';

import { Markup, Telegraf } from 'telegraf';

import { telegramConfig } from './config.js';
import { logger } from './logger.js';
import { compressHash, decompressHash } from './utils.js';

const telegramErrors = {
  cannot_initiate: 'Forbidden: bot can\'t initiate conversation with a user',
};

const chatId = telegramConfig.telegram.chatId;
const bot = new Telegraf(telegramConfig.telegram.botToken);

/**
 * Send a message to the Telegram channel with action buttons.
 */
export async function sendMessageToChannel(post: Post) {
  const text = `From: ${post.author}\n\n${post.message}`;
  const encodedHash = compressHash(post.hash);

  try {
    await bot.telegram.sendMessage(
      chatId,
      text,
      Markup.inlineKeyboard([
        [Markup.button.callback('💬 Reply', `reply:${encodedHash}`)],
        [
          Markup.button.callback('👍', `like:${encodedHash}`),
          Markup.button.callback('👎', `dislike:${encodedHash}`),
        ],
      ]),
    );
    logger.info(`Message sent to Telegram for post hash: ${post.hash}`);
  } catch (error) {
    logger.error(`Failed to send message to Telegram: ${(error as Error).message}`);
    throw error;
  }
}

/**
 * Send a private message to a user with a sign action link.
 */
async function sendMessageToUser(userId: number, action: string, hash: string) {
  const actionLabel = action.charAt(0).toUpperCase() + action.slice(1);
  const message = `Visit the link below to complete your ${action} action:`;
  const buttonUrl = `${telegramConfig.webApp.url}/${action}?hash=${hash}`;

  await bot.telegram.sendMessage(
    userId,
    message,
    Markup.inlineKeyboard([Markup.button.url(`Sign ${actionLabel}`, buttonUrl)]),
  );
}

bot.command('feed', async (ctx) => {
  const username = ctx.from.username || ctx.from.first_name;
  logger.info(`User "${username}" requested feed link`);

  await ctx.reply(`Join our Dither feed channel: @ditherbottest`);
});

bot.command('keplr', async (ctx) => {
  await ctx.reply(`To link your wallet, please visit:`, Markup.inlineKeyboard([
    Markup.button.url('Connect Wallet', `https://deeplink.keplr.app/web-browser?url=https://dither.chat`),
  ]));
});

bot.help((ctx) => {
  const helpMessage = `
Available commands:
/feed - Get the Dither feed channel link
/app - Open the Dither Web App
/keplr - Link your Keplr wallet
  `.trim();

  ctx.reply(helpMessage);
});
bot.command('app', ctx => sendMiniAppLink(ctx, 'Open the Dither Web App below:'));

bot.start(ctx => sendMiniAppLink(ctx, 'Welcome to Dither! Open the Web App below to get started.'));

bot.on('callback_query', async (ctx) => {
  const data = (ctx.callbackQuery as any).data;
  const userId = ctx.from.id;
  const username = ctx.from.username || ctx.from.first_name;

  if (!data) return;

  const [action, b64hash] = data.split(':');
  const hash = decompressHash(b64hash);

  try {
    await sendMessageToUser(userId, action, hash);
  } catch (error) {
    const description = (error as any).description || (error as Error).message;
    logger.error(`Failed to send private message to user "${username}": ${description}`);

    if (description === telegramErrors.cannot_initiate) {
      await ctx.answerCbQuery(
        `To use this feature, you must start our bot first. Please go to "${telegramConfig.telegram.botUsername}" and click "Start", then try again.`,
        {
          show_alert: true,
        },
      );
    }
  }
});

async function sendMiniAppLink(ctx: Context, message: string) {
  await ctx.reply(
    message,
    Markup.inlineKeyboard([Markup.button.webApp('Open Web App', telegramConfig.webApp.url)]),
  );
}

export async function startBot() {
  if (!telegramConfig.telegram.botToken) {
    logger.warn('Telegram bot token is not set. Skipping bot startup.');
    return;
  }

  await bot.telegram.setMyCommands([
    { command: 'feed', description: 'Get the Dither feed channel link' },
    {
      command: 'app',
      description: 'Open the Dither Web App',
    },
    { command: 'keplr', description: 'Link your Keplr wallet' },
    { command: 'help', description: 'Show help information' },
  ]);

  bot.launch();
  logger.info('Telegram bot started');

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

export function stopBot() {
  bot.stop();
  logger.info('Telegram bot stopped');
}

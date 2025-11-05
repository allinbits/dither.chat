import { Buffer } from 'node:buffer';

import { RateLimiter } from 'limiter';
import { Markup, Telegraf } from 'telegraf';

import logger from '../logger';

// Dither post.
type Post = Record<string, any>; // TODO: Create a package that defines the post type and deals with TG message send

// Publisher defines an interface for Dither message publishers
export interface Publisher<T = unknown> {
  // Publishes a Dither message
  publish: (msg: T) => Promise<void>;
}

// ConsolePublisher prints Dither messages to console
export class ConsolePublisher implements Publisher<Post> {
  async publish(msg: Post): Promise<void> {
    if (msg) {
      logger.info('Post', { msg });
    }
  }
}

// NopePublisher is a test publisher that doesn't publish messages.
export class NopePublisher implements Publisher {
  async publish(): Promise<void> {}
}

// TelegramPublisher publishes Dither messages in Telegram
export class TelegramPublisher implements Publisher<Post> {
  private bot: Telegraf;
  private chatId: string;
  private limiter: RateLimiter;
  private burst: RateLimiter;

  constructor(token: string, chatId: string) {
    this.chatId = chatId;
    this.bot = new Telegraf(token);

    // Limit to 20 messages per minute, with bursts of 1 message per second.
    // https://core.telegram.org/bots/faq#my-bot-is-hitting-limits-how-do-i-avoid-this
    this.limiter = new RateLimiter({ tokensPerInterval: 20, interval: 'minute' });
    this.burst = new RateLimiter({ tokensPerInterval: 1, interval: 'second' });
  }

  async publish(post: Post): Promise<void> {
    // Skip removed posts
    if (post.removed_at) {
      return;
    }

    await this.burst.removeTokens(1);
    await this.limiter.removeTokens(1);

    // Compresses hash to fit within Telegram's 64-byte callback_data limit.
    // See https://core.telegram.org/bots/api#inlinekeyboardbutton
    const encodedHash = Buffer.from(post.hash, 'hex').toString('base64url');
    const text = `From: ${post.author}\n\n${post.message}`;

    // TODO: Use a common package for sending and formatting post messages
    await this.bot.telegram.sendMessage(
      this.chatId,
      text,
      Markup.inlineKeyboard([
        [Markup.button.callback('💬 Reply', `reply:${encodedHash}`)],
        [Markup.button.callback('👍', `like:${encodedHash}`), Markup.button.callback('👎', `dislike:${encodedHash}`)],
      ]),
    );
  }
}

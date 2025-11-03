import { Buffer } from 'node:buffer';

import { Markup, Telegraf } from 'telegraf';

// Publisher defines an interface for Dither message publishers
export interface Publisher {
  // Publishes a Dither message
  publish: (msg: any) => Promise<void>;
}

// ConsolePublisher prints Dither messages to console
export class ConsolePublisher implements Publisher {
  async publish(msg: any): Promise<void> {
    if (msg) {
      console.log(JSON.stringify(msg));
    }
  }
}

// NopePublisher is a test publisher that doesn't publish messages.
export class NopePublisher implements Publisher {
  async publish(_: any): Promise<void> {}
}

// TelegramPublisher publishes Dither messages in Telegram
export class TelegramPublisher implements Publisher {
  private bot: Telegraf;
  private chatId: string;

  constructor(token: string, chatId: string) {
    this.chatId = chatId;
    this.bot = new Telegraf(token);
  }

  async publish(post: any): Promise<void> {
    // Skip removed posts
    if (post.removed_at) {
      return;
    }

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

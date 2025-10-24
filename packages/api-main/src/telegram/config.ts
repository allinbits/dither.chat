export const telegramConfig = {
    telegram: {
        botUsername: process.env.TELEGRAM_BOT_USERNAME || '',
        botToken: process.env.TELEGRAM_BOT_TOKEN || '',
        chatId: process.env.TELEGRAM_FEED_CHANNEL_ID || '',
        channelLink: process.env.TELEGRAM_FEED_CHANNEL_NAME || '',
    },
    webApp: {
        url: process.env.TELEGRAM_MINIAPP_URL || '',
    },
};

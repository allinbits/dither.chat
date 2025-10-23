export const telegramConfig = {
    telegram: {
        botUsername: process.env.TELEGRAM_BOT_USERNAME || '',
        botToken: process.env.TELEGRAM_BOT_TOKEN || '',
        chatId: process.env.TELEGRAM_FEED_CHANNEL_ID || '',
        channelLink: process.env.TELEGRAM_FEED_CHANNEL_LINK || '',
    },
    webApp: {
        url: process.env.MINIAPP_URL || '',
    },
};

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

// TelegramPublisher publishes Dither messages in Telegram
export class TelegramPublisher implements Publisher {
  async publish(): Promise<void> {
    // TODO: Define how to publish to telegram (api app endpoint?)
    throw new Error('Telegram publishing not supported yet');
  }
}

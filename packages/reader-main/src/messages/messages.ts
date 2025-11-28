import type { ActionWithData, ResponseStatus } from '../types';

export type MessageHandler = (action: ActionWithData) => Promise<ResponseStatus>;
export type Handlers = Record<string, Record<string, MessageHandler>>;

// Messages keeps track of message handlers for different versions.
export class Messages {
  private handlers: Handlers;

  constructor(handlers: Handlers) {
    this.handlers = handlers;
  }

  // Registers messages for a specific version.
  register(version: string, handlers: Record<string, MessageHandler>) {
    this.handlers[version] = handlers;
  }

  // Gets a message handler by name for a specific version.
  get(version: string, name: string): MessageHandler | undefined {
    return this.handlers[version]?.[name];
  }

  // Lists registered versions.
  versions(): string[] {
    return Object.keys(this.handlers);
  }
}

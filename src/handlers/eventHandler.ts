import { BotClient } from "../client";
import { BotEvent } from "../types";

export function loadEvents(client: BotClient, events: BotEvent[]): void {
  for (const event of events) {
    const handler = (...args: unknown[]) =>
      Promise.resolve(event.execute(client, ...args)).catch((err) =>
        console.error(`Error in event "${event.name}":`, err)
      );
    if (event.once) {
      client.once(event.name, handler);
    } else {
      client.on(event.name, handler);
    }
    console.log(`Loaded event: ${event.name}`);
  }
}

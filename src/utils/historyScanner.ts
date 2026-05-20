import { Collection, GuildTextBasedChannel, Message } from "discord.js";

export async function scanHistoricalPlays(
  channel: GuildTextBasedChannel,
  trackId: string,
  beforeMessageId?: string
): Promise<Record<string, number>> {
  const trackPattern = new RegExp(`open\\.spotify\\.com/track/${trackId}(?:[/?]|$)`);
  const requests: Record<string, number> = {};
  let before: string | undefined = beforeMessageId;

  while (true) {
    const batch: Collection<string, Message> = await channel.messages.fetch(
      before ? { limit: 100, before } : { limit: 100 }
    );

    if (batch.size === 0) break;

    for (const msg of batch.values()) {
      if (
        !msg.author.bot &&
        msg.content.toLowerCase().startsWith("m!play") &&
        trackPattern.test(msg.content)
      ) {
        requests[msg.author.id] = (requests[msg.author.id] ?? 0) + 1;
      }
    }

    before = batch.last()!.id;
    if (batch.size < 100) break;
  }

  return requests;
}

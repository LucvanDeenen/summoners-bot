import { Message } from "discord.js";
import { BotClient } from "../client";
import { BotEvent } from "../types";
import { isNewTrack, setRequests, incrementUserRequest, totalRequests, buildScoreboard } from "../utils/songTracker";
import { scanHistoricalPlays } from "../utils/historyScanner";

const SPOTIFY_REGEX = /open\.spotify\.com\/track\/([A-Za-z0-9]+)/;

const event: BotEvent = {
  name: "messageCreate",
  async execute(_client: BotClient, message: Message) {
    if (message.author.bot) return;
    if (!message.inGuild()) return;

    if (!message.content.toLowerCase().startsWith("m!play")) return;

    const match = message.content.match(SPOTIFY_REGEX);
    if (!match) {
      return;
    }

    const trackId = match[1];
    const trackUrl = `https://open.spotify.com/track/${trackId}`;

    if (isNewTrack(trackId)) {
      let historical: Record<string, number> = {};
      try {
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("History scan timed out — bot may lack Read Message History permission")), 5000)
        );
        historical = await Promise.race([
          scanHistoricalPlays(message.channel, trackId, message.id),
          timeout,
        ]);
      } catch (err) {
        console.error("[msg] history scan skipped:", (err as Error).message);
      }
      setRequests(trackId, trackUrl, historical);
    }

    const entry = incrementUserRequest(trackId, trackUrl, message.author.id);
    const total = totalRequests(entry);

    if (total > 1) {
      await message.channel.send(buildScoreboard(entry));
    }
  },
};

export default event;

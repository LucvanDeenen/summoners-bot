import { Client, Collection, GatewayIntentBits } from "discord.js";
import { Command } from "./types";

export class BotClient extends Client {
  commands = new Collection<string, Command>();

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
  }
}

import { REST, Routes } from "discord.js";
import { BotClient } from "../client";
import { BotEvent } from "../types";
import { initCounts } from "../utils/songTracker";

const event: BotEvent = {
  name: "clientReady",
  once: true,
  async execute(client: BotClient) {
    console.log(`Logged in as ${client.user!.tag}`);
    initCounts();

    const rest = new REST().setToken(process.env.DISCORD_TOKEN!);
    const commandData = [...client.commands.values()].map((c) => c.data.toJSON());

    const route = process.env.GUILD_ID
      ? Routes.applicationGuildCommands(client.application!.id, process.env.GUILD_ID)
      : Routes.applicationCommands(client.application!.id);

    try {
      await rest.put(route, { body: commandData });
      console.log(`Registered ${commandData.length} slash command(s).`);
    } catch (err) {
      console.error("Failed to register commands:", err);
    }

    if (process.env.GUILD_ID) {
      try {
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        await guild.members.fetch();
        console.log(`Cached ${guild.memberCount} members.`);
      } catch (err) {
        console.error("Failed to fetch members:", err);
      }
    }
  },
};

export default event;

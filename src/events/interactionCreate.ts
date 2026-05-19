import { Interaction } from "discord.js";
import { BotClient } from "../client";
import { BotEvent } from "../types";

const event: BotEvent = {
  name: "interactionCreate",
  async execute(client: BotClient, interaction: Interaction) {
    if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      await command?.autocomplete?.(interaction);
      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(`Error executing /${interaction.commandName}:`, err);
      const msg = { content: "Something went wrong.", ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(msg);
      } else {
        await interaction.reply(msg);
      }
    }
  },
};

export default event;

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types";

const GREETINGS_PATH = join(__dirname, "../../data/greetings.json");

const data = new SlashCommandBuilder()
  .setName("add-greeting")
  .setDescription("Add a Dutch greeting to the summon DM pool")
  .addStringOption((option) =>
    option
      .setName("greeting")
      .setDescription("The greeting text — use {summoner} as a placeholder for the summoner's name")
      .setRequired(true)
  );

async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const greeting = interaction.options.getString("greeting", true);

  if (!greeting.includes("{summoner}")) {
    await interaction.reply({
      content: "Your greeting must include `{summoner}` as a placeholder for the summoner's name.",
      ephemeral: true,
    });
    return;
  }

  const greetings: string[] = JSON.parse(readFileSync(GREETINGS_PATH, "utf-8"));
  greetings.push(greeting);
  writeFileSync(GREETINGS_PATH, JSON.stringify(greetings, null, 2), "utf-8");

  await interaction.reply({
    content: `Greeting added! The pool now has **${greetings.length}** greeting(s).`,
    ephemeral: true,
  });
}

export const addGreeting: Command = { data, execute };

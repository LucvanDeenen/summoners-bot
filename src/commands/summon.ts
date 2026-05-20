import { readFileSync } from "fs";
import { join } from "path";
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { Command } from "../types";

const greetings: string[] = JSON.parse(
  readFileSync(join(__dirname, "../../data/greetings.json"), "utf-8")
);

const DM_MESSAGE = (summoner: string): string => {
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];
  return `"${greeting}" - ${summoner}`;
};

const data = new SlashCommandBuilder()
  .setName("summon")
  .setDescription("Send a DM to a server member to join")
  .addStringOption((option) =>
    option
      .setName("user")
      .setDescription("The member to summon")
      .setRequired(true)
      .setAutocomplete(true)
  );

async function autocomplete(interaction: AutocompleteInteraction): Promise<void> {
  const focused = interaction.options.getFocused().toLowerCase();

  const choices = interaction.guild!.members.cache
    .filter((m) => !m.user.bot)
    .filter(
      (m) =>
        focused === "" ||
        m.displayName.toLowerCase().includes(focused) ||
        m.user.username.toLowerCase().includes(focused)
    )
    .map((m) => ({ name: m.displayName, value: m.id }))
    .slice(0, 25);

  await interaction.respond(choices);
}

async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const targetId = interaction.options.getString("user", true);
  const target = await interaction.guild!.members.fetch(targetId).catch(() => null);

  if (!target) {
    await interaction.reply({ content: "Could not find that member.", ephemeral: true });
    return;
  }

  const summoner = interaction.member instanceof GuildMember
    ? interaction.member.displayName
    : interaction.user.username;

  try {
    await target.send(DM_MESSAGE(summoner));
    await interaction.reply(`Enne **${target.displayName}**!`);
  } catch {
    await interaction.reply({
      content: `Could not DM **${target.displayName}** — they may have DMs disabled.`,
      ephemeral: true,
    });
  }
}

export const summon: Command = { data, execute, autocomplete };

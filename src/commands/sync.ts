import { ChatInputCommandInteraction, GuildTextBasedChannel, SlashCommandBuilder } from "discord.js";
import { Command } from "../types";
import { setRequests, loadCounts, buildScoreboard } from "../utils/songTracker";
import { scanHistoricalPlays } from "../utils/historyScanner";

const SPOTIFY_REGEX = /open\.spotify\.com\/track\/([A-Za-z0-9]+)/;

const data = new SlashCommandBuilder()
  .setName("sync")
  .setDescription("Re-scan channel history and update play counts for a Spotify track")
  .addStringOption((option) =>
    option
      .setName("song")
      .setDescription("Spotify track link")
      .setRequired(true)
  );

async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const input = interaction.options.getString("song", true);
  const match = input.match(SPOTIFY_REGEX);

  if (!match) {
    await interaction.reply({ content: "Please provide a valid Spotify track link.", ephemeral: true });
    return;
  }

  const trackId = match[1];
  const trackUrl = `https://open.spotify.com/track/${trackId}`;

  await interaction.deferReply();

  const requests = await scanHistoricalPlays(
    interaction.channel as GuildTextBasedChannel,
    trackId
  );

  setRequests(trackId, trackUrl, requests);

  const entry = loadCounts()[trackId];
  if (!entry || Object.keys(entry.requests).length === 0) {
    await interaction.editReply("No plays found for this track in this channel.");
    return;
  }

  await interaction.editReply(buildScoreboard(entry));
}

export const sync: Command = { data, execute };

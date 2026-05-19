import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js";
import { BotClient } from "../client";

export interface Command {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}

export interface BotEvent {
  name: string;
  once?: boolean;
  execute: (client: BotClient, ...args: any[]) => Promise<void> | void;
}

export interface SongEntry {
  url: string;
  requests: Record<string, number>; // userId -> request count
}

export interface SongCounts {
  [trackId: string]: SongEntry;
}

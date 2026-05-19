import { BotClient } from "../client";
import { Command } from "../types";

export function loadCommands(client: BotClient, commands: Command[]): void {
  for (const command of commands) {
    client.commands.set(command.data.name, command);
    console.log(`Loaded command: /${command.data.name}`);
  }
}

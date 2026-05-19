import "dotenv/config";
import { BotClient } from "./client";
import { loadCommands } from "./handlers/commandHandler";
import { loadEvents } from "./handlers/eventHandler";

// Commands — add new commands here
import { summon } from "./commands/summon";

// Events — add new events here
import clientReady from "./events/clientReady";
import interactionCreate from "./events/interactionCreate";
import messageCreate from "./events/messageCreate";

const client = new BotClient();

loadCommands(client, [summon]);
loadEvents(client, [clientReady, interactionCreate, messageCreate]);

client.on("error", (err) => console.error("Client error:", err));

client.login(process.env.DISCORD_TOKEN);

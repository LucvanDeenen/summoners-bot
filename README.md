# Summon Bot

A Discord bot with two features:
- **Summon** — send a DM to any server member via a slash command with autocomplete
- **Song tracker** — track how many times each Spotify track has been requested via `m!play`, with a per-user scoreboard

## Features

### `/summon`
Type `/summon` in any channel and select a member from the autocomplete dropdown. The bot sends them a private DM asking them to join. Works with display names containing spaces.

### Song request tracker
Whenever someone uses `m!play <spotify-url>`, the bot records who requested it. From the second request onwards, it posts a scoreboard in the channel:

```
🎵 This track has been requested 4 times in this server!
🥇 @Luc — 2 times
🥈 @Colin — 1 time
🥉 @Maud — 1 time
```

On the first request of a new track, the bot scans the channel's message history to backfill any plays that happened before the bot was running.

## Setup

### 1. Create a Discord application

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Click **New Application** and give it a name
3. Go to **Bot** and click **Reset Token** — copy the token
4. Under **Privileged Gateway Intents**, enable:
   - **Server Members Intent**
   - **Message Content Intent**

### 2. Invite the bot to your server

1. Go to **OAuth2 → URL Generator**
2. Select scopes: `bot` and `applications.commands`
3. Select bot permissions: `Send Messages`, `Read Messages/View Channels`, `Read Message History`
4. Open the generated URL and add the bot to your server

### 3. Configure environment variables

Copy the example and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DISCORD_TOKEN` | Your bot token from the Developer Portal |
| `GUILD_ID` | Your server ID (right-click server → Copy Server ID). Enables instant slash command registration |

### 4. Install dependencies

```bash
npm install
```

### 5. Run the bot

```bash
# Development (no build step required)
npm run dev

# Production
npm run build
npm start
```

## Project structure

```
src/
├── commands/          # Slash commands — add a new file here to add a command
│   └── summon.ts
├── events/            # Discord event handlers — add a new file here to handle an event
│   ├── clientReady.ts
│   ├── interactionCreate.ts
│   └── messageCreate.ts
├── handlers/
│   ├── commandHandler.ts   # Loads commands into the client
│   └── eventHandler.ts     # Registers events on the client
├── utils/
│   ├── songTracker.ts      # Read/write song-counts.json
│   └── historyScanner.ts   # Scans channel history for past plays
├── types/
│   └── index.ts            # Shared TypeScript interfaces
├── client.ts               # Extended Discord.js Client with commands collection
└── index.ts                # Entry point — register commands and events here
data/
└── song-counts.json        # Auto-created at runtime, gitignored
```

## Extending the bot

### Adding a new slash command

1. Create `src/commands/yourCommand.ts` and export a `Command` object:

```ts
import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../types";

const data = new SlashCommandBuilder()
  .setName("yourcommand")
  .setDescription("Does something");

async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.reply("Hello!");
}

export const yourCommand: Command = { data, execute };
```

2. Register it in `src/index.ts`:

```ts
import { yourCommand } from "./commands/yourCommand";
loadCommands(client, [summon, yourCommand]);
```

### Adding a new event handler

1. Create `src/events/yourEvent.ts` and export a `BotEvent` object:

```ts
import { BotEvent } from "../types";

const event: BotEvent = {
  name: "guildMemberAdd",
  async execute(_client, member) {
    console.log(`${member.user.username} joined`);
  },
};

export default event;
```

2. Register it in `src/index.ts`:

```ts
import yourEvent from "./events/yourEvent";
loadEvents(client, [clientReady, interactionCreate, messageCreate, yourEvent]);
```

## Customising the DM message

Edit the `DM_MESSAGE` function at the top of `src/commands/summon.ts`:

```ts
const DM_MESSAGE = (summoner: string) =>
  `Hey! **${summoner}** is summoning you — come join us in Discord! 👋`;
```

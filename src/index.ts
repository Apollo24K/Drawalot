import { Client, GatewayIntentBits, Partials, Options, Collection } from "discord.js";
import { BotHandler, Command, IAnimeInfo, ICharacterInfo, SlashCommand, GuildActivity, BanSchema } from "./types";
import { config } from "dotenv";
import { readdirSync } from "fs";
import { join } from "path";
config();

const tokens: { token: string, id: string; }[] = process.env.TOKENS.split(",").map((token, index) => ({ token, id: process.env.CLIENT_IDS.split(",")[index] }));

const clients = tokens.map(() => new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel],
    makeCache: Options.cacheWithLimits({
        MessageManager: 0,
        UserManager: 0,
    }),
    shards: "auto",
}));

clients.forEach((client, index) => {
    client.login(tokens[index].token);

    client.id = tokens[index].id;
    client.token = tokens[index].token;

    client.bannedUsers = new Collection<string, BanSchema>();
    client.slashCommands = new Collection<string, SlashCommand>();
    client.commands = new Collection<string, Command>();
    client.activities = new Collection<string, GuildActivity>();
    client.cooldowns = new Collection<string, number>();
    client.anime = new Collection<number, IAnimeInfo>();
    client.characters = new Collection<number, ICharacterInfo>();

    const handlersDir = join(__dirname, "./handlers");
    readdirSync(handlersDir).forEach(handler => {
        if (!handler.endsWith(".js")) return;
        let event: BotHandler = require(`${handlersDir}/${handler}`).default;
        if (!event.disabled && (index === 0 || !event.once)) event.execute(client);
    });
});

// Don't crash :mikuhappy:
process.on('uncaughtException', error => {
    console.log(error.stack);
});

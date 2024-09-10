import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";

const command = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Shows the bot's ping");

const exportCommand: SlashCommand = {
    command,
    cooldown: 3,
    execute: ({ interaction }) => {
        return interaction.reply({ content: `pong! 🏓 ${interaction.client.ws.ping}ms` });
    },
};

export default exportCommand;

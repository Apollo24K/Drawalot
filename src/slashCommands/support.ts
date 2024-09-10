import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import { botPfp, embedColor, Links } from "../shared/components";

const command = new SlashCommandBuilder()
    .setName('support')
    .setDescription('Get support information for the bot');

const exportCommand: SlashCommand = {
    command,
    cooldown: 3,
    execute: async ({ interaction }) => {
        const Embed = new EmbedBuilder()
            .setTitle('Drawalot Support')
            .setColor(embedColor)
            .setThumbnail(botPfp)
            .setDescription(`Drawalot is a [Camelot](<${Links.Camelot}>) spin-off. You can reach us through our Discord or GitHub if you need help, or to help us improve the bot!\n\nDiscord Server: <${Links.Support}>\nGitHub Repository: <${Links.Github}>`)
            .setFooter({ text: `Drawalot V${process.env.VERSION} • Made by Apollo24`, iconURL: "https://i.imgur.com/syj1LqO.jpeg" });

        return interaction.reply({ embeds: [Embed] });
    },
};

export default exportCommand;

import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import { botPfp, embedColor } from "../shared/components";

const command = new SlashCommandBuilder()
    .setName('server')
    .setDescription('View server stats');

const exportCommand: SlashCommand = {
    command,
    cooldown: 5,
    async execute({ interaction, server }) {
        if (!interaction.guild || !server.schema) return interaction.reply({ content: "This command can only be used in a server", ephemeral: true });

        const Embed = new EmbedBuilder()
            .setTitle(`${interaction.guild.name}`)
            .setColor(embedColor)
            .setThumbnail(interaction.guild.iconURL({ size: 2048 }) ?? botPfp)
            .setDescription(
                `**Prefix**: \`${server.schema.prefix ?? process.env.PREFIX}\`\n` +
                `**Members**: ${interaction.guild.memberCount} | **Players**: ${server.schema.user_ids.length}\n` +
                `**Activity Drops Channel**: ${server.schema.drop_channel ? `<#${server.schema.drop_channel}>` : "Not set, use `/setup channel`"}\n` +
                `**Cards Can Drop Anywhere**: ${server.schema.allow_global_drops ? "True" : "False"}\n\n` +
                `💎 **Server Premium**: Tier ${server.schema.premium}${server.schema.premium === 0 ? "" : ` (${server.schema.premium_expires ? `Expires: <t:${Math.floor(server.schema.premium_expires.getTime() / 1000)}:d>` : "Active"})`}`
            )
            .setFooter({ text: `Drawalot Bot V${process.env.VERSION} • Made by Apollo24`, iconURL: "https://i.imgur.com/RbLjdQ4.png" });
        return interaction.reply({ embeds: [Embed] });
    },
};

export default exportCommand;

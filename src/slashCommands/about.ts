import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommand, UserSchema } from "../types";
import { query } from "../postgres";
import { botPfp, embedColor, Links } from "../shared/components";

const command = new SlashCommandBuilder()
    .setName('about')
    .setDescription('Info about the bot');

function pad(s: number): string {
    return (s < 10 ? '0' : '') + s;
};

function format(sec: number): string {
    let hours = Math.floor(sec / (60 * 60));
    let minutes = Math.floor(sec % (60 * 60) / 60);
    let seconds = Math.floor(sec % 60);

    return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
};

const exportCommand: SlashCommand = {
    command,
    cooldown: 3,
    async execute({ interaction }) {
        const [stats] = await query(`SELECT COUNT(*) AS players FROM users`) as Array<UserSchema & { players: number; }>;

        const Embed = new EmbedBuilder()
            .setTitle('Drawalot')
            .setColor(embedColor)
            .setThumbnail(botPfp)
            .setFooter({ text: `Drawalot V${process.env.VERSION} • Made by Apollo24`, iconURL: "https://i.imgur.com/syj1LqO.jpeg" })
            .setDescription(`A [Camelot](<${Links.Camelot}>) spin-off. Draw from a pool of characters from various anime, manga, and games. Collect and evolve characters to become the strongest!\n\nDrawalot's code is accessible at our [GitHub](<${Links.Github}>). Contributions are welcome, please see our [LICENSE](<${Links.License}>) if you're interested!`)
            .addFields(
                { name: "Stats", value: `Servers: **${interaction.client.guilds.cache.size}**\nPlayers: **${stats.players}**`, inline: true },
                { name: '_ _', value: `RAM Usage: **${Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 10) / 10} MB**\nUptime: **${format(process.uptime())}**`, inline: true },
            );
        return interaction.reply({ embeds: [Embed] });
    },
};

export default exportCommand;

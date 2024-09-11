import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { SlashCommand } from "../types";
import { activityDropRates, botPfp, embedColor, rarityEmoji } from "../shared/components";

const command = new SlashCommandBuilder()
    .setName('help')
    .setDescription('View command list or get help for a specific command')
    .addStringOption(option =>
        option.setName('command')
            .setDescription('Get help for a specific command')
            .setRequired(false));

const exportCommand: SlashCommand = {
    command,
    cooldown: 2,
    execute: async ({ interaction }) => {
        let helpCommand = interaction.options.getString('command') ?? "";

        if (!helpCommand) {
            const Embed = new EmbedBuilder()
                .setTitle('Command List')
                .setColor(embedColor)
                .setThumbnail(botPfp)
                .setDescription("Use `/help <command name>` for more information")
                .addFields(
                    { name: "🎴 Card Game", value: "`/draw` `/cd` `/info` `/inventory` `/search` `/rush`\n`/fav` `/setup channel` `/profile` `/reset draws`" },
                    { name: "💰 Economy", value: "`/balance` `/daily` `/convert`" },
                    // { name: "🎭 Fun", value: "Nothing yet" },
                    { name: "💎 Premium", value: "`/premium` `/shop`" },
                    { name: "🎐 Other", value: "`/help` `/support` `/about` `/server` `/ping`" }
                )
                .setFooter({ text: `Drawalot V${process.env.VERSION} • Made by Apollo24`, iconURL: "https://i.imgur.com/RbLjdQ4.png" });
            return interaction.reply({ embeds: [Embed] });
        };

        // Help command shortcuts
        switch (helpCommand) {
            case "ad": helpCommand = "activity drops"; break;
        };

        // Help pages
        const command = interaction.client.slashCommands.get(helpCommand) || interaction.client.commands.get(helpCommand) || interaction.client.commands.find((command) => command.aliases.includes(helpCommand));
        const Embed = new EmbedBuilder()
            .setTitle(`Help: ${command ? "/" : ""}${helpCommand}`)
            .setColor(embedColor)
            .setThumbnail(botPfp)
            .setFooter({ text: `Drawalot V${process.env.VERSION} • Made by Apollo24`, iconURL: "https://i.imgur.com/RbLjdQ4.png" });

        // Try to match the help page
        switch (helpCommand) {
            case 'about': Embed.setDescription("Info about the bot, including its reach and server stats."); break;
            case 'activity drops':
                const slashCmds = await interaction.client.application?.commands.fetch();
                const slashCmd = slashCmds?.find(e => e.name === "setup");
                Embed.setDescription(
                    `Activity drops can be set up using ${slashCmd ? `</setup channel:${slashCmd.id}>` : "`/setup channel`"}. After that, cards will regularly drop in the specified channel, which can be claimed by anyone in the server.\n\n` +
                    `**Drop Rates**: (for server premium tier \`0 | 1 | 2 | 3\`)\n` +
                    `${rarityEmoji[0]}\`Common    ➜ ${activityDropRates.map(tier => `${(tier[0].rate * 100).toFixed(2).padStart(5, '0')}%`).join(' | ')}\`\n` +
                    `${rarityEmoji[1]}\`Uncommon  ➜ ${activityDropRates.map(tier => `${(tier[1].rate * 100).toFixed(2).padStart(5, '0')}%`).join(' | ')}\`\n` +
                    `${rarityEmoji[2]}\`Rare      ➜ ${activityDropRates.map(tier => `${(tier[2].rate * 100).toFixed(2).padStart(5, '0')}%`).join(' | ')}\`\n` +
                    `${rarityEmoji[3]}\`Epic      ➜ ${activityDropRates.map(tier => `${(tier[3].rate * 100).toFixed(2).padStart(5, '0')}%`).join(' | ')}\`\n` +
                    `${rarityEmoji[4]}\`Legendary ➜ ${activityDropRates.map(tier => `${(tier[4].rate * 100).toFixed(2).padStart(5, '0')}%`).join(' | ')}\`\n` +
                    `${rarityEmoji[5]}\`Divine    ➜ ${activityDropRates.map(tier => `${(tier[5].rate * 100).toFixed(2).padStart(5, '0')}%`).join(' | ')}\`\n` +
                    `${rarityEmoji[6]}\`Exalted   ➜ ${activityDropRates.map(tier => `${(tier[6].rate * 100).toFixed(2).padStart(5, '0')}%`).join(' | ')}\`\n\n` +
                    `**Events**: The below buttons may appear on drops\n` +
                    `🎲 ➜ Shuffles button positions\n`
                ); break;
            default: Embed.setDescription(command ? "Detailed help for this command is not available yet" : "Help page not found"); break;
        };

        return interaction.reply({ embeds: [Embed] });
    },
};

export default exportCommand;

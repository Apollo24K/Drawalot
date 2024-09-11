import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import { query } from "../postgres";
import { Links } from "../shared/components";

const command = new SlashCommandBuilder()
    .setName('reset')
    .setDescription('Resets the specified counter')
    .addSubcommand(subcommand =>
        subcommand
            .setName('draws')
            .setDescription('Resets your draw count')
            .addIntegerOption(option =>
                option
                    .setName('amount')
                    .setDescription('The amount of draw resets to use (each reset gives 8 draws)')
                    .setMinValue(1)
                    .setMaxValue(1000)
                    .setRequired(false)
            )
    );

const exportCommand: SlashCommand = {
    command,
    cooldown: 0,
    async execute({ interaction, author }) {

        const amount = interaction.options.getInteger('amount') ?? 1;

        if (interaction.options.getSubcommand() === 'draws') {
            if (author.query.drawresets < amount) return interaction.reply({ content: `You don't have enough draw resets (**${author.query.drawresets}**/${amount}). You can get more by [voting](<${Links.Vote}>) for the bot!`, ephemeral: true });

            await query('UPDATE users SET draws = draws - (8 * $1), drawresets = drawresets - $1 WHERE id = $2', [amount, author.query.id]);

            return interaction.reply({ content: `You have reset your draw count ${amount} times.`, ephemeral: true });
        };

    },
};

export default exportCommand;

import { ComponentType, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import { query } from "../postgres";
import { Emojis, OfferRow } from "../shared/components";
import { queryUserSchema } from "../functions";

const command = new SlashCommandBuilder()
    .setName('convert')
    .setDescription('Convert between different resources')
    .addSubcommand(subcommand =>
        subcommand
            .setName('jades')
            .setDescription('Convert jades to gems')
            .addStringOption(option =>
                option.setName('amount')
                    .setDescription('Amount of jades to convert (1 Jade = 1 Gem) | Keywords: max')
                    .setRequired(false)
            )
    );

const exportCommand: SlashCommand = {
    command,
    cooldown: 3,
    async execute({ interaction, author }) {

        // Convert jades to gems
        if (interaction.options.getSubcommand() === 'jades') {
            const amountInput = interaction.options.getString('amount') ?? "max";
            const amount = (amountInput.toLowerCase() === "max") ? author.query.jades : (parseInt(amountInput) || 1);

            // return if
            if (author.query.jades === 0) return interaction.reply(`You don't have any jades ${Emojis.Jade}`);
            if (amount < 1) return interaction.reply(`You can't convert **${amount}**${Emojis.Jade}`);
            if (amount > 100000) return interaction.reply(`You can't convert more than **100000**${Emojis.Jade} at once`);
            if (amount > author.query.jades) return interaction.reply(`You don't have enough jades (**${author.query.jades}**/${amount}${Emojis.Jade})`);

            return interaction.reply({ content: `Are you sure you want to convert **${amount}**${Emojis.Jade} to **${amount}**${Emojis.Gem}`, components: [OfferRow], fetchReply: true }).then(msg => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 120000 });

                collector.on('collect', async r => {
                    collector.stop();
                    if (r.customId === "cancel") return interaction.channel?.send("Action cancelled");

                    const stats = await queryUserSchema(interaction.user.id);
                    if (!stats) return;
                    if (amount > stats.jades) return interaction.channel?.send(`You don't have enough jades (**${stats.jades}**/${amount}${Emojis.Jade})`);

                    await query('UPDATE users SET jades = jades - $1, gems = gems + $1 WHERE id = $2', [amount, interaction.user.id]);

                    interaction.channel?.send(`Successfully converted **${amount}**${Emojis.Jade} to **${amount}**${Emojis.Gem}`);
                });
            });
        };

    },
};

export default exportCommand;

import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import { query } from "../postgres";
import { getInventoryCharacter, search } from "../functions";

const command = new SlashCommandBuilder()
    .setName('fav')
    .setDescription('Set your favorite character')
    .addStringOption(option =>
        option.setName('character')
            .setDescription('The name of the character')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('code')
            .setDescription('The unique code of the character')
            .setRequired(true));

const exportCommand: SlashCommand = {
    command,
    cooldown: 5,
    async execute({ interaction }) {

        const choice = interaction.options.getString('character', true);
        const code = interaction.options.getString('code', true);

        // Search for the character
        const character = search(choice, interaction);
        if (!character) return;

        // Get the existing character
        const char = await getInventoryCharacter(interaction, character, code);
        if (!char) return interaction.reply({ content: "Invalid code", ephemeral: true });
        if (char.userId !== interaction.user.id) return interaction.reply({ content: "This is not your character", ephemeral: true });

        // Update users set fav
        await query(`UPDATE users SET fav_char = $1 WHERE id = $2`, [char.rowid, interaction.user.id]);

        const Embed = new EmbedBuilder()
            .setColor(char.rarityColor)
            .setImage(char.imageUrl)
            .setDescription(`Favorite character set to\n**${char.name}**\`#${code}\``);
        return interaction.reply({ embeds: [Embed] });
    },
};

export default exportCommand;

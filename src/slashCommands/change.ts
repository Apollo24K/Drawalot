import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { SlashCommand } from "../types";
import { botPfp, embedColor, rarityEmojis } from "../shared/components";
import { getInventoryCharacter, search } from "../functions";
import { query } from "../postgres";

const command = new SlashCommandBuilder()
    .setName('change')
    .setDescription('Commands to change settings or properties')
    .addSubcommand(subcommand =>
        subcommand
            .setName('code')
            .setDescription('Change the unique code of a character')
            .addStringOption(option =>
                option.setName('character')
                    .setDescription('The name of the character')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('old-code')
                    .setDescription('The unique code of your character')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('new-code')
                    .setDescription('The new code you want to use')
                    .setRequired(true))
    );

const validB64Chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/';

const exportCommand: SlashCommand = {
    command,
    cooldown: 5,
    async execute({ interaction, author }) {

        if (interaction.options.getSubcommand() === 'code') {

            // Return if not premium
            if (author.query.premium < 2) return interaction.reply({ content: `This is a premium feature! (player premium 2 or above)\nIf you enjoy the bot we'd appreciate your support <:RaphiSmile:868998036645380197>`, ephemeral: true });

            // Get and validate user inputs
            const choice = interaction.options.getString('character', true);
            const oldCode = interaction.options.getString('old-code', true);
            const newCode = interaction.options.getString('new-code', true);
            if (!newCode.split('').every(char => validB64Chars.includes(char))) return interaction.reply({ content: 'Invalid code. Please use only alphanumeric characters, + and /', ephemeral: true });
            if (newCode.length > 6) return interaction.reply({ content: 'Code too long, must be 6 characters or less', ephemeral: true });

            // Search for the character
            const character = search(choice, interaction);
            if (!character) return;

            const char = await getInventoryCharacter(interaction, character, oldCode);
            if (!char) return interaction.reply({ content: "Invalid code", ephemeral: true });
            if (char.userId !== interaction.user.id) return interaction.reply({ content: `This is not your character`, ephemeral: true });

            // Check if character with code already exists
            const newCodeExists = await getInventoryCharacter(interaction, character, newCode);
            if (newCodeExists) return interaction.reply({ content: `A copy of **${character.name}** with the code \`${newCode}\` already exists. Please choose a different code.`, ephemeral: true });

            // Update code
            await query(`UPDATE inventory SET id = $1 WHERE rowid = $2`, [newCode, char.rowid]);

            // Get copies
            const [{ copies }] = await query(`SELECT COUNT(*) AS copies FROM inventory WHERE user_id = $1 AND char_id = $2`, [interaction.user.id, character.id]) as { copies: string; }[];

            const Embed = new EmbedBuilder()
                .setColor(char.rarityColor)
                .setImage(char.imageUrl)
                .setDescription(`**${char.name}**\n${char.animeInfo.splitName}\n\n**Rank**: ${rarityEmojis[char.rarity]}\n**Code**: \`${newCode}\``)
                .setFooter({ text: `You have ${copies} ${parseInt(copies) === 1 ? "copy" : "copies"} of ${character.gender === "F" ? "her" : "him"}\nCID: #${character.id}, UID: #${char.rowid}`, iconURL: interaction.user.avatarURL() + "?size=2048" });
            return interaction.reply({ content: `Successfully changed the code of **${character.name}** from \`${oldCode}\` to \`${newCode}\`!`, embeds: [Embed] });
        };

    },
};

export default exportCommand;

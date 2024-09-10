import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommand, UserSchema } from "../types";
import { query } from "../postgres";
import { getInventoryCharacter, queryUserInventory, search } from "../functions";
import { rarityEmojis } from "../shared/components";

const command = new SlashCommandBuilder()
    .setName('info')
    .addStringOption(option => option.setName('character').setDescription('Select a character').setRequired(true))
    .addStringOption(option => option.setName('code').setDescription('Specify a code').setRequired(false))
    .setDescription('Search for a character');

const exportCommand: SlashCommand = {
    command,
    execute: async ({ interaction }) => {

        const choice = interaction.options.getString('character', true);
        const code = interaction.options.getString('code');

        // Search for the character
        const character = search(choice, interaction);
        if (!character) return;

        // Get the user's inventory
        const inventory = await queryUserInventory(interaction.user.id);

        if (code) {
            const char = await getInventoryCharacter(interaction, character, code);
            if (!char) return interaction.reply({ content: "Invalid code", ephemeral: true });

            const [ownerSchema] = await query(`SELECT * FROM users WHERE id = $1`, [char.userId]) as UserSchema[];
            if (!ownerSchema) return interaction.reply({ content: "Something went wrong, it seems like the owner of this code is not in the database.", ephemeral: true });

            const [{ copies }] = await query(`SELECT COUNT(*) AS copies FROM inventory WHERE user_id = $1 AND char_id = $2`, [ownerSchema.id, character.id]) as { copies: string; }[];

            // Fetch user object
            const owner = await interaction.client.users.fetch(ownerSchema.id);

            const Embed = new EmbedBuilder()
                .setColor(char.rarityColor)
                .setImage(char.imageUrl)
                .setDescription(`**${char.name}**\n${char.animeInfo.splitName}\n\n**Rank**: ${rarityEmojis[char.rarity]}\n**Code**: \`${code}\``)
                .setFooter({ text: `${owner.id === interaction.user.id ? "You have" : `${owner.username} has`} ${copies} ${parseInt(copies) === 1 ? "copy" : "copies"} of ${character.gender === "F" ? "her" : "him"}\nCID: #${character.id}, UID: #${char.rowid}`, iconURL: owner.avatarURL() + "?size=2048" });
            return interaction.reply({ embeds: [Embed] });
        };

        // Base info
        const copies = inventory.filter((e) => e.char_id === character.id).length;

        const Embed = new EmbedBuilder()
            .setColor(character.rarityColor)
            .setImage(character.image_url)
            .setDescription(`**${character.name}**\n${character.anime(interaction.client.anime).splitName}\n\n**Rank**: ${rarityEmojis[character.rarity]}`)
            .setFooter({ text: `You have ${copies} ${copies === 1 ? "copy" : "copies"} of ${character.gender === "F" ? "her" : "him"}\nCID: #${character.id}` });
        return interaction.reply({ embeds: [Embed] });
    },
};

export default exportCommand;

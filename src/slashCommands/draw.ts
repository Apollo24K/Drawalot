import { ChatInputCommandInteraction, ComponentType, EmbedBuilder, Message, SlashCommandBuilder, User } from "discord.js";
import { ICharacterInfo, InventorySchema, SlashCommand, UserSchema } from "../types";
import { query } from "../postgres";
import { drawCharacter, insertCharacter, queryUserInventory, queryUserSchema } from "../functions";
import { getDrawRow, rarityEmojis } from "../shared/components";

const command = new SlashCommandBuilder()
    .setName('draw')
    .setDescription('Draw a random character')
    .addStringOption(option =>
        option.setName('flag')
            .setDescription('Choose a flag')
            .setRequired(false)
            .addChoices(
                { name: 'Waifu', value: 'F' },
                { name: 'Husbando', value: 'M' },
            )
    );

const lastDraws = new Map<string, { message: Message, timeout: NodeJS.Timeout; }>();

const getEmbed = ({ character, stats, inventory, interaction, maxDraws, maxClaims, claimedByUser }: { character: ICharacterInfo, stats: UserSchema, inventory: InventorySchema[], interaction: ChatInputCommandInteraction, maxDraws: number, maxClaims: number, claimedByUser?: User; }) => {
    const copies = inventory.filter((e) => e.char_id === character.id).length;

    return new EmbedBuilder()
        .setColor(character.rarityColor)
        .setImage(character.image_url)
        .setDescription(`**${character.name}**\n${character.anime(interaction.client.anime).splitName}\n\n**Rank**: ${rarityEmojis[character.rarity]}`)
        .setFooter({ text: claimedByUser ? `Claimed by ${claimedByUser.username}` : `You have ${copies} ${copies === 1 ? "copy" : "copies"} of ${character.gender === "F" ? "her" : "him"}\n${maxDraws - stats.draws} ${(maxDraws - stats.draws) === 1 ? "draw" : "draws"} and ${maxClaims - stats.claims} ${(maxClaims - stats.claims) === 1 ? "claim" : "claims"} left`, iconURL: claimedByUser ? `${claimedByUser.avatarURL({ size: 64 })}` : undefined });
};

const removeDrawRow = async (userId: string) => {
    if (lastDraws.has(userId)) {
        const { message, timeout } = lastDraws.get(userId)!;
        clearTimeout(timeout);
        try {
            await message.edit({ components: [] });
        } catch (error) {
            if (error.code !== 10008) console.error('Error editing previous draw message:', error);
        };
        lastDraws.delete(userId);
    };
};

const setLastDraw = (userId: string, message: Message) => {
    if (lastDraws.has(userId)) clearTimeout(lastDraws.get(userId)!.timeout);
    const timeout = setTimeout(() => removeDrawRow(userId), 300 * 1000);
    lastDraws.set(userId, { message, timeout });
};

const exportCommand: SlashCommand = {
    command,
    execute: async ({ interaction, author }) => {

        const flag = (interaction.options.getString('flag'));

        // Get stats
        let stats: UserSchema | undefined = author.query;

        // Check if the user has reached the maximum number of draws
        let maxDraws = 8, maxClaims = 3;
        switch (stats.premium) {
            case 1: maxDraws = 12; maxClaims = 4; break;
            case 2: maxDraws = 16; maxClaims = 5; break;
            case 3: maxDraws = 20; maxClaims = 6; break;
        };
        if (stats.draws >= maxDraws) return interaction.reply({ content: `You have used up all your draws, come back later!`, ephemeral: true });


        // Increment draw count
        await query(`UPDATE users SET draws = draws + 1 WHERE id = $1`, [interaction.user.id]);
        stats.draws++;

        // Draw a random character
        let character = drawCharacter(interaction.client.characters, { gender: (flag === "M" || flag === "F") ? flag : undefined });
        if (!character) return;

        // Get inventory
        let inventory = await queryUserInventory(interaction.user.id);

        // Clear any previous draw message then fetch the new one
        await removeDrawRow(interaction.user.id);

        // Send the initial embed
        return interaction.reply({ embeds: [getEmbed({ character, stats, inventory, interaction, maxDraws, maxClaims })], components: [getDrawRow(stats.draws < maxDraws)] }).then(async (msg) => {
            const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 180000 });

            let lastMessage: Message = await msg.fetch();
            setLastDraw(interaction.user.id, lastMessage);

            collector.on('collect', async r => {
                if (r.message.id !== lastMessage.id) return;

                if (r.customId === "draw" && r.user.id === interaction.user.id) {

                    // Refresh stats
                    stats = await queryUserSchema(interaction.user.id);
                    if (!stats) return;

                    // Check if the user has reached the maximum number of draws
                    if (stats.draws >= maxDraws) return lastMessage.reply({ content: `You have used up all your draws, come back later!` });

                    // Increment draw count
                    await query(`UPDATE users SET draws = draws + 1, drawstotal = drawstotal + 1 WHERE id = $1`, [interaction.user.id]);
                    stats.draws++;

                    // Draw a new character
                    character = drawCharacter(interaction.client.characters, { gender: (flag === "M" || flag === "F") ? flag : undefined });
                    if (!character) return;

                    // Refresh inventory
                    inventory = await queryUserInventory(interaction.user.id);

                    // Update the message
                    await removeDrawRow(interaction.user.id);
                    lastMessage = await lastMessage.reply({ embeds: [getEmbed({ character, stats, inventory, interaction, maxDraws, maxClaims })], components: [getDrawRow(stats.draws < maxDraws)] });
                    setLastDraw(interaction.user.id, lastMessage);
                };

                if (r.customId === "claim") {
                    if (!character || !stats) return;

                    // Refresh stats
                    let tempstats = await queryUserSchema(r.user.id);
                    if (!tempstats) return;

                    // Check if the user has reached the maximum number of claims
                    if (tempstats.claims >= maxClaims) return lastMessage.reply({ content: `${r.user.username} you have used up all your claims, come back later!` });

                    // Increment claim count
                    await query(`UPDATE users SET claims = claims + 1, claimstotal = claimstotal + 1 WHERE id = $1`, [r.user.id]);
                    tempstats.claims++;
                    if (r.user.id === interaction.user.id) stats = tempstats;

                    // Insert the character
                    await insertCharacter(r.user.id, character);

                    // Update the message
                    await lastMessage.edit({ embeds: [getEmbed({ character, stats, inventory, interaction, maxDraws, maxClaims, claimedByUser: r.user })], components: [getDrawRow(stats.draws < maxDraws, true)] });
                };
            });

            collector.on('end', async (r) => {
                await removeDrawRow(interaction.user.id);
            });

        });

    },
};

export default exportCommand;

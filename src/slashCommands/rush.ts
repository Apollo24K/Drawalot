import { ChatInputCommandInteraction, ComponentType, EmbedBuilder, Message, SlashCommandBuilder } from "discord.js";
import { ICharacterInfo, InventorySchema, SlashCommand, UserSchema } from "../types";
import { query } from "../postgres";
import { daysSince, drawCharacter, insertCharacter, queryUserInventory, queryUserSchema } from "../functions";
import { botPfp, embedColor, getDrawRow, rarityEmojis, StartRow } from "../shared/components";

const command = new SlashCommandBuilder()
    .setName('rush')
    .setDescription('Draw random characters quickly');

const lastDraws = new Map<string, { message: Message, timeout: NodeJS.Timeout; }>();

const getEmbed = ({ character, start, inventory, interaction, rushDuration, claimedBy }: { character: ICharacterInfo, start: number, inventory: InventorySchema[], interaction: ChatInputCommandInteraction, rushDuration: number, claimedBy?: string; }) => {
    const copies = inventory.filter((e) => e.char_id === character.id).length;
    const timeLeft = Math.floor((start + (rushDuration * 1000) - Date.now()) / 1000);

    return new EmbedBuilder()
        .setColor(character.rarityColor)
        .setImage(character.image_url)
        .setDescription(`**${character.name}**\n${character.anime(interaction.client.anime).splitName}\n\n**Rank**: ${rarityEmojis[character.rarity]}`)
        .setFooter({ text: claimedBy ? `Claimed by ${claimedBy}` : `You have ${copies} ${copies === 1 ? "copy" : "copies"} of ${character.gender === "F" ? "her" : "him"}\n${timeLeft > 0 ? `${timeLeft} seconds left` : "Time's up!"}`, iconURL: interaction.user.avatarURL() + "?size=2048" });
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

        // Check if the user has already used this command today
        if (author.query.lastrush && daysSince(author.query.lastrush) < 1) return interaction.reply({ content: `You can use this command only once per day!`, ephemeral: true });

        // Clear any previous draw message then fetch the new one
        await removeDrawRow(interaction.user.id);

        let rushDuration = 45;
        switch (author.query.premium) {
            case 1: rushDuration = 60; break;
            case 2: rushDuration = 75; break;
            case 3: rushDuration = 90; break;
        };

        // Send the initial embed
        const Embed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle("Card Rush")
            .setThumbnail(botPfp)
            .setDescription(`Once per day, you have **${rushDuration}** seconds to draw as many cards as you can! But beware, you can only claim **1** of them!\n\n-# This will not affect your regular draws or claims.`);
        return interaction.reply({ embeds: [Embed], components: [StartRow] }).then(async (msg) => {
            const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: rushDuration * 1000 });

            let lastMessage: Message = await msg.fetch();
            setLastDraw(interaction.user.id, lastMessage);

            let start: number;
            let stats: UserSchema | undefined, character: ICharacterInfo | undefined, inventory: InventorySchema[] | undefined;

            collector.on('collect', async r => {
                if (r.message.id !== lastMessage.id) return;

                // Start the rush
                if (r.customId === "start") {
                    // Refresh stats
                    stats = await queryUserSchema(interaction.user.id);
                    if (!stats) return;

                    // Check if the user has already used this command today
                    if (stats.lastrush && daysSince(stats.lastrush) < 1) return interaction.reply({ content: `You can use this command only once per day!`, ephemeral: true });

                    // Update lastrush time
                    await query(`UPDATE users SET lastrush = NOW() WHERE id = $1`, [interaction.user.id]);

                    // Set the start time
                    start = Date.now();

                    // Reset collector timer
                    collector.resetTimer();
                };

                // Draw a new character
                if (r.customId === "draw" || r.customId === "start") {

                    // Check if the time is up
                    if (Date.now() - start > rushDuration * 1000) return interaction.reply({ content: `You can only use this command for **${rushDuration}** seconds!`, ephemeral: true });

                    // Refresh stats
                    stats = await queryUserSchema(interaction.user.id);
                    if (!stats) return;

                    // Draw a new character
                    character = drawCharacter(interaction.client.characters);
                    if (!character) return;

                    // Refresh inventory
                    inventory = await queryUserInventory(interaction.user.id);

                    // Update the message
                    await removeDrawRow(interaction.user.id);
                    lastMessage = await lastMessage.reply({ embeds: [getEmbed({ character, start, inventory, interaction, rushDuration })], components: [getDrawRow(true)] });
                    setLastDraw(interaction.user.id, lastMessage);
                };

                // Claim the character
                if (r.customId === "claim") {
                    if (!character || !stats || !inventory) return;

                    // Refresh stats
                    stats = await queryUserSchema(interaction.user.id);
                    if (!stats) return;

                    // Check if the user has reached the maximum number of claims
                    if (stats.rushclaimed >= 1) return lastMessage.reply({ content: `${r.user.username} you have already claimed a character today!` });

                    // Increment claim count
                    await query(`UPDATE users SET rushclaimed = rushclaimed + 1 WHERE id = $1`, [interaction.user.id]);
                    stats.rushclaimed++;

                    // Insert the character
                    await insertCharacter(interaction.user.id, character);

                    // Update the message
                    await lastMessage.edit({ embeds: [getEmbed({ character, start, inventory, interaction, rushDuration, claimedBy: r.user.username })], components: [getDrawRow(false, true)] });
                };
            });

            collector.on('end', async (r) => {
                await removeDrawRow(interaction.user.id);
            });

        });

    },
};

export default exportCommand;
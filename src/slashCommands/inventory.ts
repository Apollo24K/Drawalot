import { ComponentType, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import { getUserInventory, showPage } from "../functions";
import { botPfp, embedColor, PageRow, rarityEmojis } from "../shared/components";
import { InventoryEntry } from "../shared/inventory";

const command = new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("View your character inventory")
    .addStringOption(option =>
        option.setName('sort')
            .setDescription('Sort your inventory')
            .setRequired(false)
            .addChoices(
                { name: 'rarity', value: 'rarity' },
            )
    )
    .addIntegerOption(option => option.setName('page').setDescription('Choose a page to jump to').setRequired(false))
    .addUserOption(option =>
        option.setName('user')
            .setDescription('Select a user to view their inventory')
            .setRequired(false)
    )
    .addBooleanOption(option => option.setName('ephemeral').setDescription('Ephemeral?').setRequired(false));

function formatPage(showChars: InventoryEntry[]) {
    let arr = [], rarity = -1;

    for (const char of showChars) {
        if (char.rarity !== rarity) {
            rarity = char.rarity;
            arr.push(`\n${rarityEmojis[rarity]}`);
        };
        arr.push(`> \`${char.id}\` • ${char.characterInfo.name}${char.customImageUrl ? " <:custom_image:1282370248787492894>" : ''}`);
    };

    return arr.join("\n");
};

const exportCommand: SlashCommand = {
    command,
    execute: async ({ interaction }) => {

        const user = interaction.options.getUser('user') ?? interaction.user;
        const page = interaction.options.getInteger('page') ?? 1;
        const sort = (interaction.options.getString('sort') || 'rarity') as 'rarity' | 'dupes';
        const ephemeral = interaction.options.getBoolean('ephemeral') ?? false;

        // Get inventory
        const inventory = await getUserInventory(interaction, user);
        if (inventory.length === 0) return interaction.reply({ content: `${interaction.user.id === user.id ? "You have no characters in your inventory" : `**${user.username}** has no characters in their inventory`}` });

        // Sort inventory
        inventory.sort(sort);

        // Pagination
        const elementsPerPage = 10;
        const pagesTotal = Math.ceil(inventory.length / elementsPerPage);
        let currPage = 1;
        if (page <= pagesTotal && page > 0) {
            currPage = page;
        };

        // Create embed
        const Embed = new EmbedBuilder()
            .setAuthor({ name: `${user.username}'s Inventory`, iconURL: user.displayAvatarURL() + "?size=2048" })
            .setColor(embedColor)
            .setThumbnail(inventory.random()?.imageUrl ?? botPfp)
            .setDescription(formatPage(showPage(currPage, inventory.entries, elementsPerPage)))
            .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
        if (pagesTotal === 1) return interaction.reply({ embeds: [Embed], ephemeral });
        return interaction.reply({ embeds: [Embed], components: [PageRow], ephemeral, fetchReply: true }).then(msg => {
            const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

            collector.on('collect', r => {
                currPage = r.customId === "prev"
                    ? (currPage > 1 ? currPage - 1 : pagesTotal)
                    : (currPage < pagesTotal ? currPage + 1 : 1);

                Embed.setDescription(formatPage(showPage(currPage, inventory.entries, elementsPerPage))).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                interaction.editReply({ embeds: [Embed] });
            });

        });

    },
};

export default exportCommand;

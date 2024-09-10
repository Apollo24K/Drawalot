import { ComponentType, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { ICharacterInfo, SlashCommand } from "../types";
import { getUserInventory, searchAnime, showPage } from "../functions";
import { embedColor, PageRow, rarityEmojis } from "../shared/components";

const command = new SlashCommandBuilder()
    .setName('search')
    .setDescription('Search for characters from an anime')
    .addStringOption(option =>
        option.setName('anime')
            .setDescription('The anime to search for')
            .setRequired(true)
            .setAutocomplete(true))
    .addStringOption(option =>
        option.setName('flags')
            .setDescription('Search flags')
            .setRequired(false)
            .addChoices(
                { name: 'Missing', value: 'missing' },
                { name: 'Image', value: 'image' }
            ))
    .addUserOption(option =>
        option.setName('user')
            .setDescription('See search results for another user')
            .setRequired(false))
    .addIntegerOption(option =>
        option.setName('page')
            .setDescription('The page number to view')
            .setRequired(false));

function formatPage(showChars: ICharacterInfo[]) {
    let arr = [], rarity = -1;

    for (const char of showChars) {
        if (char.rarity !== rarity) {
            rarity = char.rarity;
            arr.push(`\n${rarityEmojis[rarity]}`);
        };
        arr.push(`> ${char.name}`);
    };

    return arr.join("\n");
};

const exportCommand: SlashCommand = {
    command,
    execute: async ({ interaction }) => {

        const choice = interaction.options.getString('anime', true);
        const user = interaction.options.getUser('user') ?? interaction.user;
        const page = interaction.options.getInteger('page') ?? 1;
        const searchflag = interaction.options.getString('flags') as 'missing' | 'image' | undefined;

        // Search for the character
        const anime = searchAnime(choice, interaction);
        if (!anime) return;

        // Get characters of the anime
        const characters = [...anime.characters(interaction.client.characters).values()];
        if (characters.length === 0) return interaction.reply({ content: "No characters found for this anime" });

        // Sort characters by rarity
        characters.sort((a, b) => {
            if (b.rarity !== a.rarity) return b.rarity - a.rarity;
            return a.name.localeCompare(b.name);
        });

        // Get inventory (only characters from the anime)
        const inventory = await getUserInventory(interaction, user, anime);

        // Pagination
        const elementsPerPage = 10;
        const pagesTotal = Math.ceil(characters.length / elementsPerPage);
        let currPage = 1;
        if (page <= pagesTotal && page > 0) {
            currPage = page;
        };

        // Create embed
        const Embed = new EmbedBuilder()
            .setTitle(`${anime.name} (${inventory.unique.length}/${characters.length})`)
            .setColor(embedColor)
            .setThumbnail(characters[0].image_url)
            .setDescription(formatPage(showPage(currPage, characters, elementsPerPage)))
            .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
        if (pagesTotal === 1) return interaction.reply({ embeds: [Embed] });
        return interaction.reply({ embeds: [Embed], components: [PageRow], fetchReply: true }).then(msg => {
            const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

            collector.on('collect', r => {
                currPage = r.customId === "prev"
                    ? (currPage > 1 ? currPage - 1 : pagesTotal)
                    : (currPage < pagesTotal ? currPage + 1 : 1);

                Embed.setDescription(formatPage(showPage(currPage, characters, elementsPerPage))).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                interaction.editReply({ embeds: [Embed] });
            });

        });
    },
    async autocomplete({ interaction }) {
        const name = interaction.options.getFocused().toLowerCase();

        let fArray = interaction.client.anime.filter((e) => e.name.toLowerCase().includes(name) || e.aliases.some((a) => a.toLowerCase().includes(name)));

        const matches = fArray.filter((e) => e.name.toLowerCase() === name || e.aliases.some((a) => a.toLowerCase() === name));
        fArray = fArray.filter((e) => e.name.toLowerCase() !== name && !e.aliases.some((a) => a.toLowerCase() === name));
        const starts = fArray.filter((e) => e.name.toLowerCase().startsWith(name) || e.aliases.some((a) => a.toLowerCase().startsWith(name)));
        fArray = fArray.filter((e) => !e.name.toLowerCase().startsWith(name) && !e.aliases.some((a) => a.toLowerCase().startsWith(name)));

        return [...matches.values(), ...starts.values(), ...fArray.values()].map((e) => ({ name: e.name.toLowerCase().includes(name) ? e.name.slice(0, 100) : `${e.name} (alias: ${e.aliases.find((a) => a.toLowerCase() === name) ?? e.aliases.find((a) => a.toLowerCase().startsWith(name)) ?? e.aliases.find((a) => a.toLowerCase().includes(name))})`.slice(0, 100), value: e.name.slice(0, 100) }));
    },
};

export default exportCommand;

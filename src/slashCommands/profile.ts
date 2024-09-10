import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import { botPfp, embedColor, Emojis } from "../shared/components";
import { getFavChar, getUserInventory, queryUserSchema } from "../functions";

const command = new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your or another user\'s profile')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('The user whose profile you want to view')
            .setRequired(false));

const exportCommand: SlashCommand = {
    command,
    cooldown: 3,
    async execute({ interaction, author }) {

        const user = interaction.options.getUser('user') ?? interaction.user;

        const stats = (user.id === interaction.user.id) ? author.query : await queryUserSchema(user.id);
        if (!stats) return interaction.reply({ content: "Couldn't find user data", ephemeral: true });

        // Get Inventory
        const inventory = await getUserInventory(interaction, user);

        // Get Fav Character
        const favChar = await getFavChar(interaction, stats.fav_char);

        const Embed = new EmbedBuilder()
            .setAuthor({ name: `${user.username}'s profile${stats.premium ? ` 💎` : ""}`, iconURL: user.avatarURL({ size: 256 }) ?? botPfp })
            .setColor(embedColor)
            .setThumbnail(favChar?.imageUrl ?? inventory.random()?.imageUrl ?? botPfp)
            .setDescription(
                `**Gold**: \`${stats.coins}\`${Emojis.Gold}ㅤ**Gems**: \`${stats.gems}\`${Emojis.Gem}ㅤ**Jades**: \`${stats.jades}\`${Emojis.Jade}\n` +
                `**Characters**: __\`${inventory.length}\`__ (__\`${inventory.filter("waifu").length}\`__<:female:870076411430436914>__\`${inventory.filter("husbando").length}\`__<:male:870076394649047080>)\n`

            )
            .setFooter({ text: `Started playing ${stats.created.toUTCString()}${(stats.premium && stats.premium_expires) ? `\nPremium Tier ${stats.premium} expires: ${stats.premium_expires.toLocaleDateString('en-GB').replace(/\//g, '.')}` : ""}` });

        return interaction.reply({ embeds: [Embed] });
    },
};

export default exportCommand;

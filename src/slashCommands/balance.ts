import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommand, UserSchema } from "../types";
import { query } from "../postgres";
import { botPfp, embedColor, Emojis } from "../shared/components";
import { getFavChar } from "../functions";

const command = new SlashCommandBuilder()
    .setName('balance')
    .setDescription('See a user\'s balance')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('The user to check balance for')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('currency')
            .setDescription('The currency to check')
            .setRequired(false)
            .addChoices(
                { name: 'gold', value: 'coins' },
                { name: 'genesis gems', value: 'gems' },
                { name: 'eternal jades', value: 'jades' }
            ));

const exportCommand: SlashCommand = {
    command,
    cooldown: 3,
    async execute({ interaction, author }) {

        const user = interaction.options.getUser('user') ?? interaction.user;
        const choice = interaction.options.getString('currency');

        const [stats] = (user.id === interaction.user.id) ? [author.query] : await query(`SELECT coins, gems, jades, lastdaily FROM users WHERE id = $1`, [user.id]) as UserSchema[];
        if (!stats) return interaction.reply({ content: (user.id === interaction.user.id) ? "You don't have an account" : `${user.username} doesn't have an account`, ephemeral: true });

        // Get Fav Character
        const favChar = await getFavChar(interaction, stats.fav_char);

        const Embed = new EmbedBuilder()
            .setColor(embedColor)
            .setAuthor({ name: `${user.username}'s Balance`, iconURL: user.displayAvatarURL({ size: 2048 }) })
            .setThumbnail(favChar?.imageUrl ?? botPfp)
            .setDescription(`**Gold**: \`${stats.coins}\`${Emojis.Gold}\n**Gems**: \`${stats.gems}\`${Emojis.Gem}\n**Jades**: \`${stats.jades}\`${Emojis.Jade}`);

        if (choice) {
            let description = `**${choice.charAt(0).toUpperCase() + choice.slice(1)}**: \`${stats[choice as keyof Pick<UserSchema, 'coins' | 'gems' | 'jades'>]}\``;
            if (choice === 'coins') {
                const lastDaily = stats.lastdaily ? new Date(stats.lastdaily) : null;
                const dailyAvailable = !lastDaily || (Date.now() - lastDaily.getTime()) >= 24 * 60 * 60 * 1000;
                description += `\n${dailyAvailable ? "Your `/daily` is available!" : "You have already claimed your daily"}`;
            } else if (choice === 'gems' || choice === 'jades') {
                description += "\nSee `/shop` if you need more!";
            };
            Embed.setDescription(description);
        };

        return interaction.reply({ embeds: [Embed] });
    },
};

export default exportCommand;

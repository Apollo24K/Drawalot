import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import { query } from "../postgres";
import { Emojis } from "../shared/components";
import { daysSince } from "../functions";

const command = new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily reward');

function streakEmoji(dailystreak: number) {
    if (dailystreak < 3) return "";
    if (dailystreak < 7) return "<a:fire_y:936975489862623253>";
    if (dailystreak < 14) return "<a:fire_b:936975541058273370>";
    if (dailystreak < 30) return "<a:fire_m:936975577171259413>";
    return "<a:fire_p:936975620708134992>";
};

const exportCommand: SlashCommand = {
    command,
    cooldown: 3,
    async execute({ interaction, author }) {

        const daysPassed = author.query.lastdaily ? daysSince(author.query.lastdaily) : 1;
        if (daysPassed < 1) return interaction.reply({ content: `You can use this command only once per day!`, ephemeral: true });

        // Streak
        if (daysPassed === 1) author.query.dailystreak++;
        else author.query.dailystreak = 1;

        let premiumMultiplier = 1;
        switch (author.query.premium) {
            case 1: premiumMultiplier = 1.25; break;
            case 2: premiumMultiplier = 1.5; break;
            case 3: premiumMultiplier = 1.8; break;
        };

        const reward = Math.floor((400 + (20 * (author.query.dailystreak - 1))) * premiumMultiplier);

        // Add rewards
        await query(`UPDATE users SET coins = coins + $1, dailystreak = $2, lastdaily = NOW() WHERE id = $3`, [reward, author.query.dailystreak, interaction.user.id]);

        interaction.reply(`Added **${reward}** ${Emojis.Gold} to your balance\n<:stars_v2:917023655840591963> Daily Streak: ${author.query.dailystreak} ${streakEmoji(author.query.dailystreak)}`);
    },
};

export default exportCommand;

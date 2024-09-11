import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommand, UserSchema } from "../types";
import { query } from "../postgres";

const command = new SlashCommandBuilder()
    .setName('cd')
    .addUserOption(option => option.setName('user').setDescription('See the cooldowns of a user').setRequired(false))
    .setDescription('Check your cooldowns');

const exportCommand: SlashCommand = {
    command,
    cooldown: 5,
    async execute({ interaction, author }) {

        const user = interaction.options.getUser('user') ?? interaction.user;

        const [stats] = (user.id === interaction.user.id) ? [author.query] : await query(`SELECT * FROM users WHERE id = $1`, [user.id]) as UserSchema[];

        const now = new Date();

        const slashCmds = await interaction.client.application?.commands.fetch();
        const drawCmd = slashCmds?.find(e => e.name === "draw");
        const rushCmd = slashCmds?.find(e => e.name === "rush");
        const dailyCmd = slashCmds?.find(e => e.name === "daily");
        const voteCmd = slashCmds?.find(e => e.name === "vote");

        let maxDraws = 8, maxClaims = 3;
        switch (stats.premium) {
            case 1: maxDraws = 12; maxClaims = 4; break;
            case 2: maxDraws = 16; maxClaims = 5; break;
            case 3: maxDraws = 20; maxClaims = 6; break;
        };

        // Messages
        let draw = `Your draws are ready! (${maxDraws - stats.draws} left) => ${drawCmd ? `</${drawCmd.name}:${drawCmd.id}>` : "`/draw`"}`;
        let claim = `Your claims are ready! (${maxClaims - stats.claims} left) => ${drawCmd ? `</${drawCmd.name}:${drawCmd.id}>` : "`/draw`"}`;
        let rushmsg = `Your rush is ready! => ${rushCmd ? `</${rushCmd.name}:${rushCmd.id}>` : "`/rush`"}`;
        let dailymsg = `Your daily is ready! => ${dailyCmd ? `</${dailyCmd.name}:${dailyCmd.id}>` : "`/daily`"}`;
        let vote = `You can [vote](<https://top.gg/bot/1280021661525086299/vote>) now! => ${voteCmd ? `</${voteCmd.name}:${voteCmd.id}>` : "`/vote`"}`;

        // Draw
        if (stats.draws >= maxDraws) {
            const nextReset = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + (2 - now.getHours() % 2), 0, 0, 0);
            const timeLeft = nextReset.getTime() - now.getTime();
            const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
            const minutesLeft = Math.ceil((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
            draw = `${hoursLeft ? `**${hoursLeft}**h ` : ""}**${minutesLeft}**min left`;
        };

        // Claim
        if (stats.claims >= maxClaims) {
            const nextReset = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + (2 - now.getHours() % 2), 0, 0, 0);
            const timeLeft = nextReset.getTime() - now.getTime();
            const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
            const minutesLeft = Math.ceil((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
            draw = `${hoursLeft ? `**${hoursLeft}**h ` : ""}**${minutesLeft}**min left`;
        };

        // Rush
        if (stats.lastrush && stats.lastrush.toDateString() === now.toDateString()) {
            const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
            const timeLeft = midnight.getTime() - now.getTime();
            const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
            const minutesLeft = Math.ceil((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
            rushmsg = `${hoursLeft > 0 ? `**${hoursLeft}**h ` : ''}**${minutesLeft}**min left`;
        };

        // Daily
        if (stats.lastdaily && stats.lastdaily.toDateString() === now.toDateString()) {
            const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
            const timeLeft = midnight.getTime() - now.getTime();
            const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
            const minutesLeft = Math.ceil((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
            dailymsg = `${hoursLeft > 0 ? `**${hoursLeft}**h ` : ''}**${minutesLeft}**min left`;
        };

        // Vote
        if (stats.lastvote && (now.getTime() - stats.lastvote.getTime() < 12 * 60 * 60 * 1000)) {
            const timeLeft = 12 * 60 * 60 * 1000 - (now.getTime() - stats.lastvote.getTime());
            const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
            const minutesLeft = Math.ceil((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
            vote = `${hoursLeft ? `**${hoursLeft}**h ` : ""}**${minutesLeft}**min left`;
        };

        return interaction.reply(`**Draw**: ${draw}\n**Claim**: ${claim}\n**Rush**: ${rushmsg}\n**Daily**: ${dailymsg}\n**Vote**: ${vote}`);
    },
};

export default exportCommand;

import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import { botPfp, embedColor, Emojis } from "../shared/components";

const command = new SlashCommandBuilder()
    .setName('shop')
    .setDescription('View the premium shop');

const exportCommand: SlashCommand = {
    command,
    cooldown: 3,
    async execute({ interaction, author }) {

        const Embed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle("Premium Shop")
            .setThumbnail(botPfp)
            .setDescription(`Welcome to the premium shop to buy jades <:FuminoHeart:928369288014884935>\nUse \`/convert jades\` to convert them into gems ${Emojis.Gem}\n\n` +
                `\`  $4 ➜    240\`${Emojis.Jade}\`    +60 first time bonus!\`\n` +
                `\` $12 ➜    740\`${Emojis.Jade}\`   +160 first time bonus!\`\n` +
                `\` $25 ➜  1,640\`${Emojis.Jade}\`   +360 first time bonus!\`\n` +
                `\` $50 ➜  3,420\`${Emojis.Jade}\`   +720 first time bonus!\`\n` +
                `\`$100 ➜  7,060\`${Emojis.Jade}\` +1,440 first time bonus!\`\n` +
                `➜ [Here's the link to our shop!](https://rank.top/bot/drawalot?page=shop)`
            )
            .setFooter({ text: `Balance: ${author.query.jades} jades, ${author.query.gems} gems`, iconURL: interaction.user.avatarURL({ size: 64 }) ?? undefined });
        return interaction.reply({ embeds: [Embed] });
    },
};

export default exportCommand;

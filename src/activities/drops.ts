import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, Client, ComponentType, EmbedBuilder, User } from "discord.js";
import { drawCharacter, insertCharacter, queryServerSchema, replyToButton } from "../functions";
import { DropButton, GuildActivity, ICharacterInfo } from "../types";
import { activityDropRates, dropButtons, rarityColors, rarityEmojis } from "../shared/components";

const buildDropRow = (selectedButtons: DropButton[]): ActionRowBuilder<ButtonBuilder> => {
    // Shuffle
    selectedButtons.sort(() => Math.random() - 0.5);

    return new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            selectedButtons.map((button) => (
                new ButtonBuilder()
                    .setCustomId(`${button.id}`)
                    .setEmoji(button.emoji)
                    .setStyle(ButtonStyle.Secondary)
            ))
        );
};

const getDropRow = (): [DropButton, ActionRowBuilder<ButtonBuilder>] => {
    const pick = dropButtons[Math.floor(Math.random() * dropButtons.length)];

    // Get random buttons
    const selectedButtons = [pick, ...dropButtons.filter((button) => button.id !== pick.id).sort(() => Math.random() - 0.5).slice(0, 3)];

    // Events
    if (Math.random() < 0.3) selectedButtons[3] = { id: "dice", emoji: "🎲" };

    return [pick, buildDropRow(selectedButtons)];
};

const getEmbed = (character: ICharacterInfo, client: Client, pick: DropButton, claimedByUser?: User) => {
    return new EmbedBuilder()
        .setColor(character.rarityColor)
        .setImage(character.image_url)
        .setDescription(`**${character.name}**\n${character.anime(client.anime).splitName}\n\n**Rank**: ${rarityEmojis[character.rarity]}`)
        .setFooter({ text: claimedByUser ? `Claimed by ${claimedByUser.username}` : `Press ${pick.emoji} to claim!`, iconURL: claimedByUser ? claimedByUser.avatarURL() + "?size=2048" : undefined });
};

const command: GuildActivity = {
    name: "drops",
    execute: async ({ message, activity }) => {
        if (!message.guild) return;

        // Drop rate
        const dropRate = 0.03;
        if (Math.random() > dropRate) return;

        // Check cooldown
        const serverCooldown = message.client.cooldowns.get(`${activity.name}-${message.guild.id}`);
        if (serverCooldown && Date.now() < serverCooldown) return;

        // Query server schema
        const server = await queryServerSchema(message.guild.id); // Check if server exists in the db
        if (!server) return;


        // Set cooldown
        const cooldown = [600, 480, 360, 300][server.premium];
        message.client.cooldowns.set(`${activity.name}-${message.guild.id}`, Date.now() + cooldown * 1000);
        setTimeout(() => message.client.cooldowns.delete(`${activity.name}-${message.member?.user.username}`), cooldown * 1000);

        // Fetch channel
        if (!server.drop_channel && !server.allow_global_drops) return;

        // Fetch channel
        const channel = server.allow_global_drops ? message.channel : (server.drop_channel ? (message.guild.channels.cache.get(server.drop_channel) ?? message.client.channels.cache.find(channel => channel.id === server.drop_channel)) : null);
        if (!channel || channel.type !== ChannelType.GuildText) return;

        // Draw a random character
        let character = drawCharacter(message.client.characters, {}, activityDropRates[server.premium]);
        if (!character) return;

        // Send embed
        let claimed = false;
        const userOnCooldown = new Map<string, number>();
        const [pick, DropRow] = getDropRow();
        channel.send({ embeds: [getEmbed(character, message.client, pick)], components: [DropRow] }).then(async (msg) => {
            const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 180000 });

            collector.on('collect', async r => {
                if (r.user.bot || !character || message.client.bannedUsers.has(r.user.id)) return;

                // Check if user is on cooldown
                if (userOnCooldown.has(r.user.id) && Date.now() < userOnCooldown.get(r.user.id)!) return replyToButton(r, { content: `You're on cooldown! Please wait ${Math.floor((userOnCooldown.get(r.user.id)! - Date.now()) / 1000)} seconds`, ephemeral: true });

                // Event: Dice
                if (r.customId === "dice") {
                    const newPick = dropButtons[Math.floor(Math.random() * dropButtons.length)];
                    pick.id = newPick.id, pick.emoji = newPick.emoji;

                    const selectedButtons = [pick, ...dropButtons.filter((button) => button.id !== pick.id).sort(() => Math.random() - 0.5).slice(0, 2), { id: "dice", emoji: "🎲" }];

                    DropRow.setComponents(buildDropRow(selectedButtons).components);
                    msg.edit({ embeds: [getEmbed(character, message.client, pick)], components: [DropRow] });
                    return;
                };

                // Claim
                if (r.customId === pick.id && !claimed) {
                    claimed = true;
                    msg.edit({ embeds: [getEmbed(character, message.client, pick, r.user)], components: [] });

                    // Insert the character
                    await insertCharacter(r.user.id, character);
                    return;
                };

                // Fail to claim
                userOnCooldown.set(r.user.id, Date.now() + 5000);
                replyToButton(r, { content: "Wrong button! Please wait 5 seconds before you can try again.", ephemeral: true });
            });

            collector.on('end', async () => {
                if (claimed) return;
                try {
                    await msg.edit({ components: [] });
                } catch { }
            });

        });

    },
};

export default command;

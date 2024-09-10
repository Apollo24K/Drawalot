import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { PremiumInfo, SlashCommand } from "../types";
import { botPfp, embedColor, Emojis, OfferRow, playerPremium, serverPremium } from "../shared/components";
import { queryServerSchema, queryUserSchema } from "../functions";
import { query } from "../postgres";

const command = new SlashCommandBuilder()
    .setName("premium")
    .setDescription("See premium features for players and servers")
    .addSubcommand(subcommand =>
        subcommand
            .setName("player")
            .setDescription("See premium features for a player")
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("server")
            .setDescription("See premium features for the server")
    );

const getPremiumPurchaseRow = () => {
    return new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('prev')
                .setEmoji('⏪')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('next')
                .setEmoji('⏩')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('purchase')
                .setLabel('Purchase')
                .setStyle(ButtonStyle.Primary),
        );
};

const formatServerPremiumPage = (premium: PremiumInfo) => {
    return `## ${premium.type} Premium 💎\n`
        + `**Tier**: ${premium.tier}\n`
        + `**Price**: ${premium.price} ${Emojis.Jade}\n`
        + `### **Benefits**\n>>> ${premium.benefits.map(b => `**${b.name}**\n${b.value ? b.value.map(v => `-# - ${v}`).join("\n") : ""}`).join("\n")}`;
};

const exportCommand: SlashCommand = {
    command,
    permissions: ["Administrator"],
    execute: async ({ interaction }) => {
        const subcommand = interaction.options.getSubcommand();

        // Check if user is in a server
        if (subcommand === "server" && !interaction.guild) return interaction.reply({ content: "This command can only be used in a server", ephemeral: true });

        // Get premium type
        const premiumType = subcommand === "player" ? playerPremium : serverPremium;

        // Pagination
        const elementsPerPage = 1;
        const pagesTotal = Math.ceil(premiumType.length / elementsPerPage);
        let currPage = 1;

        const Embed = new EmbedBuilder()
            .setColor(embedColor)
            .setThumbnail(botPfp)
            .setDescription(formatServerPremiumPage(premiumType[currPage - 1]))
            .setFooter({ text: `Page ${currPage}/${pagesTotal}` });

        if (subcommand === "player") {
            return interaction.reply({ embeds: [Embed], components: [getPremiumPurchaseRow()] }).then(async (msg) => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 180000 });

                collector.on('collect', async r => {
                    if (r.customId === "purchase") {

                        const premium = premiumType[currPage - 1];
                        const stats = await queryUserSchema(interaction.user.id);
                        if (!stats) return interaction.channel?.send({ content: "Couldn't find user" });
                        if (stats.premium > premium.tier) return interaction.channel?.send({ content: `You already have Player Premium ${stats.premium}!` });

                        const content = stats.premium === 0 ?
                            `Do you want to purchase Player Premium ${premium.tier} for ${premium.price} ${Emojis.Jade}?`
                            :
                            (stats.premium === premium.tier) ?
                                `Do you want to extend Player Premium ${stats.premium} by another **30** days for ${premium.price} ${Emojis.Jade}?`
                                :
                                `Do you want to upgrade Player Premium to ${premium.tier} for ${premium.price} ${Emojis.Jade}?`;

                        interaction.followUp({ content, components: [OfferRow] }).then(async (msg) => {
                            const purchase = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 180000 });

                            purchase.on('collect', async r => {
                                purchase.stop();
                                if (r.customId === "cancel") return interaction.channel?.send({ content: "Purchase cancelled" });

                                // Check if user has enough jades
                                const statsCheck = await queryUserSchema(interaction.user.id);
                                if (!statsCheck || statsCheck.jades < premium.price) return interaction.channel?.send({ content: `You don't have enough jades to purchase this tier (**${statsCheck?.jades ?? 0}**/${premium.price} ${Emojis.Jade})` });

                                // Make sure premium state hasn't changed
                                if (statsCheck.premium !== stats.premium || (statsCheck.premium_expires && statsCheck.premium_expires.getTime() !== stats.premium_expires?.getTime())) return interaction.channel?.send({ content: `An error occurred, please try again later.` });

                                // Save to database
                                if (stats.premium === premium.tier) {
                                    // Extend player premium
                                    await query(`UPDATE users SET jades = jades - $1, premium_expires = $2 WHERE id = $3`, [premium.price, new Date((stats.premium_expires ?? new Date()).getTime() + 30 * 24 * 60 * 60 * 1000), interaction.user.id]);
                                } else {
                                    await query(`UPDATE users SET jades = jades - $1, premium = $2, premium_expires = $3 WHERE id = $4`, [premium.price, premium.tier, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), interaction.user.id]);
                                };

                                return interaction.channel?.send({ content: `🎉 Purchased Player Premium ${premium.tier}!` });
                            });
                        });
                    };

                    // Pagination
                    if (r.customId === "prev" || r.customId === "next") {
                        currPage = (r.customId === "prev")
                            ? (currPage > 1 ? currPage - 1 : pagesTotal)
                            : (currPage < pagesTotal ? currPage + 1 : 1);

                        Embed.setDescription(formatServerPremiumPage(premiumType[currPage - 1])).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                        return interaction.editReply({ embeds: [Embed] });
                    };
                });

            });
        };

        if (subcommand === "server") {
            return interaction.reply({ embeds: [Embed], components: [getPremiumPurchaseRow()] }).then(async (msg) => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 180000 });

                collector.on('collect', async r => {
                    if (r.customId === "purchase") {
                        if (!interaction.guildId) return;

                        const premium = premiumType[currPage - 1];
                        const server = await queryServerSchema(interaction.guildId);
                        if (!server) return interaction.channel?.send({ content: "Couldn't find server" });
                        if (server.premium > premium.tier) return interaction.channel?.send({ content: `This server already has Server Premium ${server.premium}!` });

                        const content = server.premium === 0 ?
                            `Do you want to purchase Server Premium ${premium.tier} for **${interaction.guild?.name}** for ${premium.price} ${Emojis.Jade}?`
                            :
                            (server.premium === premium.tier) ?
                                `Do you want to extend Server Premium ${server.premium} by another **30** days for **${interaction.guild?.name}** for ${premium.price} ${Emojis.Jade}?`
                                :
                                `Do you want to upgrade Server Premium to ${premium.tier} for **${interaction.guild?.name}** for ${premium.price} ${Emojis.Jade}?`;

                        interaction.followUp({ content, components: [OfferRow] }).then(async (msg) => {
                            const purchase = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 180000 });

                            purchase.on('collect', async r => {
                                purchase.stop();
                                if (r.customId === "cancel") return interaction.channel?.send({ content: "Purchase cancelled" });
                                if (!interaction.guildId) return;

                                // Check if user has enough jades
                                const stats = await queryUserSchema(interaction.user.id);
                                if (!stats || stats.jades < premium.price) return interaction.channel?.send({ content: `You don't have enough jades to purchase this tier (**${stats?.jades ?? 0}**/${premium.price} ${Emojis.Jade})` });

                                // Make sure server hasn't changed
                                const serverCheck = await queryServerSchema(interaction.guildId);
                                if (!serverCheck) return interaction.channel?.send({ content: "Couldn't find server" });
                                if (serverCheck.premium !== server.premium || (serverCheck.premium_expires && serverCheck.premium_expires.getTime() !== server.premium_expires?.getTime())) return interaction.channel?.send({ content: `An error occurred, please try again later.` });

                                // Deduct jades from user
                                await query(`UPDATE users SET jades = jades - $1 WHERE id = $2`, [premium.price, interaction.user.id]);

                                if (server.premium === premium.tier) {
                                    // Extend server premium
                                    await query(`UPDATE servers SET premium_expires = $1 WHERE id = $2`, [new Date((server.premium_expires ?? new Date()).getTime() + 30 * 24 * 60 * 60 * 1000), interaction.guildId]);
                                } else {
                                    await query(`UPDATE servers SET premium = $1, premium_expires = $2 WHERE id = $3`, [premium.tier, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), interaction.guildId]);
                                };

                                return interaction.channel?.send({ content: `🎉 Purchased Server Premium ${premium.tier} for **${interaction.guild?.name}**!` });
                            });
                        });
                    };

                    // Pagination
                    if (r.customId === "prev" || r.customId === "next") {
                        currPage = (r.customId === "prev")
                            ? (currPage > 1 ? currPage - 1 : pagesTotal)
                            : (currPage < pagesTotal ? currPage + 1 : 1);

                        Embed.setDescription(formatServerPremiumPage(premiumType[currPage - 1])).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                        return interaction.editReply({ embeds: [Embed] });
                    };
                });

            });
        };

    },
};

export default exportCommand;

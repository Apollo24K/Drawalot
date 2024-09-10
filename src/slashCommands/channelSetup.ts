import { SlashCommandBuilder, ChannelType } from "discord.js";
import { SlashCommand } from "../types";
import { query } from "../postgres";

const command = new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Set the bot up for your server")
    .addSubcommand(subcommand =>
        subcommand
            .setName("channel")
            .setDescription("Select a channel to send activity based drops to")
            .addChannelOption(option =>
                option.setName("channel")
                    .setDescription("Select the channel to send activity based drops to")
                    .setRequired(false)
                    .addChannelTypes(ChannelType.GuildText)
            )
            .addBooleanOption(option =>
                option.setName("global")
                    .setDescription("Allow drops to appear in all channels")
                    .setRequired(false)
            )
    );

const exportCommand: SlashCommand = {
    command,
    permissions: ["Administrator", "ManageGuild"],
    execute: async ({ interaction, server }) => {

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "channel") {
            const global = interaction.options.getBoolean("global");

            if (global !== null) {
                await query(`UPDATE servers SET allow_global_drops = $1 WHERE id = $2`, [global, interaction.guildId]);

                const content = global ?
                    "Activity based drops can now appear in all channels <:KaeriThumbsUp:928369523021742090>"
                    :
                    (server.schema?.drop_channel ?
                        `Activity based drops will now be sent to <#${server.schema.drop_channel}> only <:KaeriThumbsUp:928369523021742090>`
                        :
                        "Activity based drops will no longer appear in any channel. Use `/setup channel <channel>` to select a channel"
                    );

                return interaction.reply({ content });
            };

            const channel = interaction.options.getChannel("channel");
            if (!channel) return interaction.reply({ content: "Please provide a valid text channel", ephemeral: true });

            // Save channel to database
            await query(`UPDATE servers SET drop_channel = $1 WHERE id = $2`, [channel.id, interaction.guildId]);

            return interaction.reply({ content: `Activity based drops will now be sent to <#${channel.id}> <:KaeriThumbsUp:928369523021742090>` });
        };

    },
};

export default exportCommand;

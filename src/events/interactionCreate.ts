import { Interaction, PermissionsBitField } from "discord.js";
import { BotEvent, Locale, ServerSchema, UserSchema } from "../types";
import { query } from "../postgres";
import { queryServerSchema, queryUserSchema } from "../functions";
import { Links } from "../shared/components";

const event: BotEvent = {
    name: "interactionCreate",
    execute: async (interaction: Interaction) => {
        if (interaction.user.bot) return;

        // return if banned
        const isBanned = interaction.client.bannedUsers.get(interaction.user.id);
        if (isBanned) {
            if (interaction.isChatInputCommand()) interaction.reply(`Your account has been suspended${isBanned.reason ? ` for "${isBanned.reason}"` : ""}.\nIf you believe there to be a mistake, please join our support server below to appeal for this decision.\n**Support Server**: ${Links.Support}`);
            return;
        };

        if (interaction.isChatInputCommand()) {
            const command = interaction.client.slashCommands.get(interaction.commandName);
            if (!command) return;

            // ADD NEW PLAYERS
            const author: { query: UserSchema; } = {} as { query: UserSchema; };
            const entryExists = await queryUserSchema(interaction.user.id); // Check if user exists in the db
            if (entryExists) { // Update username if changed
                author.query = entryExists;
                if (author.query.name !== interaction.user.username) {
                    await query('UPDATE users SET name = $1 WHERE id = $2', [interaction.user.username, interaction.user.id]);
                    author.query.name = interaction.user.username;
                };
            } else { // Add new player if not exists
                await query('INSERT INTO users (id, name) VALUES ($1, $2)', [interaction.user.id, interaction.user.username]);
                author.query = await queryUserSchema(interaction.user.id) as UserSchema;
            };

            // ADD NEW SERVERS
            const server: { schema?: ServerSchema; } = {} as { schema?: ServerSchema; };
            if (interaction.guild) {
                const serverEntry = await queryServerSchema(interaction.guild.id); // Check if server exists in the db
                if (serverEntry) { // Add players to server
                    server.schema = serverEntry;
                    if (!serverEntry.user_ids.includes(interaction.user.id)) {
                        await query(`UPDATE servers SET user_ids = array_append(user_ids, $1) WHERE id = $2 AND NOT (user_ids @> ARRAY[$1::TEXT])`, [interaction.user.id, serverEntry.id]);
                        server.schema.user_ids.push(interaction.user.id);
                    };
                } else { // Add new server if not exists
                    await query('INSERT INTO servers (id, name, user_ids) VALUES ($1, $2, ARRAY[$3::text])', [interaction.guild.id, interaction.guild.name, interaction.user.id]);
                    server.schema = await queryServerSchema(interaction.guild.id) as ServerSchema;
                };
            };

            // Set locale
            const locale: Locale = (['en_US', 'de_DE', 'es_ES', 'fr_FR', 'it_IT', 'ja_JP', 'ko_KR', 'ru_RU', 'tr_TR', 'vi_VN'].find((lang) => lang.startsWith(interaction.guildLocale?.split("-")?.[0] || "xyz")) || 'en_US') as Locale;

            // Permissions
            if (interaction.guild) {
                // Bot Permissions
                if (interaction.guild.members.me?.isCommunicationDisabled() || !interaction.guild.members.me?.permissions.has([PermissionsBitField.Flags.SendMessages])) return;
                if (!interaction.guild.members.me?.permissions.has([PermissionsBitField.Flags.UseExternalEmojis, PermissionsBitField.Flags.EmbedLinks, PermissionsBitField.Flags.AttachFiles])) return interaction.reply({ content: `Missing Permissions, please make sure ${interaction.client.user.username} has the following permissions:\n-Send Messages\n- Attach Files\n- Embed Links\n- Use External Emojis\nNote that some commands may require additional permissions to work`, ephemeral: true });
                // if (command.permissions && !interaction.guild.members.me?.permissions.has(command.permissions.map((e) => PermissionsBitField.Flags[e]))) return interaction.reply({ content: `Missing Permissions, please make sure ${interaction.client.user.username} has the following permissions:\n- ${command.permissions.join("\n- ")}`, ephemeral: true });

                // User Permissions
                if (command.permissions && !interaction.memberPermissions?.has(command.permissions.map((e) => PermissionsBitField.Flags[e]))) return interaction.reply({ content: `You are not authorized to use this command\nRequired Permissions:\n- ${command.permissions.join("\n- ")}`, ephemeral: true });
            };

            // Cooldown
            const cooldown = interaction.client.cooldowns.get(`${interaction.commandName}-${interaction.user.username}`);
            if (command.cooldown) {
                if (cooldown && Date.now() < cooldown) return interaction.reply({ content: `Please wait ${Math.ceil((cooldown - Date.now()) / 1000)}s to use this command again`, ephemeral: true });
                interaction.client.cooldowns.set(`${interaction.commandName}-${interaction.user.username}`, Date.now() + command.cooldown * 1000);
                setTimeout(() => interaction.client.cooldowns.delete(`${interaction.commandName}-${interaction.user.username}`), command.cooldown * 1000);
            };

            return command.execute({ interaction, locale, author, server });
        };

        if (interaction.isAutocomplete()) {
            const command = interaction.client.slashCommands.get(interaction.commandName);
            if (!command) return console.error(`No command matching ${interaction.commandName} was found.`);
            if (!command.autocomplete) return;

            const focusedValue = interaction.options.getFocused();
            // const autocomplete = command.autocomplete({interaction});
            const choices = await command.autocomplete({ interaction }); // .filter((e) => e.name.toLowerCase().includes(focusedValue.toLowerCase()));

            return interaction.respond(choices.slice(0, 25));
        };

        // Defer Buttons
        if (interaction.isButton()) {
            if (interaction.customId?.startsWith("ignore_defer")) return;
            interaction.deferUpdate().catch(() => {
                console.log(`ERROR 'deferUpdate()' Button Interaction with customId "${interaction.customId}" Failed`);
            });
        };

    },
};

export default event;
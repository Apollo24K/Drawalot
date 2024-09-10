import { ChannelType, Message } from "discord.js";
import { checkPermissions, queryServerSchema, queryUserSchema, sendTimedMessage } from "../functions";
import { BotEvent, Locale, ServerSchema, UserSchema } from "../types";
import { query } from '../postgres';

const event: BotEvent = {
    name: "messageCreate",
    execute: async (message: Message) => {
        if (message.author.bot) return;

        // Test activities
        if (message.channel.type === ChannelType.GuildText && message.guild) {
            for (const [, activity] of message.client.activities) {
                // Cooldown
                if (activity.cooldown) {
                    const cooldown = message.client.cooldowns.get(`${activity.name}-${message.guild.id}`);
                    if (cooldown && Date.now() < cooldown) return;
                    message.client.cooldowns.set(`${activity.name}-${message.guild.id}`, Date.now() + activity.cooldown * 1000);
                    setTimeout(() => message.client.cooldowns.delete(`${activity.name}-${message.member?.user.username}`), activity.cooldown * 1000);
                };

                // Execute activity
                activity.execute({ message, activity });
            };
        };

        // Create Prefix
        let prefix = process.env.PREFIX;
        if (message.content.startsWith(`<@${message.client.user.id}>`)) prefix = `<@${message.client.user.id}>`;
        if (!message.content.startsWith(prefix)) return;

        // Prepare command
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const cmd = args.shift()?.toLowerCase();
        if (!cmd) return;

        // See if command exists
        const command = message.client.commands.get(cmd) || message.client.commands.find((command) => command.aliases.includes(cmd));
        if (!command) {
            const slashCmds = await message.client.application?.commands.fetch();
            const slashCmd = slashCmds.find(e => e.name === cmd);
            if (slashCmd) message.channel.send(`A prefix version of the </${slashCmd.name}:${slashCmd.id}> command doesn't exist yet, please use the slash counterpart for now`);
            return;
        };

        // ADD NEW PLAYERS
        const author: { query: UserSchema; } = {} as { query: UserSchema; };
        const entryExists = await queryUserSchema(message.author.id); // Check if user exists in the db
        if (entryExists) { // Update username if changed
            author.query = entryExists;
            if (author.query.name !== message.author.username) {
                await query('UPDATE users SET name = $1 WHERE id = $2', [message.author.username, message.author.id]);
                author.query.name = message.author.username;
            };
        } else { // Add new player if not exists
            await query('INSERT INTO users (id, name) VALUES ($1, $2)', [message.author.id, message.author.username]);
            author.query = await queryUserSchema(message.author.id) as UserSchema;
        };

        // ADD NEW SERVERS
        const server: { schema?: ServerSchema; } = {} as { schema?: ServerSchema; };
        if (message.channel.type === ChannelType.GuildText && message.guild) {
            const serverEntry = await queryServerSchema(message.guild.id); // Check if server exists in the db
            if (serverEntry) { // Add players to server
                server.schema = serverEntry;
                if (!serverEntry.user_ids.includes(message.author.id)) {
                    await query(`UPDATE servers SET user_ids = array_append(user_ids, $1) WHERE id = $2 AND NOT (user_ids @> ARRAY[$1::TEXT])`, [message.author.id, serverEntry.id]);
                    server.schema.user_ids.push(message.author.id);
                };
            } else { // Add new server if not exists
                await query('INSERT INTO servers (id, name, user_ids) VALUES ($1, $2, ARRAY[$3::text])', [message.guild.id, message.guild.name, message.author.id]);
                server.schema = await queryServerSchema(message.guild.id) as ServerSchema;
            };
        };

        // Set locale
        const locale: Locale = (['en_US', 'de_DE', 'es_ES', 'fr_FR', 'it_IT', 'ja_JP', 'ko_KR', 'ru_RU', 'tr_TR', 'vi_VN'].find((lang) => lang.startsWith(message.guild?.preferredLocale?.split("-")?.[0] || "xyz")) || 'en_US') as Locale;

        // Check Permissions in Guild
        if (message.channel.type === ChannelType.GuildText && message.member) {
            // Check Member Permissions
            let neededPermissions = checkPermissions(message.member, command.permissions);
            if (neededPermissions !== null) return sendTimedMessage(`You don't have enough permissions to use this command. Needed permissions:\n- ${neededPermissions.join("\n- ")}`, message.channel, 5000);
        };

        // Cooldown
        const cooldown = message.client.cooldowns.get(`${command.name}-${message.author.username}`);
        if (command.cooldown) {
            if (cooldown && Date.now() < cooldown) {
                if (message.channel.type === ChannelType.GuildText) sendTimedMessage(`Please wait ${Math.floor((cooldown - Date.now()) / 1000)}s to use this command again.`, message.channel, 5000);
                return;
            };
            message.client.cooldowns.set(`${command.name}-${message.author.username}`, Date.now() + command.cooldown * 1000);
            setTimeout(() => message.client.cooldowns.delete(`${command?.name}-${message.member?.user.username}`), command.cooldown * 1000);
        };


        command.execute({ message, author, server, args, locale, cmd, prefix });
    },
};

export default event;
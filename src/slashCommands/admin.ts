import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import { query } from "../postgres";
import { insertCharacter, search } from "../functions";

const command = new SlashCommandBuilder()
    .setName('admin')
    .addStringOption(option => option.setName('action').setDescription('Choose an action to take').setRequired(true))
    .addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(false))
    .addBooleanOption(option => option.setName('ephemeral').setDescription('Ephemeral?').setRequired(false))
    .setDescription('Only bot administrators can use this command');

const exportCommand: SlashCommand = {
    command,
    async execute({ interaction }) {

        const user = interaction.options.getUser('user') || null;
        let action = interaction.options.getString('action') || "";
        const ephemeral = interaction.options.getBoolean('ephemeral') || true;

        let args = action.trim().split(/ +/g);
        const cmd = args.shift()?.toLowerCase() as string;

        // Return if not admin
        if (!process.env.ADMINS.split(",").includes(interaction.user.id)) return interaction.reply({ content: "You're not allowed to use this command", ephemeral });

        // List all actions
        if (action === "list") {
            return interaction.reply({ content: ">>> `list`\n`set <key> <value> [--table] [WHERE condition]`\n`leave server <guildId>`\n`query <sql>`\n`dm <message>`\n`say <message>`", ephemeral });
        };

        // Set db
        if (action.startsWith("set")) {
            const [, key, value, ...rest] = action.split(" ");
            let table = "users", condition = "";

            // Check for table specification
            if (rest.includes("--")) {
                const tableIndex = rest.indexOf("--");
                table = rest[tableIndex + 1];
                rest.splice(tableIndex, 2);
            };

            // Build condition
            if (user) condition = `WHERE id = $2`;
            else if (rest.length >= 2 && rest[0].toLowerCase() === "where") condition = `WHERE ${rest.slice(1).join(" ")}`;

            // Validate inputs
            if (!key || !value) {
                return interaction.reply({ content: "Invalid syntax. Use: set <key> <value> [--table] [WHERE condition]", ephemeral });
            };

            try {
                await query(`UPDATE ${table} SET ${key.toLowerCase()} = $1 ${condition}`, user ? [value, user.id] : [value]);
                return interaction.reply({ content: `Successfully updated ${key} in ${table}`, ephemeral });
            } catch (error) {
                return interaction.reply({ content: `An error occurred while updating the database: ${error}`, ephemeral });
            };
        };

        // Leave Server, usage: /admin leave server <guildId>
        if (action.startsWith("leave server")) {
            const guildId = action.split(" ")[2];
            const guild = interaction.client.guilds.cache.get(guildId);

            if (!guild) return interaction.reply({ content: `Couldn't find guild with ID ${guildId}`, ephemeral });

            try {
                await guild.leave();
                return interaction.reply({ content: `Successfully left guild: ${guild.name} (ID: ${guild.id})`, ephemeral });
            } catch (error) {
                console.error(`Error leaving guild ${guild.id}:`, error);
                return interaction.reply({ content: `An error occurred while trying to leave ${guild.name}. Check console for details.`, ephemeral });
            };
        };

        // Query DB
        if (cmd === "query") {
            if (args[0].toUpperCase() === "DROP" || args[0].toUpperCase() === "ALTER" || args[0].toUpperCase() === "DELETE" || args[0].toUpperCase() === "TRUNCATE") return interaction.reply({ content: "not allowed", ephemeral });
            const res = await query(args.join(" ") + (user ? ` WHERE id = ${user.id}` : "")) as any[];
            if (res.length) return interaction.reply({ content: JSON.stringify(res).slice(0, 2000), ephemeral });
            return interaction.reply({ content: "Action Successful", ephemeral });
        };

        // Send DM
        if (cmd === "dm") {
            user?.send(args.join(" "));
            return interaction.reply({ content: "Action Successful", ephemeral });
        };

        // Repeat text
        if (cmd === "say") {
            return interaction.channel?.send(args.join(" "));
        };

        // Add character
        if (action.startsWith("add char")) {
            if (!user) return interaction.reply({ content: `Error: missing user object\n\nUsage: \`/admin add char <name> user:@user\`\n\n**Options**\n\`name\`: Name or ID of the character to be added`, ephemeral });

            args.shift();
            const char = search(args.join(" "), interaction, true);
            if (!char) return interaction.reply({ content: `Error: Couldn't find character "${args.join(" ")}"\n\nUsage: \`/admin add char <name> user:@user\`\n\n**Options**\n\`name\`: Name or ID of the character to be added`, ephemeral });

            // Insert the character
            await insertCharacter(user.id, char);

            return interaction.reply({ content: `Action Successful: Added **${char.name}** to ${user.toString()}`, ephemeral });
        };

    },
};

export default exportCommand;

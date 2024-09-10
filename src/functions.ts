import { ButtonInteraction, ChatInputCommandInteraction, Collection, DMChannel, GuildMember, PartialDMChannel, PermissionFlagsBits, PermissionResolvable, TextChannel, User } from "discord.js";
import { DropRates, Gender, IAnimeInfo, ICharacterInfo, InventorySchema, Rarity, ServerSchema, UserSchema } from "./types";
import { query } from "./postgres";
import Inventory, { InventoryEntry } from "./shared/inventory";

export const checkPermissions = (member: GuildMember, permissions: Array<PermissionResolvable>) => {
    let neededPermissions: PermissionResolvable[] = [];
    permissions.forEach(permission => {
        if (!member.permissions.has(permission)) neededPermissions.push(permission);
    });
    if (neededPermissions.length === 0) return null;
    return neededPermissions.map(p => {
        if (typeof p === "string") return p.split(/(?=[A-Z])/).join(" ");
        else return Object.keys(PermissionFlagsBits).find(k => Object(PermissionFlagsBits)[k] === p)?.split(/(?=[A-Z])/).join(" ");
    });
};

export const sendTimedMessage = (message: string, channel: TextChannel, duration: number) => {
    return channel.send(message).then(m => setTimeout(async () => (await channel.messages.fetch(m)).delete(), duration));
};

export const sendTimedMessageDM = (message: string, channel: DMChannel | PartialDMChannel, duration: number) => {
    return channel.send(message).then(m => setTimeout(async () => (await channel.messages.fetch(m)).delete(), duration));
};

export const replyToButton = async (interaction: ButtonInteraction, { content, ephemeral }: { content: string, ephemeral: boolean; }): Promise<void> => {
    try {
        await interaction.followUp({ content, ephemeral });
    } catch {
        try {
            await interaction.reply({ content, ephemeral });
        } catch {
            try {
                await interaction.followUp({ content, ephemeral });
            } catch {
                try {
                    await interaction.reply({ content, ephemeral });
                } catch { };
            };
        };
    };
};

export const search = (name: string, interaction: ChatInputCommandInteraction, silent: boolean = false): ICharacterInfo | undefined => {
    const characters = interaction.client.characters;
    name = name.toLowerCase().split(" ").filter((e: string) => e).join(" ");

    if (!isNaN(Number(name))) {
        const id = parseInt(name);
        if (id < 0) {
            if (!silent) interaction.reply("The ID can't be negative.");
            return;
        }
        if (id >= characters.size) {
            if (!silent) interaction.reply(`The ID must be smaller than ${characters.size}`);
            return;
        };
        if (!(name[0] === "0" && name.length > 1)) return characters.get(id);
    };

    // Full Name Search
    let fastCheck = characters.filter((e) => e.name.toLowerCase() === name || e.aliases.some((a: string) => a.toLowerCase() === name));
    if (fastCheck.size > 0) return fastCheck.first();

    // Filter
    const fArray = characters.filter((e) => e.name.toLowerCase().startsWith(name) || e.aliases.some((a: string) => a.toLowerCase().startsWith(name)));

    if (fArray.size === 0) {
        if (!silent) interaction.reply("No match found");
        return;
    };
    if (fArray.size > 1) {
        if (!silent) interaction.reply(`${fArray.size} matches found:\n> ‧ ${fArray.sort((a, b) => Number(b.name.toLowerCase().startsWith(name)) - Number(a.name.toLowerCase().startsWith(name))).map((e: any) => e.name.toLowerCase().startsWith(name) ? e.name : e.name + " (alias: " + e.alias.find((a: string) => a.toLowerCase().startsWith(name)) + ")").slice(0, 8).join('\n> ‧ ')}${fArray.size > 8 ? `\n+ ${fArray.size - 8} more` : ""}`);
        return;
    };
    return fArray.first();
};

export const searchAnime = (name: string, interaction: ChatInputCommandInteraction, silent: boolean = false): IAnimeInfo | undefined => {
    const animes = interaction.client.anime;
    name = name.toLowerCase().split(" ").filter((e: string) => e).join(" ");

    if (!isNaN(Number(name))) {
        const id = parseInt(name);
        if (id < 0) {
            if (!silent) interaction.reply("The ID can't be negative.");
            return;
        }
        if (id >= animes.size) {
            if (!silent) interaction.reply(`The ID must be smaller than ${animes.size}`);
            return;
        };
        if (!(name[0] === "0" && name.length > 1)) return animes.get(id);
    };

    // Full Name Search
    let fastCheck = animes.filter((e) => e.name.toLowerCase() === name || e.aliases.some((a: string) => a.toLowerCase() === name));
    if (fastCheck.size > 0) return fastCheck.first();

    // Filter
    const fArray = animes.filter((e) => e.name.toLowerCase().startsWith(name) || e.aliases.some((a: string) => a.toLowerCase().startsWith(name)));

    if (fArray.size === 0) {
        if (!silent) interaction.reply("No match found");
        return;
    };
    if (fArray.size > 1) {
        if (!silent) interaction.reply(`${fArray.size} matches found:\n> ‧ ${fArray.sort((a, b) => Number(b.name.toLowerCase().startsWith(name)) - Number(a.name.toLowerCase().startsWith(name))).map((e: any) => e.name.toLowerCase().startsWith(name) ? e.name : e.name + " (alias: " + e.alias.find((a: string) => a.toLowerCase().startsWith(name)) + ")").slice(0, 8).join('\n> ‧ ')}${fArray.size > 8 ? `\n+ ${fArray.size - 8} more` : ""}`);
        return;
    };
    return fArray.first();
};

export const daysSince = (lastDate: Date) => {
    if (!lastDate) return 0;
    const now = new Date();
    // set to midnight
    now.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);

    const diffTime = now.getTime() - lastDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

export const drawCharacter = (characters: Collection<number, ICharacterInfo>, flags: { gender?: Gender; } = {}, overrideDropRates?: DropRates): ICharacterInfo | undefined => {
    const dropRates: DropRates = overrideDropRates ?? [
        { rarity: 0, rate: 0.58 },
        { rarity: 1, rate: 0.25 },
        { rarity: 2, rate: 0.11 },
        { rarity: 3, rate: 0.042 },
        { rarity: 4, rate: 0.014 },
        { rarity: 5, rate: 0.0039 },
        { rarity: 6, rate: 0.0001 },
    ];

    const selectedRarity: Rarity = (() => {
        const random = Math.random();
        let cumulativeRate = 0;
        for (const { rarity, rate } of dropRates) {
            cumulativeRate += rate;
            if (random < cumulativeRate) return rarity;
        };
        return 1;
    })();

    // Filters
    characters = characters.filter((e) => e.rarity === selectedRarity);
    if (flags.gender) characters = characters.filter((e) => e.gender === flags.gender);

    // Draw a random character from the filtered collection
    return characters.at(Math.floor(Math.random() * characters.size));
};

export const showPage = <T>(currPage: number, arr: T[], elements: number = 15): T[] => {
    return arr.slice((currPage - 1) * elements, currPage * elements);
};

export const queryUserInventory = async (userId: string) => {
    const user = await query(`SELECT * FROM inventory WHERE user_id = $1`, [userId]) as InventorySchema[];
    return user;
};

export const getUserInventory = async (interaction: ChatInputCommandInteraction, user: User, anime?: IAnimeInfo) => {
    const inv = await queryUserInventory(user.id);
    const inventory = new Inventory(inv, interaction.client);

    return anime
        ? new Inventory(inventory.filterAnime(anime))
        : inventory;
};

export async function getInventoryCharacter(interaction: ChatInputCommandInteraction, character: ICharacterInfo, code: string): Promise<InventoryEntry | undefined>;
export async function getInventoryCharacter(interaction: ChatInputCommandInteraction, rowid: string): Promise<InventoryEntry | undefined>;
export async function getInventoryCharacter(interaction: ChatInputCommandInteraction, characterOrRowId: ICharacterInfo | string, code?: string): Promise<InventoryEntry | undefined> {
    let charSchema: InventorySchema | undefined;

    if (typeof characterOrRowId === 'string') {
        [charSchema] = await query(`SELECT * FROM inventory WHERE rowid = $1`, [characterOrRowId]) as InventorySchema[];
    } else {
        [charSchema] = await query(`SELECT * FROM inventory WHERE char_id = $1 AND id = $2`, [characterOrRowId.id, code]) as InventorySchema[];
    };

    if (!charSchema) return;
    return new InventoryEntry(charSchema, interaction.client);
};

export const getFavChar = async (interaction: ChatInputCommandInteraction, rowid: string | undefined): Promise<InventoryEntry | undefined> => {
    if (!rowid) return;
    const char = await getInventoryCharacter(interaction, rowid);
    if (!char) return;
    if (char.userId !== interaction.user.id) return;
    return char;
};

export const queryUserSchema = async (userId: string): Promise<UserSchema | undefined> => {
    const [user] = await query(`SELECT * FROM users WHERE id = $1`, [userId]) as UserSchema[];
    return user;
};

export const queryServerSchema = async (guildId: string): Promise<ServerSchema | undefined> => {
    const [server] = await query(`SELECT * FROM servers WHERE id = $1`, [guildId]) as ServerSchema[];
    return server;
};

export const insertCharacter = async (userId: string, character: ICharacterInfo) => {
    await query(`INSERT INTO inventory (user_id, char_id, rarity, claimed_by) VALUES ($1, $2, $3, $1)`, [userId, character.id, character.rarity]);
};

import { User, InteractionCollector, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder, ComponentEmojiResolvable, CacheType, SlashCommandBuilder, StringSelectMenuInteraction, Interaction, InteractionResponse, AttachmentBuilder, ActionRowBuilder, EmbedBuilder, BufferResolvable, JSONEncodable, APIAttachment, Attachment, AttachmentPayload, APIActionRowComponent, APIMessageActionRowComponent, ActionRowData, MessageActionRowComponentData, MessageActionRowComponentBuilder, CommandInteraction, ButtonInteraction, Collection, PermissionResolvable, PermissionFlagsBits, Message, AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";

export type Locale = 'en_US' | 'de_DE' | 'es_ES' | 'fr_FR' | 'it_IT' | 'ja_JP' | 'ko_KR' | 'ru_RU' | 'tr_TR' | 'vi_VN';

export type Rarity = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type Gender = 'M' | 'F' | 'NB';

export type PremiumTier = 0 | 1 | 2 | 3;

export type PremiumInfo = {
    type: "Player" | "Server";
    tier: number;
    price: number;
    benefits: { name: string; value: string[]; }[];
};

interface ICharacterInfo {
    id: number;
    name: string;
    anime_id: number;
    aliases: string[];
    image_url: string;
    rarity: Rarity;
    gender: Gender;
    names: string[];
    rarityColor: ColorResolvable;

    anime(anime: Collection<number, IAnimeInfo>): IAnimeInfo;
};

interface IAnimeInfo {
    id: number;
    name: string;
    aliases: string[];
    names: string[];
    splitName: string;

    characters(characters: Collection<number, ICharacterInfo>): Collection<number, ICharacterInfo>;
};

type RankShopTransaction = {
    authorization?: string;
    txn_id: string;
    status: string;
    buyer_email: string;
    buyer_id?: string;
    product_id: string;
    recurring: boolean;
    price: string;
    price_in_cents: number;
    currency: string;
    first_purchase: boolean;
    timestamp: number;
};

interface UserSchema {
    id: string;
    name: string;
    created: Date;
    deleteacc?: Date;
    prefix?: string;
    lang?: string;
    referred_by?: string;
    premium: PremiumTier;
    premium_expires?: Date;
    xp: number;
    fav_char?: string;
    coins: number;
    gems: number;
    jades: number;
    lastonline: Date;
    lastvote?: Date;
    lastweekly?: Date;
    lastdaily?: Date;
    dailystreak: number;
    lastrush?: Date;
    rushclaimed: number;
    draws: number;
    drawstotal: number;
    claims: number;
    claimstotal: number;
    votestotal: number;
    votereminder: boolean;
    transactions: RankShopTransaction[];
}

interface ServerSchema {
    id: string;
    name: string;
    user_ids: string[];
    prefix?: string;
    drop_channel?: string;
    allow_global_drops: boolean;
    premium: PremiumTier;
    premium_expires?: Date;
}

interface AnimeSchema {
    id: number;
    name: string;
    aliases: string[];
}

interface CharacterSchema {
    id: number;
    name: string;
    anime_id: number;
    aliases: string[];
    image_url: string;
    rarity: Rarity;
    gender: Gender;
}

interface InventorySchema {
    rowid: number;
    id: string;
    user_id: string;
    char_id: number;
    rarity: number;
    alias?: string;
    custom_image_url?: string;
}

interface executeSlashCommand {
    interaction: ChatInputCommandInteraction,
    locale: Locale,
    author: { query: UserSchema; },
    server: { schema?: ServerSchema; },
    reply?: any,
    warn?: any,
    customFlag?: any,
}

interface helpCommand {
    interaction?: ChatInputCommandInteraction,
    message?: Message,
    commandName: string,
    locale: Locale,
}

export interface SlashCommand {
    command: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder,
    execute: ({ }: executeSlashCommand) => void,
    help?: ({ }: helpCommand) => void,
    // execute: ({interaction: ChatInputCommandInteraction, text: string}) => void,
    autocomplete?: ({ }: { interaction: AutocompleteInteraction; }) => Promise<Array<{ name: string, value: string; }>>,
    cooldown?: number, // in seconds
    permissions?: Array<keyof typeof PermissionFlagsBits>,
}

interface executeCommand {
    message: Message,
    args: Array<string>,
    cmd: string,
    prefix: string,
    locale: Locale,
    author: { query: UserSchema; },
    server: { schema?: ServerSchema; },
    msg?: Message,
}

export interface Command {
    name: string,
    aliases: Array<string>,
    permissions: Array<PermissionResolvable>,
    cooldown?: number,
    disabled?: boolean,
    execute: ({ }: executeCommand) => void,
    help?: ({ }: helpCommand) => void,
}

interface executeGuildActivity {
    message: Message,
    activity: GuildActivity,
    locale?: Locale,
}

export interface GuildActivity {
    name: string,
    cooldown?: number,
    disabled?: boolean,
    execute: ({ }: executeGuildActivity) => void,
}

interface GuildOptions {
    prefix: string,
}

export type GuildOption = keyof GuildOptions;
export interface BotEvent {
    name: string,
    once?: boolean,
    disabled?: boolean,
    execute: (...args?) => void;
}

export interface BotHandler {
    name: string,
    once?: boolean,
    disabled?: boolean,
    execute: (...args?) => void;
}

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TOKENS: string,
            CLIENT_IDS: string,
            PREFIX: string,
            PG_USER: string,
            PG_DATABASE: string,
            PG_PASSWORD: string,
            PG_PORT: string,
            RANK_AUTH: string,
            ADMINS: string,
            VERSION: string,
        }
    }
}

declare module "discord.js" {
    export interface Client {
        id: string;
        token: string;
        slashCommands: Collection<string, SlashCommand>;
        commands: Collection<string, Command>;
        activities: Collection<string, GuildActivity>;
        cooldowns: Collection<string, number>;
        anime: Collection<number, IAnimeInfo>;
        characters: Collection<number, ICharacterInfo>;
    }
}

export type DropRates = [
    { rarity: 0, rate: number; },
    { rarity: 1, rate: number; },
    { rarity: 2, rate: number; },
    { rarity: 3, rate: number; },
    { rarity: 4, rate: number; },
    { rarity: 5, rate: number; },
    { rarity: 6, rate: number; },
];

type DropButton = {
    id: string;
    emoji: string;
};

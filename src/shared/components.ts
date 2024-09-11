import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ColorResolvable } from "discord.js";
import { DropButton, DropRates, PremiumInfo } from "../types";

export const PageRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('prev')
            .setEmoji('⏪')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('next')
            .setEmoji('⏩')
            .setStyle(ButtonStyle.Secondary),
    );

export const OfferRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('confirm')
            .setEmoji('<:check_icon:683671903143067743>')
            .setLabel('confirm')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('cancel')
            .setEmoji('<:stop_icon:683671917353369600>')
            .setLabel('cancel')
            .setStyle(ButtonStyle.Danger),
    );

export const NextRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Next')
            .setStyle(ButtonStyle.Primary),
    );

export const BackRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('back')
            .setLabel('Go Back')
            .setEmoji('⬅️')
            .setStyle(ButtonStyle.Secondary),
    );

export const KeepAccountRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('keep')
            .setLabel('Yes, Keep My Account')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Go Back')
            .setStyle(ButtonStyle.Secondary),
    );

export const DeleteAccountRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('delete')
            .setLabel('Delete Account')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Go Back')
            .setStyle(ButtonStyle.Success),
    );

export const StartRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('start')
            .setLabel('Start Now')
            .setStyle(ButtonStyle.Success),
    );

export const getDrawRow = (canDraw: boolean, claimed: boolean = false) => {
    return new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('draw')
                .setLabel('Draw Again')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(!canDraw),
            new ButtonBuilder()
                .setCustomId('claim')
                .setLabel(claimed ? 'Claimed' : 'Claim')
                .setStyle(ButtonStyle.Success)
                .setDisabled(claimed),
        );
};

export enum Constants {
    StaminaCap = 240,
}

export const embedColor = 0x97d4ea;
export const botPfp = "https://i.imgur.com/Ee3t12c.jpeg";
export const rarityEmoji = ["<:1star:1105061314784661524>", "<:2star:1105061319834615819>", "<:3star:1105061336251113482>", "<:4star:1105061832667971694>", "<:5star:1105061866318856192>", "<:6star:1105061896484298793>", "<a:7star:1280243589888344075>"];
export const rarityEmojis = ["<:1star:1105061314784661524>", "<:2star:1105061319834615819><:2star:1105061319834615819>", "<:3star:1105061336251113482><:3star:1105061336251113482><:3star:1105061336251113482>", "<:4star:1105061832667971694><:4star:1105061832667971694><:4star:1105061832667971694><:4star:1105061832667971694>", "<:5star:1105061866318856192><:5star:1105061866318856192><:5star:1105061866318856192><:5star:1105061866318856192><:5star:1105061866318856192>", "<:6star:1105061896484298793><:6star:1105061896484298793><:6star:1105061896484298793><:6star:1105061896484298793><:6star:1105061896484298793><:6star:1105061896484298793>", "<a:7star:1280243589888344075><a:7star:1280243589888344075><a:7star:1280243589888344075><a:7star:1280243589888344075><a:7star:1280243589888344075><a:7star:1280243589888344075><a:7star:1280243589888344075>"];
export const rarityColors: ColorResolvable[] = [0x7a7a7a, 0x44d53a, 0xf2591c, 0x2cdfe5, 0xfef300, 0x9952eb, 0x2aad9d];

export enum Links {
    Terms = "https://rank.top/bot/drawalot?page=terms",
    Privacy = "https://rank.top/bot/drawalot?page=privacy",
    Support = "https://discord.gg/myy9PBCdEW",
    Camelot = "https://rank.top/bot/camelot",
    Vote = "https://top.gg/bot/1280021661525086299/vote",
    Github = "https://github.com/Apollo24K/Drawalot",
    License = "https://github.com/Apollo24K/Drawalot/blob/main/LICENSE.txt",
};

export enum Emojis {
    Gold = "<:gold:1069048245206138963>",
    Gem = "<:genesis_gems:1034179687720681492>",
    Jade = "<:eternal_jade:1256124504141201428>",
};

export const playerPremium: PremiumInfo[] = [
    {
        type: "Player",
        tier: 1,
        price: 300,
        benefits: [
            { name: "Increased Draws", value: ["12 draws per interval instead of 8!"] },
            { name: "Increased Claims", value: ["4 claims per interval instead of 3!"] },
            { name: "Increased Daily Rewards", value: ["Get 25% more coins!"] },
            { name: "Extended Rush", value: ["Get 60 seconds of time during </rush:1280671324007563334> instead of 45!"] },
        ]
    },
    {
        type: "Player",
        tier: 2,
        price: 900,
        benefits: [
            { name: "Increased Draws", value: ["16 draws per interval instead of 8!"] },
            { name: "Increased Claims", value: ["5 claims per interval instead of 3!"] },
            { name: "Increased Daily Rewards", value: ["Get 50% more coins!"] },
            { name: "Extended Rush", value: ["Get 75 seconds of time during </rush:1280671324007563334> instead of 45!"] },
        ]
    },
    {
        type: "Player",
        tier: 3,
        price: 2000,
        benefits: [
            { name: "Increased Draws", value: ["20 draws per interval instead of 8!"] },
            { name: "Increased Claims", value: ["6 claims per interval instead of 3!"] },
            { name: "Increased Daily Rewards", value: ["Get 80% more coins!"] },
            { name: "Extended Rush", value: ["Get 90 seconds of time during </rush:1280671324007563334> instead of 45!"] },
        ]
    },
];

export const serverPremium: PremiumInfo[] = [
    {
        type: "Server",
        tier: 1,
        price: 300,
        benefits: [
            { name: "Increased Activity Drops", value: ["8 minutes cooldown instead of 10!"] },
            { name: "Better Activity Drop Rates", value: ["A lot less Common <:1star:1105061314784661524> drops!", "See `/help activity drops` for details"] },
        ]
    },
    {
        type: "Server",
        tier: 2,
        price: 900,
        benefits: [
            { name: "Increased Activity Drops", value: ["6 minutes cooldown instead of 10!"] },
            { name: "Better Activity Drop Rates", value: ["No Common <:1star:1105061314784661524> drops!", "See `/help activity drops` for details"] },
        ]
    },
    {
        type: "Server",
        tier: 3,
        price: 2000,
        benefits: [
            { name: "Increased Activity Drops", value: ["5 minutes cooldown instead of 10!"] },
            { name: "Better Activity Drop Rates", value: ["No Common <:1star:1105061314784661524> drops, and boosted rates across the board!", "See `/help activity drops` for details"] },
        ]
    },
];

export const defaultDropRates: DropRates = [
    { rarity: 0, rate: 0.58 },
    { rarity: 1, rate: 0.25 },
    { rarity: 2, rate: 0.11 },
    { rarity: 3, rate: 0.048 },
    { rarity: 4, rate: 0.0095 },
    { rarity: 5, rate: 0.0024 },
    { rarity: 6, rate: 0.0001 },
];

export const activityDropRates: DropRates[] = [
    [ // Server Premium Tier 0
        { rarity: 0, rate: 0.58 },
        { rarity: 1, rate: 0.25 },
        { rarity: 2, rate: 0.11 },
        { rarity: 3, rate: 0.043 },
        { rarity: 4, rate: 0.011 },
        { rarity: 5, rate: 0.0057 },
        { rarity: 6, rate: 0.0003 },
    ],
    [ // Server Premium Tier 1
        { rarity: 0, rate: 0.26 },
        { rarity: 1, rate: 0.49 },
        { rarity: 2, rate: 0.166 },
        { rarity: 3, rate: 0.063 },
        { rarity: 4, rate: 0.014 },
        { rarity: 5, rate: 0.0065 },
        { rarity: 6, rate: 0.0005 },
    ],
    [ // Server Premium Tier 2
        { rarity: 0, rate: 0 },
        { rarity: 1, rate: 0.65 },
        { rarity: 2, rate: 0.25 },
        { rarity: 3, rate: 0.074 },
        { rarity: 4, rate: 0.017 },
        { rarity: 5, rate: 0.0083 },
        { rarity: 6, rate: 0.0007 },
    ],
    [ // Server Premium Tier 3
        { rarity: 0, rate: 0 },
        { rarity: 1, rate: 0.54 },
        { rarity: 2, rate: 0.33 },
        { rarity: 3, rate: 0.097 },
        { rarity: 4, rate: 0.021 },
        { rarity: 5, rate: 0.0111 },
        { rarity: 6, rate: 0.0009 },
    ],
];

export const dropButtons: DropButton[] = [
    { id: "0", emoji: "❤️" },
    { id: "1", emoji: "🩷" },
    { id: "2", emoji: "🧡" },
    { id: "3", emoji: "💛" },
    { id: "4", emoji: "💚" },
    { id: "5", emoji: "💙" },
    { id: "6", emoji: "🩵" },
    { id: "7", emoji: "💜" },
    { id: "8", emoji: "🖤" },
    { id: "9", emoji: "🩶" },
    { id: "10", emoji: "🤍" },
    { id: "11", emoji: "🤎" },
];

import { Client } from "discord.js";
import { query } from '../postgres';
import { AnimeSchema, BanSchema, BotHandler, CharacterSchema } from "../types";
import AnimeInfo from "../shared/anime";
import CharacterInfo from "../shared/characters";

const handler: BotHandler = {
    name: "Setup",
    execute: async (client: Client) => {

        // Load Anime
        const anime = await query(`SELECT * FROM anime`) as AnimeSchema[];
        anime.forEach(anime => client.anime.set(anime.id, new AnimeInfo(anime)));

        // Load Characters
        const characters = await query(`SELECT * FROM characters`) as CharacterSchema[];
        characters.forEach(character => client.characters.set(character.id, new CharacterInfo(character)));

        // Load Bans
        const bans = await query(`SELECT * FROM bans`) as BanSchema[];
        bans.forEach(ban => client.bannedUsers.set(ban.id, ban));

        console.log(`✅ Successfully finished Setup`);
    },
};

export default handler;

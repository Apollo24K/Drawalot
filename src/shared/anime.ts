import { Collection } from "discord.js";
import { AnimeSchema, IAnimeInfo, ICharacterInfo } from "../types";

class AnimeInfo implements IAnimeInfo {
    private _name: string;
    private _aliases: string[];
    private _id: number;

    constructor(anime: AnimeSchema) {
        this._name = anime.name;
        this._aliases = anime.aliases;
        this._id = anime.id;
    };

    get name() {
        return this._name;
    };
    get aliases() {
        return this._aliases;
    };
    get id() {
        return this._id;
    };

    get names(): string[] {
        return [this.name, ...this.aliases];
    };
    get splitName(): string {
        let title = this.name;
        if (title.length <= 30) return title;
        let add = "";
        while (title.length > 30) {
            let spaceIndex = title.slice(0, 30).lastIndexOf(" ");
            add += title.slice(0, 30).replace(/\s+\S*$/, "\n");
            title = title.slice(spaceIndex + 1);
        };
        add += title;
        return add;
    };

    characters(characters: Collection<number, ICharacterInfo>): Collection<number, ICharacterInfo> {
        return characters.filter(character => this.id === character.anime_id);
    };
};

export default AnimeInfo;

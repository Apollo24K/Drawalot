import { Collection, ColorResolvable } from "discord.js";
import { CharacterSchema, Gender, IAnimeInfo, ICharacterInfo, Rarity } from "../types";
import { rarityColors } from "./components";

class CharacterInfo implements ICharacterInfo {
    private _id: number;
    private _name: string;
    private _anime_id: number;
    private _aliases: string[];
    private _image_url: string;
    private _rarity: Rarity;
    private _gender: Gender;

    constructor(character: CharacterSchema) {
        this._id = character.id;
        this._name = character.name;
        this._anime_id = character.anime_id;
        this._aliases = character.aliases;
        this._image_url = character.image_url;
        this._rarity = character.rarity;
        this._gender = character.gender;
    };

    get id() {
        return this._id;
    };
    get name() {
        return this._name;
    };
    get anime_id() {
        return this._anime_id;
    };
    get aliases() {
        return this._aliases;
    };
    get image_url() {
        return this._image_url;
    };
    get rarity() {
        return this._rarity;
    };
    get gender() {
        return this._gender;
    };

    get names(): string[] {
        return [this.name, ...this.aliases];
    };
    get rarityColor(): ColorResolvable {
        return rarityColors[this.rarity];
    };

    anime(anime: Collection<number, IAnimeInfo>): IAnimeInfo {
        return anime.find(anime => anime.id === this.anime_id) as IAnimeInfo;
    };
};

export default CharacterInfo;

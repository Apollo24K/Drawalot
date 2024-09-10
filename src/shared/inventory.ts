import { Client, ColorResolvable } from "discord.js";
import { IAnimeInfo, ICharacterInfo, InventorySchema } from "../types";

export class InventoryEntry {
    private _rowid: number;
    private _id: string;
    private _userId: string;
    private _charId: number;
    private _rarity: number;
    private _alias?: string;
    private _customImageUrl?: string;
    private _client: Client;

    constructor(inventory: InventorySchema, client: Client) {
        this._rowid = inventory.rowid;
        this._id = inventory.id;
        this._userId = inventory.user_id;
        this._charId = inventory.char_id;
        this._rarity = inventory.rarity;
        this._alias = inventory.alias;
        this._customImageUrl = inventory.custom_image_url;
        this._client = client;
    };

    get rowid() {
        return this._rowid;
    };
    get id() {
        return this._id;
    };
    get userId() {
        return this._userId;
    };
    get charId() {
        return this._charId;
    };
    get rarity() {
        return this._rarity;
    };
    get alias() {
        return this._alias;
    };
    get customImageUrl() {
        return this._customImageUrl;
    };

    get characterInfo(): ICharacterInfo {
        return this._client.characters.find(character => character.id === this.charId) as ICharacterInfo;
    };
    get animeInfo(): IAnimeInfo {
        return this._client.anime.find(anime => anime.id === this.characterInfo.anime_id) as IAnimeInfo;
    };

    get imageUrl(): string {
        return this.customImageUrl ?? this.characterInfo.image_url;
    };
    get name(): string {
        return this.alias ?? this.characterInfo.name;
    };
    get rarityColor(): ColorResolvable {
        return this.characterInfo.rarityColor;
    };
};

export default class Inventory {
    private _entries: InventoryEntry[];

    constructor(input: InventorySchema[], client: Client);
    constructor(input: InventoryEntry[]);
    constructor(input: InventorySchema[] | InventoryEntry[], client?: Client) {
        if (input.length > 0 && 'user_id' in input[0]) {
            this._entries = (input as InventorySchema[]).map(schema => new InventoryEntry(schema, client!));
        } else {
            this._entries = input as InventoryEntry[];
        };
    };

    get entries(): InventoryEntry[] {
        return this._entries;
    };
    get length(): number {
        return this.entries.length;
    };
    get unique(): InventoryEntry[] {
        const uniqueEntries = this.entries.filter((entry, index) =>
            1 > this.entries.slice(0, index).reduce((acc, t) => acc + (t.charId === entry.charId ? 1 : 0), 0)
        );
        return uniqueEntries;
    };

    uniqueInventory(): Inventory {
        return new Inventory(this.unique);
    };

    random(): InventoryEntry | undefined {
        return this.entries[Math.floor(Math.random() * this.entries.length)];
    };

    sort(sort: "rarity" | "dupes"): void {
        const entries = this.entries;
        if (sort === "rarity") {
            entries.sort((a, b) => {
                if (b.rarity !== a.rarity) return b.rarity - a.rarity;
                return a.characterInfo.name.localeCompare(b.characterInfo.name);
            });
        } else if (sort === "dupes") {
            const countMap = new Map<number, number>();
            entries.forEach(entry => {
                countMap.set(entry.charId, (countMap.get(entry.charId) ?? 0) + 1);
            });
            entries.sort((a, b) => {
                const countDiff = (countMap.get(b.charId) ?? 0) - (countMap.get(a.charId) ?? 0);
                if (countDiff !== 0) return countDiff;
                if (b.rarity !== a.rarity) return b.rarity - a.rarity;
                return a.characterInfo.name.localeCompare(b.characterInfo.name);
            });
        };
    };

    filterAnime(anime: IAnimeInfo): InventoryEntry[] {
        return this.entries.filter(entry => entry.animeInfo.id === anime.id);
    };

    filter(filter: "waifu" | "husbando"): Inventory {
        let filteredEntries: InventoryEntry[] = [];

        // Filter by gender
        if (filter === "waifu" || filter === "husbando") {
            filteredEntries = this.entries.filter((entry) => entry.characterInfo.gender === (filter === "waifu" ? "F" : "M"));
        };

        return new Inventory(filteredEntries);
    };

};

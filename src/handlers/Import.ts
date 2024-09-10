import { Client } from "discord.js";
import { query } from '../postgres';
import { AnimeSchema, BotHandler, CharacterSchema } from "../types";

const handler: BotHandler = {
    name: "Import",
    once: true,
    disabled: false,
    execute: async (client: Client) => {

        // Import Anime
        const existingAnime = await query(`SELECT * FROM anime`) as AnimeSchema[];

        for (const ani of anime) {
            if (existingAnime.find((a) => a.id === ani.id)) continue;

            await query(`INSERT INTO anime (id, name, aliases) VALUES ($1, $2, $3)`, [
                ani.id,
                ani.name,
                ani.alias
            ]);
            console.log(`Imported anime: ${ani.name}`);
        };

        console.log("Anime imported successfully");


        // Import Characters
        const existingCharacters = await query(`SELECT * FROM characters`) as CharacterSchema[];

        for (const char of characters) {
            if (existingCharacters.find((c) => c.id === char.id)) continue;

            await query(`INSERT INTO characters (id, name, anime_id, aliases, image_url, rarity, gender) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
                char.id,
                char.name,
                char.animeInfo.id,
                char.alias,
                char.image,
                { "D": 0, "C": 1, "B": 2, "A": 3, "S": 4, "SS": 5, "EX": 6 }[char.rarity],
                char.gender
            ]);
            console.log(`Imported ${char.name}`);
        };

        console.log("Characters imported successfully");
    },
};

export default handler;


class animeInfo {
    private _name: string;
    private _alias: string[];
    private _id: number;
    private _options: Record<string, any>;

    constructor(name: string, alias: string[], id: number, options: Record<string, any> = {}) {
        this._name = name;
        this._alias = alias;
        this._id = id;
        this._options = options;
    };

    get name(): string {
        return this._name;
    };
    get alias(): string[] {
        return this._alias;
    };
    get id(): number {
        return this._id;
    };
    get options(): Record<string, any> {
        return this._options;
    };
    get thumbnailCharId(): number | undefined {
        return this._options.charid;
    };
};

const anime = [
    new animeInfo("One Piece", ["OP"], 0),
    new animeInfo("Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], 1),
    new animeInfo("Gotoubun no Hanayome", ["5-toubun no Hanayome", "The Quintessential Quintuplets", "Quintessential Quintuplets", "QQ"], 2),
    new animeInfo("Gosick", [], 3),
    new animeInfo("Horimiya", [], 4),
    new animeInfo("Grimgar: Ashes and Illusions", ["Hai to Gensou no Grimgar", "Grimgar Ashes and Illusions", "Grimgar"], 5),
    new animeInfo("Rec", [], 6),
    new animeInfo("Dororo", [], 7),
    new animeInfo("Katanagatari", [], 8),
    new animeInfo("Fumetsu no Anata e", ["To Your Eternity"], 9),
    new animeInfo("Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], 10),
    new animeInfo("Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], 11),
    new animeInfo("Asobi Asobase", [], 12),
    new animeInfo("Eden of The East", ["Higashi no Eden", "HnE", "EotE"], 13),
    new animeInfo("Angel Beats!", ["Angel Beats"], 14),
    new animeInfo("Psycho Pass", ["Psycho-Pass"], 15),
    new animeInfo("Vivy: Fluorite Eye's Song", ["Vivy -Fluorite Eye's Song-", "Vivy"], 16),
    new animeInfo("That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], 17),

];

class charInfo {
    private _name: string;
    private _alias: string[];
    private _animeInfo: animeInfo;
    private _gender: string;
    private _image: string;
    private _id: number;
    private _rarity: string;

    constructor(name: string, alias: string[], animeInfo: animeInfo, gender: string, image: string, id: number, rarity: string) {
        this._name = name;
        this._alias = alias;
        this._animeInfo = animeInfo;
        this._gender = gender;
        this._image = image;
        this._id = id;
        this._rarity = rarity;
    };

    get name(): string {
        return this._name;
    };
    get alias(): string[] {
        return this._alias;
    };
    get animeInfo(): animeInfo {
        return this._animeInfo;
    };
    get anime(): string {
        return this.animeInfo.name;
    };
    get anialias(): string[] {
        return this.animeInfo.alias;
    };
    get gender(): string {
        return this._gender;
    };
    get image(): string {
        return this._image;
    };
    get id(): number {
        return this._id;
    };
    get rarity(): string {
        return this._rarity;
    };
};

const characters = [
    new charInfo("Donquixote Rosinante", ["Corazon"], anime[0], "M", "https://i.ibb.co/s2xTh6q/c.png", 0, "SS"),
    new charInfo("Nezuko Kamado", [], anime[1], "F", "https://i.ibb.co/GshYHS3/c.png", 1, "SS"),
    new charInfo("Nino Nakano", [], anime[2], "F", "https://i.ibb.co/k58qSK6/c.png", 2, "SS"),
    new charInfo("Miku Nakano", [], anime[2], "F", "https://i.ibb.co/2hfwDdx/c.png", 3, "SS"),
    new charInfo("Itsuki Nakano", [], anime[2], "F", "https://i.ibb.co/RBTFypW/c.png", 4, "S"),
    new charInfo("Yotsuba Nakano", [], anime[2], "F", "https://i.ibb.co/272bbBn/c.png", 5, "S"),
    new charInfo("Ichika Nakano", [], anime[2], "F", "https://i.ibb.co/kQNXGgH/c.png", 6, "S"),
    new charInfo("Fuutarou Uesugi", [], anime[2], "M", "https://i.ibb.co/GT9fLQ8/c.png", 7, "A"),
    new charInfo("Raiha Uesugi", [], anime[2], "F", "https://i.ibb.co/zXn2FfV/c.png", 8, "B"),
    new charInfo("Isanari Uesugi", [], anime[2], "M", "https://i.ibb.co/sF0H3RN/c.png", 9, "C"),
    new charInfo("Maruo Nakano", [], anime[2], "M", "https://i.ibb.co/3pW87xg/c.png", 10, "C"),
    new charInfo("Matsui", [], anime[2], "F", "https://i.ibb.co/5FRSJny/c.png", 11, "D"),
    new charInfo("Victorique de Blois", ["The Golden Fairy", "Gray Wolf", "Monstre Charmant"], anime[3], "F", "https://i.ibb.co/QMBVSJd/c.png", 12, "S"),
    new charInfo("Kazuya Kujou", ["The Black Reaper", "Baby Squirrel"], anime[3], "M", "https://i.ibb.co/FHBGQPw/c.png", 13, "A"),
    new charInfo("Cordelia Gallo", [], anime[3], "F", "https://i.ibb.co/y5wBZWV/c.png", 14, "B"),
    new charInfo("Brian Roscoe", [], anime[3], "M", "https://i.ibb.co/jhcVVmF/c.png", 15, "B"),
    new charInfo("Grevil de Blois", ["Pointy Head"], anime[3], "M", "https://i.ibb.co/C180qCy/c.png", 16, "A"),
    new charInfo("Cecile Lafitte", [], anime[3], "F", "https://i.ibb.co/nB88bPk/c.png", 17, "B"),
    new charInfo("Avril Bradley", [], anime[3], "F", "https://i.ibb.co/TmF1Kfd/c.png", 18, "C"),
    new charInfo("Ambrose", [], anime[3], "M", "https://i.ibb.co/Xt7KjZq/c.png", 19, "D"),
    new charInfo("Albert de Blois", [], anime[3], "M", "https://i.ibb.co/cYV1B2Z/c.png", 20, "D"),
    new charInfo("Izumi Miyamura", ["Miyamura Izumi"], anime[4], "M", "https://i.ibb.co/PjMTVKY/c.png", 21, "A"),
    new charInfo("Kyousuke Hori", [], anime[4], "M", "https://i.ibb.co/2k288Rd/c.png", 22, "D"),
    new charInfo("Yuki Yoshikawa", ["Yoshikawa Yuki"], anime[4], "F", "https://i.ibb.co/9hYccW1/c.png", 23, "A"),
    new charInfo("Kyouko Hori", ["Hori Kyouko"], anime[4], "F", "https://i.ibb.co/FHQ2Qxf/c.png", 24, "S"),
    new charInfo("Honoka Sawada", [], anime[4], "F", "https://i.ibb.co/KGBRj99/c.png", 25, "B"),
    new charInfo("Tooru Ishikawa", [], anime[4], "M", "https://i.ibb.co/FmBCfrP/c.png", 26, "C"),
    new charInfo("Akane Yanagi", [], anime[4], "M", "https://i.ibb.co/qMmgWMr/c.png", 27, "D"),
    new charInfo("Remi Ayasaki", [], anime[4], "F", "https://i.ibb.co/Dbh4742/c.png", 28, "B"),
    new charInfo("Shuu Iura", [], anime[4], "M", "https://i.ibb.co/HDNWmt9/c.png", 29, "D"),
    new charInfo("Sakura Kouno", [], anime[4], "F", "https://i.ibb.co/WBhzDjs/c.png", 30, "D"),
    new charInfo("Kouichi Shindou", [], anime[4], "M", "https://i.ibb.co/d4cD1v5/c.png", 31, "D"),
    new charInfo("Yume", [], anime[5], "F", "https://i.ibb.co/RbN6WKm/c.png", 32, "B"),
    new charInfo("Merry", [], anime[5], "F", "https://i.ibb.co/HxMsf8m/c.png", 33, "A"),
    new charInfo("Haruhiro", ["Hal"], anime[5], "M", "https://i.ibb.co/Vxs8ZhN/c.png", 34, "C"),
    new charInfo("Manato", [], anime[5], "M", "https://i.ibb.co/MgZMpyh/c.png", 35, "C"),
    new charInfo("Ranta", [], anime[5], "M", "https://i.ibb.co/Db6y8Rf/c.png", 36, "B"),
    new charInfo("Shihoru", [], anime[5], "F", "https://i.ibb.co/K0ZGjd5/c.png", 37, "B"),
    new charInfo("Moguzo", [], anime[5], "M", "https://i.ibb.co/9G9HyDP/c.png", 38, "C"),
    new charInfo("Barbara", [], anime[5], "F", "https://i.ibb.co/QnvfF67/c.png", 39, "D"),
    new charInfo("Renji", [], anime[5], "M", "https://i.ibb.co/jgnMCQw/c.png", 40, "C"),
    new charInfo("Chibi", [], anime[5], "F", "https://i.ibb.co/nj8ncqc/c.png", 41, "D"),
    new charInfo("Choco", [], anime[5], "F", "https://i.ibb.co/J7TW1rT/c.png", 42, "C"),
    new charInfo("Aka Onda", [], anime[6], "F", "https://i.ibb.co/WgG2dDs/c.png", 43, "B"),
    new charInfo("Fumihiko Matsumaru", [], anime[6], "M", "https://i.ibb.co/YPRB00n/c.png", 44, "D"),
    new charInfo("Tanaka (Rec)", [], anime[6], "F", "https://i.ibb.co/9WFDL55/c.png", 45, "D"),
    new charInfo("Yoshio Hatakeda", [], anime[6], "M", "https://i.ibb.co/CwByWh5/c.png", 46, "D"),
    new charInfo("Hyakkimaru", [], anime[7], "M", "https://i.ibb.co/3CQJzZP/c.png", 47, "A"),
    new charInfo("Dororo", [], anime[7], "F", "https://i.ibb.co/NtPHD61/c.png", 48, "A"),
    new charInfo("Mio", [], anime[7], "F", "https://i.ibb.co/Nyd8x6S/c.png", 49, "C"),
    new charInfo("Jukai", [], anime[7], "M", "https://i.ibb.co/F528d8n/c.png", 50, "D"),
    new charInfo("Tahoumaru", [], anime[7], "M", "https://i.ibb.co/5sVtMGG/c.png", 51, "D"),
    new charInfo("Shichika Yasuri", [], anime[8], "M", "https://i.ibb.co/G3f0DsZ/c.png", 52, "C"),
    new charInfo("Togame", [], anime[8], "F", "https://i.ibb.co/x1pZtJR/c.png", 53, "B"),
    new charInfo("Nanami Yasuri", [], anime[8], "F", "https://i.ibb.co/LJcK9Qs/c.png", 54, "C"),
    new charInfo("Hitei", [], anime[8], "F", "https://i.ibb.co/DDMNKHJ/c.png", 55, "C"),
    new charInfo("Emonzaemon Souda", [], anime[8], "M", "https://i.ibb.co/GdPbkb3/c.png", 56, "D"),
    new charInfo("Rinne Higaki", [], anime[8], "M", "https://i.ibb.co/t8xgCcJ/c.png", 57, "D"),
    new charInfo("Meisai Tsuruga", [], anime[8], "F", "https://i.ibb.co/dczKxJr/c.png", 58, "C"),
    new charInfo("Houou Maniwa", [], anime[8], "M", "https://i.ibb.co/5RD6qLC/c.png", 59, "D"),
    new charInfo("Zanki Kiguchi", [], anime[8], "F", "https://i.ibb.co/z2Svx1C/c.png", 60, "D"),
    new charInfo("Kyouken Maniwa", [], anime[8], "F", "https://i.ibb.co/Qdb7hmG/c.png", 61, "C"),
    new charInfo("Hakuhei Sabi", [], anime[8], "M", "https://i.ibb.co/d0BNgHk/c.png", 62, "C"),
    new charInfo("Ginkaku Uneri", [], anime[8], "M", "https://i.ibb.co/Gsq6FDY/c.png", 63, "D"),
    new charInfo("Fushi", [], anime[9], "M", "https://i.ibb.co/yQNV4CZ/c.png", 64, "SS"),
    new charInfo("Parona", [], anime[9], "F", "https://i.ibb.co/zmWPBH1/c.png", 65, "A"),
    new charInfo("Gugu", [], anime[9], "M", "https://i.ibb.co/QjBJ79M/c.png", 66, "S"),
    new charInfo("March", [], anime[9], "F", "https://i.ibb.co/3TgqRVj/c.png", 67, "B"),
    new charInfo("Rynn Cropp", ["Rean Cropp"], anime[9], "F", "https://i.ibb.co/9W5MCCd/c.png", 68, "C"),
    new charInfo("Tonari Dalton", [], anime[9], "F", "https://i.ibb.co/dWk0mrP/c.png", 69, "C"),
    new charInfo("Pyoran", [], anime[9], "F", "https://i.ibb.co/CQsvc81/c.png", 70, "D"),
    new charInfo("Hayase", [], anime[9], "F", "https://i.ibb.co/SBdFJjT/c.png", 71, "D"),
    new charInfo("Asuna Yuuki", ["Yuuki Asuna"], anime[10], "F", "https://i.ibb.co/PWv1HBF/c.png", 72, "SS"),
    new charInfo("Kirigaya Kazuto", ["Kirito", "Kazuto Kirigaya", "Beater"], anime[10], "M", "https://i.ibb.co/n1tX5Xg/c.png", 73, "SS"),
    new charInfo("Alice Zuberg", ["Synthesis Thirty"], anime[10], "F", "https://i.ibb.co/1b3CFRB/c.png", 74, "S"),
    new charInfo("Konno Yuuki", ["Yuuki Konno"], anime[10], "F", "https://i.ibb.co/gJzbRvQ/c.png", 75, "S"),
    new charInfo("Kirigaya Suguha", ["Leafa", "Suguha Kirigaya"], anime[10], "F", "https://i.ibb.co/Yfnv1kX/c.png", 76, "A"),
    new charInfo("Sinon", ["Asada Shino"], anime[10], "F", "https://i.ibb.co/Vxn2SXT/c.png", 77, "SS"),
    new charInfo("Eugeo", [], anime[10], "M", "https://i.ibb.co/qFXPGry/c.png", 78, "S"),
    new charInfo("Quinella", ["Administrator"], anime[10], "F", "https://i.ibb.co/PF5ZjF6/c.png", 79, "S"),
    new charInfo("Yui", ["Yui-MHCP001"], anime[10], "F", "https://i.ibb.co/6yDkWz0/c.png", 80, "B"),
    new charInfo("Klein", ["Tsuboi Ryoutarou"], anime[10], "M", "https://i.ibb.co/WtDxtqb/c.png", 81, "B"),
    new charInfo("Andrew Gilbert Mills", ["Agil"], anime[10], "M", "https://i.ibb.co/vZZ43h2/c.png", 82, "C"),
    new charInfo("Silica", ["Keiko Ayano"], anime[10], "F", "https://i.ibb.co/Pj0LGFr/c.png", 83, "B"),
    new charInfo("Lisbeth", ["Rika Shinozaki"], anime[10], "F", "https://i.ibb.co/WFXsrGT/c.png", 84, "B"),
    new charInfo("Kayaba Akihiko", ["Akihiko Kayaba", "Heathcliff"], anime[10], "M", "https://i.ibb.co/TB6pjFQ/c.png", 85, "B"),
    new charInfo("Vassago Casals", ["PoH"], anime[10], "M", "https://i.ibb.co/6Z00N1L/c.png", 86, "D"),
    new charInfo("Kuradeel", [], anime[10], "M", "https://i.ibb.co/rfZHnfD/c.png", 87, "D"),
    new charInfo("Sugou Nobuyuki", ["Oberon (SAO)"], anime[10], "M", "https://i.ibb.co/0Q5s2wR/c.png", 88, "D"),
    new charInfo("Death Gun", ["Shinkawa Shouichi", "Sterben", "XaXa"], anime[10], "M", "https://i.ibb.co/YRpxg7f/c.png", 89, "C"),
    new charInfo("Gabriel Miller", ["Subtilizer", "Veta"], anime[10], "M", "https://i.ibb.co/18Q0vY9/c.png", 90, "C"),
    new charInfo("Lipia Zancale", [], anime[10], "F", "https://i.ibb.co/ZXJ5jpd/c.png", 91, "D"),
    new charInfo("Sachi", [], anime[10], "F", "https://i.ibb.co/xgGcQpP/c.png", 92, "C"),
    new charInfo("Argo", ["Hosaka Carina Tomo", "The Rat"], anime[10], "F", "https://i.ibb.co/3N8QBV4/c.png", 93, "D"),
    new charInfo("Sakuya", [], anime[10], "F", "https://i.ibb.co/FK7GSVf/c.png", 94, "D"),
    new charInfo("Alicia Rue", [], anime[10], "F", "https://i.ibb.co/Yd41rws/c.png", 95, "D"),
    new charInfo("Eugene", [], anime[10], "M", "https://i.ibb.co/9ZMxjyy/c.png", 96, "D"),
    new charInfo("Selka Zuberg", [], anime[10], "F", "https://i.ibb.co/TPPrHHp/c.png", 97, "C"),
    new charInfo("Tiese Shtolienen", [], anime[10], "F", "https://i.ibb.co/rZR3vY2/c.png", 98, "C"),
    new charInfo("Ronye Arabel", [], anime[10], "F", "https://i.ibb.co/DgXgRxp/c.png", 99, "D"),
    new charInfo("Yuna (SAO)", ["Shigemura Yuuna", "Yuuna Shigemura"], anime[10], "F", "https://i.ibb.co/XZsJBNf/c.png", 100, "A"),
    new charInfo("Sortiliena Serlut", [], anime[10], "F", "https://i.ibb.co/ZmLxCcm/c.png", 101, "C"),
    new charInfo("Nochizawa Eiji", ["Nautilus"], anime[10], "M", "https://i.ibb.co/ZXwKFY7/c.png", 102, "C"),
    new charInfo("Shigemura Tetsuhiro", [], anime[10], "M", "https://i.ibb.co/jTLWsWr/c.png", 103, "D"),
    new charInfo("Philia", ["Takemiya Kotone"], anime[10], "F", "https://i.ibb.co/R3HK06N/c.png", 104, "B"),
    new charInfo("Strea", ["Strea-MHCP002"], anime[10], "F", "https://i.ibb.co/8sChKF7/c.png", 105, "C"),
    new charInfo("Rain (SAO)", ["Karatachi Nijika"], anime[10], "F", "https://i.ibb.co/YN5zwZJ/c.png", 106, "B"),
    new charInfo("Premiere", [], anime[10], "F", "https://i.ibb.co/GCJLzDH/c.png", 107, "D"),
    new charInfo("Kureha (SAO)", ["Takamine Momiji"], anime[10], "F", "https://i.ibb.co/Sckhkqg/c.png", 108, "B"),
    new charInfo("Kohiruimaki Karen", ["LLENN", "Pink Devil"], anime[10], "F", "https://i.ibb.co/SP5YzFG/c.png", 109, "C"),
    new charInfo("Pitohui", ["Kanzaki Elsa"], anime[10], "F", "https://i.ibb.co/GFqrnY7/c.png", 110, "D"),
    new charInfo("Asougi Goushi", ["M (SAO)"], anime[10], "M", "https://i.ibb.co/nwDVYpj/c.png", 111, "D"),
    new charInfo("Kaori Miyazono", ["Kao-chan", "Miyazono Kaori"], anime[11], "F", "https://i.ibb.co/3yhRpVX/c.png", 112, "SS"),
    new charInfo("Arima Kousei", ["Kousei Arima"], anime[11], "M", "https://i.ibb.co/ggrmhmN/c.png", 113, "S"),
    new charInfo("Sawabe Tsubaki", [], anime[11], "F", "https://i.ibb.co/b1nQjyZ/c.png", 114, "A"),
    new charInfo("Watari Ryota", [], anime[11], "M", "https://i.ibb.co/XpFR4Hs/c.png", 115, "B"),
    new charInfo("Aiza Takeshi", [], anime[11], "M", "https://i.ibb.co/QYXxVc9/c.png", 116, "C"),
    new charInfo("Igawa Emi", [], anime[11], "F", "https://i.ibb.co/tPGrmg9/c.png", 117, "B"),
    new charInfo("Arima Saki", [], anime[11], "F", "https://i.ibb.co/Ch4D7b4/c.png", 118, "D"),
    new charInfo("Seto Hiroko", [], anime[11], "F", "https://i.ibb.co/jVRcNMK/c.png", 119, "C"),
    new charInfo("Aiza Nagi", [], anime[11], "F", "https://i.ibb.co/HYBgwF2/c.png", 120, "C"),
    new charInfo("Kashiwagi Nao", [], anime[11], "F", "https://i.ibb.co/Y2MDqLq/c.png", 121, "C"),
    new charInfo("Miike Toshiya", [], anime[11], "M", "https://i.ibb.co/L8SJsbg/c.png", 122, "D"),
    new charInfo("Seto Koharu", [], anime[11], "F", "https://i.ibb.co/C8H3nQp/c.png", 123, "D"),
    new charInfo("Ochiai Yuriko", [], anime[11], "F", "https://i.ibb.co/Wc9QY2K/c.png", 124, "D"),
    new charInfo("Takayanagi Akira", [], anime[11], "M", "https://i.ibb.co/JqqXXt1/c.png", 125, "D"),
    new charInfo("Miyazono Ryouko", [], anime[11], "F", "https://i.ibb.co/yVxk0XC/c.png", 126, "D"),
    new charInfo("Miyazono Yoshiyuki", [], anime[11], "M", "https://i.ibb.co/HDd0D1w/c.png", 127, "D"),
    new charInfo("Hanako Honda", [], anime[12], "F", "https://i.ibb.co/DRwJm7q/c.png", 128, "A"),
    new charInfo("Olivia (Asobi)", [], anime[12], "F", "https://i.ibb.co/cFHJBFW/c.png", 129, "A"),
    new charInfo("Kasumi Nomura", [], anime[12], "F", "https://i.ibb.co/8x1TC6V/c.png", 130, "A"),
    new charInfo("Maeda", [], anime[12], "M", "https://i.ibb.co/3YnG8vv/c.png", 131, "D"),
    new charInfo("Tsugumi Aozora", [], anime[12], "F", "https://i.ibb.co/nC521xD/c.png", 132, "C"),
    new charInfo("Tokuko Sharekoube", [], anime[12], "F", "https://i.ibb.co/xjTycBB/c.png", 133, "D"),
    new charInfo("Akira Takizawa", ["Air King"], anime[13], "M", "https://i.ibb.co/m8PH7GW/c.png", 134, "B"),
    new charInfo("Saki Morimi", [], anime[13], "F", "https://i.ibb.co/Rgn80K4/c.png", 135, "B"),
    new charInfo("Kuroha Shiratori", ["Diana (HnE)"], anime[13], "F", "https://i.ibb.co/DQN4Bf8/c.png", 136, "D"),
    new charInfo("Kazuomi Hirasawa", [], anime[13], "M", "https://i.ibb.co/3hC3rqw/c.png", 137, "C"),
    new charInfo("Yutaka Itazu", [], anime[13], "M", "https://i.ibb.co/Vj5B4jw/c.png", 138, "C"),
    new charInfo("Mikuru Katsuhara", ["Micchon", "Mittan"], anime[13], "F", "https://i.ibb.co/GTT7fXL/c.png", 139, "C"),
    new charInfo("Satoshi Ohsugi", [], anime[13], "M", "https://i.ibb.co/dbBHZYq/c.png", 140, "D"),
    new charInfo("Yuusei Kondou", [], anime[13], "M", "https://i.ibb.co/r3g48hr/c.png", 141, "D"),
    new charInfo("Tachibana Kanade", ["Kanade Tachibana"], anime[14], "F", "https://i.ibb.co/2n9Whd6/c.png", 142, "SS"),
    new charInfo("Yuri Nakamura", ["Yurippe"], anime[14], "F", "https://i.ibb.co/YPWDrB5/c.png", 143, "A"),
    new charInfo("Yui (AB)", [], anime[14], "F", "https://i.ibb.co/DYVKnN4/c.png", 144, "A"),
    new charInfo("Yuzuru Otonashi", [], anime[14], "M", "https://i.ibb.co/g9RvCjQ/c.png", 145, "B"),
    new charInfo("Hideki Hinata", [], anime[14], "M", "https://i.ibb.co/x5z7mCk/c.png", 146, "B"),
    new charInfo("T.K.", ["TK"], anime[14], "M", "https://i.ibb.co/9Wx1hs1/c.png", 147, "D"),
    new charInfo("Masami Iwasawa", [], anime[14], "F", "https://i.ibb.co/mhW7QSz/c.png", 148, "B"),
    new charInfo("Ayato Naoi", [], anime[14], "M", "https://i.ibb.co/YXKSL1w/c.png", 149, "C"),
    new charInfo("Shiina", [], anime[14], "F", "https://i.ibb.co/4FTZBsr/c.png", 150, "C"),
    new charInfo("Noda", [], anime[14], "M", "https://i.ibb.co/K7w09ff/c.png", 151, "D"),
    new charInfo("Fujimaki", [], anime[14], "M", "https://i.ibb.co/KzCHPjn/c.png", 152, "D"),
    new charInfo("Hisako", [], anime[14], "F", "https://i.ibb.co/vLv59P7/c.png", 153, "C"),
    new charInfo("Hitomi (AB)", [], anime[14], "F", "https://i.ibb.co/8cyp85P/c.png", 154, "D"),
    new charInfo("Miyuki Irie", [], anime[14], "F", "https://i.ibb.co/HGXcWQk/c.png", 155, "C"),
    new charInfo("Yusa", [], anime[14], "F", "https://i.ibb.co/Cs9S9TS/c.png", 156, "C"),
    new charInfo("Hatsune Otonashi", [], anime[14], "F", "https://i.ibb.co/qFhQ43n/c.png", 157, "D"),
    new charInfo("Zenitsu Agatsuma", [], anime[1], "M", "https://i.ibb.co/K2hkZXY/c.png", 158, "S"),
    new charInfo("Tanjirou Kamado", ["Kamado Tanjirou", "Gonpachirou Kamaboko", "Kamaboko Gonpachirou", "Monjirou"], anime[1], "M", "https://i.ibb.co/YWgFRgN/c.png", 159, "SS"),
    new charInfo("Mitsuri Kanroji", [], anime[1], "F", "https://i.ibb.co/qnGd22t/c.png", 160, "S"),
    new charInfo("Shinobu Kochou", [], anime[1], "F", "https://i.ibb.co/YBdCRc7/c.png", 161, "S"),
    new charInfo("Kanao Tsuyuri", [], anime[1], "F", "https://i.ibb.co/hLByWvP/c.png", 162, "A"),
    new charInfo("Giyuu Tomioka", ["Tomioka Giyuu"], anime[1], "M", "https://i.ibb.co/XYYr9P9/c.png", 163, "A"),
    new charInfo("Inosuke Hashibira", [], anime[1], "M", "https://i.ibb.co/4705VhX/c.gif", 164, "A"),
    new charInfo("Kyoujurou Rengoku", ["Rengoku Kyoujurou"], anime[1], "M", "https://i.ibb.co/wMKX6Bx/c.png", 165, "S"),
    new charInfo("Kibutsuji Muzan", ["Muzan Kibutsuji"], anime[1], "M", "https://i.ibb.co/VmwGyDd/c.gif", 166, "A"),
    new charInfo("Muichirou Tokitou", [], anime[1], "M", "https://i.ibb.co/SRnKFMX/c.png", 167, "A"),
    new charInfo("Enmu", [], anime[1], "M", "https://i.ibb.co/D4c3HRy/c.png", 168, "B"),
    new charInfo("Aoi Kanzaki", [], anime[1], "F", "https://i.ibb.co/S0RHPjw/c.png", 169, "C"),
    new charInfo("Gotou (DS)", [], anime[1], "M", "https://i.ibb.co/qjrmT0g/c.png", 170, "D"),
    new charInfo("Hisa", [], anime[1], "F", "https://i.ibb.co/7XG2YfR/c.png", 171, "D"),
    new charInfo("Kozo Kanamori", [], anime[1], "M", "https://i.ibb.co/4sN0jK5/c.png", 172, "D"),
    new charInfo("Hotaru Haganezuka", [], anime[1], "M", "https://i.ibb.co/PF5LssL/c.png", 173, "C"),
    new charInfo("Gyoumei Himejima", [], anime[1], "M", "https://i.ibb.co/64wnKNt/c.png", 174, "C"),
    new charInfo("Shigeru Kamado", [], anime[1], "M", "https://i.ibb.co/VLSC1V5/c.png", 175, "D"),
    new charInfo("Rokuta Kamado", [], anime[1], "M", "https://i.ibb.co/MkhKCQW/c.png", 176, "D"),
    new charInfo("Takeo Kamado", [], anime[1], "M", "https://i.ibb.co/gFdfKkB/c.png", 177, "D"),
    new charInfo("Hanako Kamado", [], anime[1], "F", "https://i.ibb.co/jM5xb6d/c.png", 178, "D"),
    new charInfo("Kie Kamado", [], anime[1], "F", "https://i.ibb.co/3k7QYzb/c.png", 179, "D"),
    new charInfo("Tanjuurou Kamado", [], anime[1], "M", "https://i.ibb.co/sbDF2Yf/c.png", 180, "C"),
    new charInfo("Kamanue", [], anime[1], "M", "https://i.ibb.co/G3rWD1H/c.png", 181, "D"),
    new charInfo("Kazumi", [], anime[1], "M", "https://i.ibb.co/QHBzGsF/c.png", 182, "D"),
    new charInfo("Kiyoshi", [], anime[1], "M", "https://i.ibb.co/njt7hSG/c.png", 183, "D"),
    new charInfo("Kanae Kochou", [], anime[1], "F", "https://i.ibb.co/68MrpXf/c.png", 184, "B"),
    new charInfo("Jigorou Kuwajima", [], anime[1], "M", "https://i.ibb.co/f4FXR21/c.png", 185, "C"),
    new charInfo("Makomo", [], anime[1], "F", "https://i.ibb.co/qWHkrpK/c.png", 186, "C"),
    new charInfo("Murata", [], anime[1], "M", "https://i.ibb.co/W3P9vt3/c.png", 187, "D"),
    new charInfo("Sumi Nakahara", [], anime[1], "F", "https://i.ibb.co/dbzYfxG/c.png", 188, "D"),
    new charInfo("Rui", [], anime[1], "M", "https://i.ibb.co/n0SgLvr/c.png", 189, "B"),
    new charInfo("Sabito", [], anime[1], "M", "https://i.ibb.co/RN0bLsZ/c.png", 190, "B"),
    new charInfo("Genya Shinazugawa", [], anime[1], "M", "https://i.ibb.co/cgwHjR4/c.png", 191, "C"),
    new charInfo("Shoichi", [], anime[1], "M", "https://i.ibb.co/68DQT7K/c.png", 192, "D"),
    new charInfo("Susamaru", [], anime[1], "F", "https://i.ibb.co/9ghQnJw/c.png", 193, "D"),
    new charInfo("Naho Takada", [], anime[1], "F", "https://i.ibb.co/ZcTdsSf/c.png", 194, "D"),
    new charInfo("Tamayo", [], anime[1], "F", "https://i.ibb.co/Dzgvg9v/c.png", 195, "C"),
    new charInfo("Kiyo Terauchi", [], anime[1], "F", "https://i.ibb.co/YD0DS2T/c.png", 196, "D"),
    new charInfo("Kagaya Ubuyashiki", [], anime[1], "M", "https://i.ibb.co/fXLSbBy/c.png", 197, "C"),
    new charInfo("Kiriya Ubuyashiki", [], anime[1], "M", "https://i.ibb.co/gFzjKBN/c.png", 198, "C"),
    new charInfo("Nichika Ubuyashiki", [], anime[1], "F", "https://i.ibb.co/3NhBHmw/c.png", 199, "C"),
    new charInfo("Hinaki Ubuyashiki", [], anime[1], "F", "https://i.ibb.co/TH65K04/c.png", 200, "C"),
    new charInfo("Kanata Ubuyashiki", [], anime[1], "F", "https://i.ibb.co/RTmXBbR/c.png", 201, "C"),
    new charInfo("Sakonji Urokodaki", [], anime[1], "M", "https://i.ibb.co/2Kb5HP0/c.png", 202, "B"),
    new charInfo("Tengen Uzui", [], anime[1], "M", "https://i.ibb.co/qNmW3LK/c.png", 203, "A"),
    new charInfo("Yahaba", [], anime[1], "M", "https://i.ibb.co/9WH8Qjt/c.png", 204, "D"),
    new charInfo("Yushirou", [], anime[1], "M", "https://i.ibb.co/P6mCTVR/c.png", 205, "C"),
    new charInfo("Tsunemori Akane", [], anime[15], "F", "https://i.ibb.co/zhkR9Bp/c.png", 206, "A"),
    new charInfo("Kogami Shinya", [], anime[15], "M", "https://i.ibb.co/yX5cckf/c.png", 207, "A"),
    new charInfo("Makishima Shogo", [], anime[15], "M", "https://i.ibb.co/gS0GZN2/c.png", 208, "A"),
    new charInfo("Ginoza Nobuchika", [], anime[15], "M", "https://i.ibb.co/pKstYMJ/c.png", 209, "A"),
    new charInfo("Kunidzuka Yayoi", [], anime[15], "F", "https://i.ibb.co/m4SfzDg/c.png", 210, "B"),
    new charInfo("Kagari Shuusei", [], anime[15], "M", "https://i.ibb.co/30q4GRp/c.png", 211, "B"),
    new charInfo("Masaoka Tomomi", [], anime[15], "M", "https://i.ibb.co/pxLW7HS/c.png", 212, "B"),
    new charInfo("Karanomori Shion", [], anime[15], "F", "https://i.ibb.co/SXHMpZ0/c.png", 213, "B"),
    new charInfo("Saiga Jouji", [], anime[15], "M", "https://i.ibb.co/B2s6CMt/c.png", 214, "C"),
    new charInfo("Aoyanagi Risa", [], anime[15], "F", "https://i.ibb.co/CvXCyyL/c.png", 215, "C"),
    new charInfo("Funahara Yuki", [], anime[15], "F", "https://i.ibb.co/VCg0QDp/c.png", 216, "D"),
    new charInfo("Kasei Joushuu", [], anime[15], "F", "https://i.ibb.co/Lg3qnDL/c.png", 217, "C"),
    new charInfo("Tougane Sakuya", [], anime[15], "M", "https://i.ibb.co/zRKbxc2/c.png", 218, "C"),
    new charInfo("Shimotsuki Mika", [], anime[15], "F", "https://i.ibb.co/stJthfQ/c.png", 219, "C"),
    new charInfo("Kamui Kirito", [], anime[15], "M", "https://i.ibb.co/dpVntjT/c.png", 220, "C"),
    new charInfo("Aikawa Tsubaki", [], anime[15], "F", "https://i.ibb.co/gDk0x1c/c.png", 221, "D"),
    new charInfo("Hasuike Kaede", [], anime[15], "M", "https://i.ibb.co/9vNbD6D/c.png", 222, "D"),
    new charInfo("Suzuki Moe", [], anime[15], "M", "https://i.ibb.co/k1zNDny/c.png", 223, "D"),
    new charInfo("Hinakawa Shou", [], anime[15], "M", "https://i.ibb.co/pPf73G6/c.png", 224, "C"),
    new charInfo("Sugou Teppei", [], anime[15], "M", "https://i.ibb.co/PF3YNkH/c.png", 225, "D"),
    new charInfo("Tougane Misako", [], anime[15], "F", "https://i.ibb.co/XYKg9ng/c.png", 226, "D"),
    new charInfo("Shindou Arata", [], anime[15], "M", "https://i.ibb.co/bQgfkNF/c.png", 227, "B"),
    new charInfo("Ignatov Kei Mikhail", [], anime[15], "M", "https://i.ibb.co/pvPPyKj/c.png", 228, "D"),
    new charInfo("Vivy", ["Diva"], anime[16], "F", "https://i.ibb.co/x3BT3s8/c.png", 229, "A"),
    new charInfo("Matsumoto", [], anime[16], "M", "https://i.ibb.co/qsd65g3/c.png", 230, "B"),
    new charInfo("Estella", [], anime[16], "F", "https://i.ibb.co/TtgT7Md/c.png", 231, "B"),
    new charInfo("Kakitani Yugo", [], anime[16], "M", "https://i.ibb.co/ygmNXtG/c.png", 232, "C"),
    new charInfo("Ophelia (Vivy)", ["The Small Theater Fairy"], anime[16], "F", "https://i.ibb.co/jgytFgL/c.png", 233, "C"),
    new charInfo("Elizabeth", [], anime[16], "F", "https://i.ibb.co/wZqXvFF/c.png", 234, "B"),
    new charInfo("Grace", [], anime[16], "F", "https://i.ibb.co/xqqBCtX/c.png", 235, "D"),
    new charInfo("Dr. Matsumoto", ["Matsumoto Osamu"], anime[16], "M", "https://i.ibb.co/GPgQNr8/c.png", 236, "C"),
    new charInfo("Tatsuya Saeki", ["Dr. Saeki"], anime[16], "M", "https://i.ibb.co/34rgPX6/c.png", 237, "C"),
    new charInfo("Rimuru Tempest", ["Rimuru", "Mikami Satoru", "Slime-san"], anime[17], "M", "https://i.ibb.co/0Xxswzj/c.png", 238, "SS"),
    new charInfo("Veldora Tempest", ["Storm Dragon Veldora"], anime[17], "M", "https://i.ibb.co/grSpQBS/c.png", 239, "A"),
    new charInfo("Milim Nava", [], anime[17], "F", "https://i.ibb.co/FXT2dft/c.png", 240, "S"),
    new charInfo("Diablo", ["Noir"], anime[17], "M", "https://i.ibb.co/F855BgW/c.png", 241, "S"),
    new charInfo("Shuna", [], anime[17], "F", "https://i.ibb.co/Dpw4Ppb/c.png", 242, "S"),
    new charInfo("Shion", [], anime[17], "F", "https://i.ibb.co/ZHhYqf4/c.png", 243, "S"),
    new charInfo("Benimaru", [], anime[17], "M", "https://i.ibb.co/2M56Dq9/c.png", 244, "A"),
    new charInfo("Souei", [], anime[17], "M", "https://i.ibb.co/BT1Gqzh/c.png", 245, "B"),
    new charInfo("Hakurou", [], anime[17], "M", "https://i.ibb.co/hLZQ0xL/c.png", 246, "C"),
    new charInfo("Gobuta", [], anime[17], "M", "https://i.ibb.co/WH25XCq/c.png", 247, "C"),
    new charInfo("Chloe Aubert", ["Aubert Chloe"], anime[17], "F", "https://i.ibb.co/qJ6ZLqH/c.png", 248, "C"),
    new charInfo("Carrion", ["Beast King"], anime[17], "M", "https://i.ibb.co/kghZKY4/c.png", 249, "C"),

];

import { Guild } from "discord.js";
import { BotEvent } from "../types";

const event: BotEvent = {
    name: "guildCreate",
    disabled: true,
    execute: (guild: Guild) => {

    },
};

export default event;
import { Command } from "../types";

const command: Command = {
    name: "ping",
    aliases: ["pong"],
    permissions: [],
    cooldown: 0,
    execute: ({ message }) => {
        return message.reply({ content: `pong! 🏓 ${message.client.ws.ping}ms` });
    },
};

export default command;
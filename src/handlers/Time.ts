import { Client } from "discord.js";
import { BotHandler } from "../types";
import { query } from '../postgres';

const handler: BotHandler = {
    name: "Time",
    once: true,
    execute: (client: Client) => {
        setTimeout(() => setInterval(async () => {
            const now = new Date();

            // Daily
            if (now.getHours() === 0 && now.getMinutes() === 0) {

                // Delete Accounts
                await query('DELETE FROM users WHERE deleteacc < NOW()');

                // Daily Reset
                await query(`UPDATE users SET rushclaimed = 0`);
            };

            // Every 2 hours
            if (now.getHours() % 2 === 0 && now.getMinutes() === 0) {
                // Reset Draws and Claims
                await query(`UPDATE users SET draws = 0 WHERE draws > 0`);
                await query(`UPDATE users SET claims = 0 WHERE claims > 0`);
            };

            // Every hour
            if (now.getMinutes() === 0) {
                // Reset Premium Expiry
                await query(`UPDATE servers SET premium = 0, premium_expires = NULL WHERE premium_expires < NOW()`);
                await query(`UPDATE users SET premium = 0, premium_expires = NULL WHERE premium_expires < NOW()`);
            };

        }, 60000), 60000 - (Date.now() % 60000));
    },
};

export default handler;

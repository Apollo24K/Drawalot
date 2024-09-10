import { ChannelType, Client, EmbedBuilder } from "discord.js";
import { BotHandler, RankShopTransaction } from "../types";
import express from 'express';
import { query } from "../postgres";
import { queryUserSchema } from "../functions";
import { botPfp, embedColor, Emojis, Links } from "../shared/components";

const products: { [key: string]: { jades: number, bonus: number; }; } = {
    // Rank.top
    "ZGuoUqm9Re": { jades: 240, bonus: 60 },      //   $4
    "szsl1gvQN3": { jades: 740, bonus: 160 },     //  $12
    "946mpUujoM": { jades: 1640, bonus: 360 },    //  $25
    "BAPJwjmGYO": { jades: 3420, bonus: 720 },    //  $50
    "Mlf4mYNkq2": { jades: 7060, bonus: 1440 },   // $100
};

const handler: BotHandler = {
    name: "Shop",
    execute: (client: Client) => {

        const app = express();
        app.use(express.json());
        app.listen(3010);

        // Rank.top Webhook
        app.post('/rankshop', async (req, res) => {
            const donation = req.body as RankShopTransaction;

            // Check if authorization is valid
            if (donation.authorization !== process.env.RANK_AUTH) return;
            delete donation.authorization;

            // Send a response back to acknowledge receipt
            res.status(200).send('received');

            // Return if buyer_id is missing
            if (!donation.buyer_id) return;

            // Get channel
            const chnl = client.channels.cache.find(channel => channel.id === "1030963832136417320");

            // Get user stats
            const stats = await queryUserSchema(donation.buyer_id);
            if (!stats) {
                if (!chnl || chnl.type !== ChannelType.GuildText) return;
                return chnl.send(`User <@${donation.buyer_id}> (${donation.buyer_id}) has no profile.\nEmail: **${donation.buyer_email}**\nOrder: **${donation.product_id}**\nPrice: **${donation.price} ${donation.currency}**`);
            };

            const product = products[donation.product_id];
            const jades = product.jades + (donation.first_purchase ? product.bonus : 0);

            // Update user stats
            stats.transactions.push(donation);
            await query('UPDATE users SET jades = jades + $1, transactions = $2 WHERE id = $3', [jades, stats.transactions, donation.buyer_id]);

            // Send DM
            const dmUser = await client.users.fetch(donation.buyer_id);
            if (dmUser) {
                const Embed = new EmbedBuilder()
                    .setColor(embedColor)
                    .setTitle("Thank you for your support!")
                    .setThumbnail(botPfp)
                    .setDescription(`We have received and processed your order! <:ClaraThumbsUp:1034899843505721514>\nPlease [contact](${Links.Support}) us if you encounter any issues. You can see the transaction details below.\n\n\`\`\`yaml\nOrder: ${product.jades} eternal jades\nPrice: ${donation.price} ${donation.currency}\nProduct ID: ${donation.product_id}\nTransaction ID: ${donation.txn_id}\nStatus: ${donation.status}\nBuyer ID: ${donation.buyer_id}\nDate: ${new Date(donation.timestamp * 1000).toISOString()}\`\`\``);
                dmUser.send({ embeds: [Embed] });
            };

            // Log confirmation message
            if (chnl && chnl.type === ChannelType.GuildText) chnl.send(`Successfully processed transaction ${donation.txn_id}\nBuyer: <@${donation.buyer_id}> | ${donation.buyer_id}\nBalance: **${stats.jades + jades}**${Emojis.Jade}\nPrice: **${donation.price} ${donation.currency}**`);
        });

    },
};

export default handler;

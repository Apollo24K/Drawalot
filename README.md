# Drawalot, a Camelot spin-off

Welcome to **Drawalot**, an anime-themed card collection Discord bot! Players can draw cards, collect rare items, and trade with others in this exciting game.

## Features

- 🎴 **Card Drawing**: Draw cards from various anime-themed decks.
- 💎 **Collect & Trade**: Build your collection and trade with other players.
- 🏆 **Rarities**: Hunt for ultra-rare cards and show off to your friends.
- 📈 **Leaderboards**: Compete against others to have the best collection.
- 🛠️ **Open Source Contributions**: Contribute to the project and help make it even better.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- TypeScript (v5.0 or higher)
- [Discord bot token](https://discord.com/developers/applications)
- A PostgreSQL database for storing user and game data

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/Apollo24K/Drawalot.git
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` file and add your Discord bot token and database credentials:

    ```bash
    TOKENS=your-discord-bot-token (can be multiple, separate by comma ",")
    CLIENT_IDS=your-discord-bot-client-id (can be multiple, separate by comma ",")
    PREFIX=!
    PG_DATABASE=your-database-name
    PG_PASSWORD=your-database-password
    PG_PORT=your-database-port
    ADMINS=your-discord-id
    VERSION=0.1.2
    ```

4. Compile the TypeScript code:

    ```bash
    npm run build
    ```
    or
    ```bash
    tsc
    ```

5. Run the bot:

    ```bash
    npm start
    ```
    or
    ```bash
    node .
    ```

### Basic Commands

- `/draw` - Draw a random card.
- `/inventory` - View your card collection.

## Contributing

We welcome contributions from the community! Here’s how you can get involved:

1. **Fork the repository** to your GitHub account.
2. **Create a branch** for your feature or bugfix:
   
   ```bash
   git checkout -b feature-name
   ```

3. Make your changes and test them.
4. Commit your changes:

   ```bash
   git commit -m "Add new feature or fix"
   ```

5. Push to your branch:

   ```bash
   git push origin feature-name
   ```

6. Create a pull request on GitHub to merge your changes into the main project.

### Contribution Guidelines

- Make sure your code follows the project's coding style and conventions.
- Test your changes before submitting a pull request.
- Contributions must comply with the [Drawalot License](./LICENSE.txt).

## License

This project is licensed under the **Drawalot License**. See the [LICENSE](./LICENSE.txt) file for details.

## Support

If you encounter any issues or have questions, feel free to open an issue in the GitHub repository or reach out to us on Discord.

---

Thank you for checking out **Drawalot**! We hope you enjoy collecting your favorite anime cards! 🎴

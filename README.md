# Drawalot, a Camelot Bot

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
- [Discord bot token](https://discord.com/developers/applications)
- A PostgreSQL database for storing user and game data

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/drawalot.git
    cd drawalot
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` file and add your Discord bot token and database credentials:

    ```bash
    DISCORD_TOKEN=your-discord-token
    DATABASE_URL=your-database-url
    ```

4. Run the bot:

    ```bash
    npm start
    ```

### Basic Commands

- `!draw` - Draw a random card.
- `!collection` - View your card collection.
- `!trade @user` - Initiate a trade with another player.
- `!leaderboard` - View the top players.

## Contributing

We welcome contributions from the community! Here’s how you can get involved:

1. **Fork the repository** to your GitHub account.
2. **Create a branch** for your feature or bugfix:
   
   ```bash
   git checkout -b feature-name
   ```

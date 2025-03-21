const { Client, GatewayIntentBits } = require('discord.js');
const { initDatabase } = require('./db/models');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Load commands
client.commands = new Map();
const commandFiles = ['openPack', 'battle']; // Add other commands if needed
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// Load events
const eventFiles = ['messageCreate'];
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// Event: Bot is ready
client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  await initDatabase();
});

client.login(process.env.DISCORD_BOT_TOKEN);
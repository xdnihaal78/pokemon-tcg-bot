const { prefix } = require('../config.json');

module.exports = {
  name: 'messageCreate',
  execute: async (message) => {
    // Ignore messages from bots or DMs
    if (message.author.bot || !message.guild) return;

    // Check if the message starts with the bot's prefix
    if (!message.content.startsWith(prefix)) return;

    // Parse the command and arguments
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Check if the command exists
    const command = 
      message.client.commands.get(commandName) || 
      message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    // Cooldown system (optional, prevents spam)
    if (!message.client.cooldowns) message.client.cooldowns = new Map();
    const now = Date.now();
    const timestamps = message.client.cooldowns.get(command.name) || new Map();
    const cooldownAmount = (command.cooldown || 3) * 1000; // Default 3 sec cooldown

    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
      if (now < expirationTime) {
        const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
        return message.reply(`⏳ Please wait **${timeLeft} seconds** before using \`${commandName}\` again.`);
      }
    }

    timestamps.set(message.author.id, now);
    message.client.cooldowns.set(command.name, timestamps);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
      // Execute the command
      await command.execute(message, args);
    } catch (error) {
      console.error(`❌ Error executing command "${commandName}":`, error);
      message.reply('⚠️ There was an error executing that command. Please try again later.');
    }
  },
};

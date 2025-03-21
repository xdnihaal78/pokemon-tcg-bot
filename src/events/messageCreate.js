const { prefix } = require('../config.json');

module.exports = {
  name: 'messageCreate',
  execute: async (message) => {
    // Ignore messages from bots
    if (message.author.bot) return;

    // Check if the message starts with the bot's prefix
    if (!message.content.startsWith(prefix)) return;

    // Parse the command and arguments
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Check if the command exists
    const command = message.client.commands.get(commandName);
    if (!command) return;

    try {
      // Execute the command
      await command.execute(message, args);
    } catch (error) {
      console.error(error);
      message.reply('There was an error executing that command.');
    }
  },
};
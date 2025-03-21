const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  execute: async (message) => {
    // List of commands and their descriptions
    const commands = [
      { name: '!openpack', description: 'Open a pack of 6 random Pokémon.' },
      { name: '!battle @user', description: 'Battle another user with your Pokémon.' },
      { name: '!profile', description: 'View your profile (XP, level, and Pokémon collection).' },
      { name: '!leaderboard', description: 'View the top 10 users by level and XP.' },
      { name: '!pokemon <name>', description: 'View details about a specific Pokémon in your collection.' },
      { name: '!trade @user <your-pokemon> <their-pokemon>', description: 'Trade Pokémon with another user.' },
      { name: '!help', description: 'Display this help message.' },
    ];

    // Create an embed for the help message
    const embed = new EmbedBuilder()
      .setTitle('Bot Commands')
      .setColor('#00FF00')
      .setDescription('Here are all the commands you can use:')
      .addFields(
        commands.map(command => ({
          name: command.name,
          value: command.description,
          inline: false,
        }))
      )
      .setFooter({ text: 'Use the commands wisely!' })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
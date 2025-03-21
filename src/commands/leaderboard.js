const db = require('../db/db');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'leaderboard',
  execute: async (message) => {
    // Fetch the top 10 users by level
    const topUsers = await db.query(
      'SELECT username, level, xp FROM users ORDER BY level DESC, xp DESC LIMIT 10'
    );

    // Create an embed for the leaderboard
    const embed = new EmbedBuilder()
      .setTitle('Leaderboard')
      .setColor('#00FF00')
      .setDescription('Top 10 users by level and XP:')
      .addFields(
        topUsers.rows.map((user, index) => ({
          name: `${index + 1}. ${user.username}`,
          value: `Level: ${user.level} | XP: ${user.xp}`,
          inline: false,
        }))
      );

    message.reply({ embeds: [embed] });
  },
};
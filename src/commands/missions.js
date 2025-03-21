const db = require('../db/db');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'missions',
  execute: async (message) => {
    // Fetch available missions for the user
    const missions = await db.query(
      'SELECT * FROM missions WHERE user_id = $1 AND completed = FALSE',
      [message.author.id]
    );

    if (!missions.rows.length) {
      return message.reply('You have no available missions.');
    }

    // Create an embed for the missions
    const embed = new EmbedBuilder()
      .setTitle('Your Missions')
      .setColor('#00FF00')
      .setDescription('Here are your available missions:')
      .addFields(
        missions.rows.map(mission => ({
          name: `Mission ID: ${mission.id}`,
          value: `**Description:** ${mission.description}\n**Reward:** ${mission.reward}`,
          inline: false,
        }))
      );

    message.reply({ embeds: [embed] });
  },
};
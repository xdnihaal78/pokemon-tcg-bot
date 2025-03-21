const db = require('../db/db');

module.exports = {
  name: 'missions',
  execute: async (message) => {
    const missions = await db.query(
      'SELECT * FROM missions WHERE user_id = $1 AND completed = FALSE',
      [message.author.id]
    );

    if (!missions.rows.length) return message.reply('No missions available.');

    const missionList = missions.rows.map(mission => `${mission.id}: ${mission.description} (Reward: ${mission.reward})`).join('\n');
    message.reply(`Your missions:\n${missionList}`);
  },
};
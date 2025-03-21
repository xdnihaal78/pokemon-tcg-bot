const db = require('../db/db');

module.exports = {
  name: 'wonderpick',
  execute: async (message, args) => {
    const targetUser = message.mentions.users.first();
    if (!targetUser) return message.reply('Mention a user to wonder pick!');

    const card = await db.query(
      'SELECT card_id FROM user_cards WHERE user_id = $1 ORDER BY RANDOM() LIMIT 1',
      [targetUser.id]
    );

    if (!card.rows.length) return message.reply(`${targetUser.username} has no cards to pick!`);

    await db.query(
      'UPDATE user_cards SET user_id = $1 WHERE card_id = $2',
      [message.author.id, card.rows[0].card_id]
    );

    message.reply(`You picked a card from ${targetUser.username}'s collection!`);
  },
};
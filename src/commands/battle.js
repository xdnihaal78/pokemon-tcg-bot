const db = require('../db/db');

module.exports = {
  name: 'battle',
  execute: async (message, args) => {
    const targetUser = message.mentions.users.first();
    if (!targetUser) return message.reply('Mention a user to battle!');

    const userCard = await db.query(
      'SELECT * FROM user_cards WHERE user_id = $1 ORDER BY RANDOM() LIMIT 1',
      [message.author.id]
    );

    const targetCard = await db.query(
      'SELECT * FROM user_cards WHERE user_id = $1 ORDER BY RANDOM() LIMIT 1',
      [targetUser.id]
    );

    if (!userCard.rows.length || !targetCard.rows.length) return message.reply('Not enough cards to battle!');

    const userHP = userCard.rows[0].hp;
    const targetHP = targetCard.rows[0].hp;

    if (userHP > targetHP) {
      message.reply(`You won the battle with ${userCard.rows[0].name} (${userHP} HP) vs ${targetCard.rows[0].name} (${targetHP} HP)!`);
    } else {
      message.reply(`You lost the battle with ${userCard.rows[0].name} (${userHP} HP) vs ${targetCard.rows[0].name} (${targetHP} HP)!`);
    }
  },
};
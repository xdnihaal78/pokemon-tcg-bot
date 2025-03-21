const db = require('../db/db');
const axios = require('axios');

module.exports = {
  name: 'openpack',
  execute: async (message, args) => {
    const set = args[0];
    const validSets = ['mythical-island', 'triumphant-light', 'space-time-smackdown'];

    if (!validSets.includes(set)) {
      return message.reply('Invalid set. Choose from: mythical-island, triumphant-light, space-time-smackdown.');
    }

    const user = await db.query('SELECT * FROM users WHERE id = $1', [message.author.id]);
    if (!user.rows.length) {
      await db.query('INSERT INTO users (id, username) VALUES ($1, $2)', [message.author.id, message.author.username]);
      return message.reply('You are now registered! Try opening a pack again.');
    }

    const { pack_stamina, last_pack_time } = user.rows[0];
    const currentTime = Date.now();
    const PACK_COOLDOWN = 11 * 60 * 60 * 1000; // 11 hours

    if (pack_stamina <= 0 && currentTime - last_pack_time < PACK_COOLDOWN) {
      return message.reply(`You're out of stamina! Wait ${Math.ceil((PACK_COOLDOWN - (currentTime - last_pack_time)) / (1000 * 60 * 60))} hours.`);
    }

    const response = await axios.get(`https://api.pokemontcg.io/v2/cards?q=set.name:${set}`);
    const cards = response.data.data;
    const randomCards = cards.sort(() => 0.5 - Math.random()).slice(0, 5);

    for (const card of randomCards) {
      await db.query(
        'INSERT INTO cards (id, name, image_url, hp, rarity, set_name) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
        [card.id, card.name, card.images.large, card.hp, card.rarity, set]
      );
      await db.query(
        'INSERT INTO user_cards (user_id, card_id) VALUES ($1, $2)',
        [message.author.id, card.id]
      );
    }

    await db.query(
      'UPDATE users SET pack_stamina = pack_stamina - 1, last_pack_time = $1 WHERE id = $2',
      [currentTime, message.author.id]
    );

    const cardList = randomCards.map(card => `${card.name} (${card.rarity})`).join('\n');
    message.reply(`You opened a pack! Here are your cards:\n${cardList}`);
  },
};
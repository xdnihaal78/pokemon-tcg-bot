const db = require('../db/db');
const axios = require('axios');

module.exports = {
  name: 'openpack',
  execute: async (message, args) => {
    const set = args[0];
    const validSets = [
      'base1', 'base2', 'base3', 'base4', 'base5', // Base Sets
      'xy1', 'xy2', 'xy3', 'xy4', 'xy5', // XY Series
      'sm1', 'sm2', 'sm3', 'sm4', 'sm5', // Sun & Moon Series
      'swsh1', 'swsh2', 'swsh3', 'swsh4', 'swsh5', // Sword & Shield Series
      'swsh6', 'swsh7', 'swsh8', 'swsh9', 'swsh10', // Sword & Shield Series (continued)
      'swsh11', 'swsh12', 'swsh13' // Sword & Shield Series (continued)
    ];

    if (!validSets.includes(set)) {
      return message.reply('Invalid set. Choose from: base1, base2, xy1, sm1, swsh1, etc.');
    }

    const user = await db.query('SELECT * FROM users WHERE id = $1', [message.author.id]);
    if (!user.rows.length) {
      await db.query('INSERT INTO users (id, username) VALUES ($1, $2)', [message.author.id, message.author.username]);
      return message.reply('You are now registered! Try opening a pack again.');
    }

    const { pack_stamina, last_pack_time } = user.rows[0];
    const currentTime = Date.now();
    const PACK_COOLDOWN = 11 * 60 * 60 * 1000; // 11 hours

    // Check if the user is one of the exceptions
    const unlimitedStaminaUsers = ['437162069217771520', '920475167921156106'];
    const hasUnlimitedStamina = unlimitedStaminaUsers.includes(message.author.id);

    // Skip stamina check for unlimited stamina users
    if (!hasUnlimitedStamina && pack_stamina <= 0 && currentTime - last_pack_time < PACK_COOLDOWN) {
      return message.reply(`You're out of stamina! Wait ${Math.ceil((PACK_COOLDOWN - (currentTime - last_pack_time)) / (1000 * 60 * 60))} hours.`);
    }

    try {
      console.log('Fetching cards from the API...');
      const response = await axios.get(`https://api.pokemontcg.io/v2/cards?q=set.name:${set}`, {
        headers: {
          'X-Api-Key': '20b788cc-9c77-4a82-b6b0-973fdbddb752', // Add your API key here
        },
      });

      console.log('API Response:', response.data);

      const cards = response.data.data;
      if (!cards || cards.length === 0) {
        return message.reply('No cards found for this set.');
      }

      const randomCards = cards.sort(() => 0.5 - Math.random()).slice(0, 5);
      console.log('Random Cards:', randomCards);

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

      // Only update stamina for non-exception users
      if (!hasUnlimitedStamina) {
        await db.query(
          'UPDATE users SET pack_stamina = pack_stamina - 1, last_pack_time = $1 WHERE id = $2',
          [currentTime, message.author.id]
        );
      }

      const cardList = randomCards.map(card => `${card.name} (${card.rarity})\n${card.images.large}`).join('\n\n');
      message.reply(`You opened a pack! Here are your cards:\n${cardList}`);
    } catch (error) {
      console.error('Error fetching cards:', error);
      message.reply('Failed to fetch cards. Please try again later.');
    }
  },
};
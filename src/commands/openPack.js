const db = require('../db/db');
const axios = require('axios');

module.exports = {
  name: 'openpack',
  execute: async (message, args) => {
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
      console.log('Fetching Pokémon from PokeAPI...');
      const randomPokemonId = Math.floor(Math.random() * 898) + 1; // Random Pokémon ID (1 to 898)
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomPokemonId}`);

      console.log('API Response:', response.data);

      const pokemon = response.data;
      const pokemonName = pokemon.name;
      const pokemonImage = pokemon.sprites.front_default;
      const pokemonTypes = pokemon.types.map(type => type.type.name).join(', ');

      // Save Pokémon to the database
      await db.query(
        'INSERT INTO pokemon (id, name, image_url, types) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
        [pokemon.id, pokemonName, pokemonImage, pokemonTypes]
      );

      // Link Pokémon to the user
      await db.query(
        'INSERT INTO user_pokemon (user_id, pokemon_id) VALUES ($1, $2)',
        [message.author.id, pokemon.id]
      );

      // Only update stamina for non-exception users
      if (!hasUnlimitedStamina) {
        await db.query(
          'UPDATE users SET pack_stamina = pack_stamina - 1, last_pack_time = $1 WHERE id = $2',
          [currentTime, message.author.id]
        );
      }

      message.reply(`You opened a pack! Here’s your Pokémon:\n**${pokemonName}** (${pokemonTypes})\n${pokemonImage}`);
    } catch (error) {
      console.error('Error fetching Pokémon:', error);
      message.reply('Failed to fetch Pokémon. Please try again later.');
    }
  },
};
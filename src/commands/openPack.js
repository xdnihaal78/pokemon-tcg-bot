const db = require('../db/db');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js'); // Use EmbedBuilder

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

      // Fetch 6 random Pokémon
      const pokemonList = [];
      for (let i = 0; i < 6; i++) {
        const randomPokemonId = Math.floor(Math.random() * 898) + 1; // Random Pokémon ID (1 to 898)
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomPokemonId}`);
        const pokemon = response.data;

        // Extract stats
        const stats = {
          hp: pokemon.stats.find(stat => stat.stat.name === 'hp').base_stat,
          attack: pokemon.stats.find(stat => stat.stat.name === 'attack').base_stat,
          defense: pokemon.stats.find(stat => stat.stat.name === 'defense').base_stat,
          specialAttack: pokemon.stats.find(stat => stat.stat.name === 'special-attack').base_stat,
          specialDefense: pokemon.stats.find(stat => stat.stat.name === 'special-defense').base_stat,
          speed: pokemon.stats.find(stat => stat.stat.name === 'speed').base_stat,
        };

        pokemonList.push({
          id: pokemon.id,
          name: pokemon.name,
          image: pokemon.sprites.front_default,
          types: pokemon.types.map(type => type.type.name).join(', '),
          stats: stats,
        });

        // Save Pokémon to the database
        await db.query(
          'INSERT INTO pokemon (id, name, image_url, types, hp, attack, defense, special_attack, special_defense, speed) ' +
          'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING',
          [
            pokemon.id,
            pokemon.name,
            pokemon.sprites.front_default,
            pokemon.types.map(type => type.type.name).join(', '),
            stats.hp,
            stats.attack,
            stats.defense,
            stats.specialAttack,
            stats.specialDefense,
            stats.speed,
          ]
        );

        // Link Pokémon to the user
        await db.query(
          'INSERT INTO user_pokemon (user_id, pokemon_id) VALUES ($1, $2)',
          [message.author.id, pokemon.id]
        );
      }

      // Only update stamina for non-exception users
      if (!hasUnlimitedStamina) {
        await db.query(
          'UPDATE users SET pack_stamina = pack_stamina - 1, last_pack_time = $1 WHERE id = $2',
          [currentTime, message.author.id]
        );
      }

      // Create an embed for the pack opening result
      const embed = new EmbedBuilder() // Use EmbedBuilder
        .setTitle('Pack Opening')
        .setDescription(`You opened a pack! Here are your 6 Pokémon:`)
        .setColor('#00FF00');

      // Add each Pokémon to the embed
      pokemonList.forEach((pokemon, index) => {
        embed.addFields({
          name: `Pokémon ${index + 1}: ${pokemon.name}`,
          value:
            `**Types:** ${pokemon.types}\n` +
            `**HP:** ${pokemon.stats.hp}\n` +
            `**Attack:** ${pokemon.stats.attack}\n` +
            `**Defense:** ${pokemon.stats.defense}\n` +
            `**Special Attack:** ${pokemon.stats.specialAttack}\n` +
            `**Special Defense:** ${pokemon.stats.specialDefense}\n` +
            `**Speed:** ${pokemon.stats.speed}\n` +
            `[Image](${pokemon.image})`,
          inline: true,
        });
      });

      // Add a thumbnail (use the first Pokémon's image)
      embed.setThumbnail(pokemonList[0].image);

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching Pokémon:', error);
      message.reply('Failed to fetch Pokémon. Please try again later.');
    }
  },
};
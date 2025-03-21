const db = require('../db/db');
const axios = require('axios');
const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'battle',
  execute: async (message, args) => {
    const targetUser = message.mentions.users.first();
    if (!targetUser) return message.reply('Mention a user to battle!');

    // Get a random Pokémon from the current user's collection
    const userPokemon = await db.query(
      'SELECT pokemon.id, pokemon.name, pokemon.image_url, pokemon.types FROM pokemon ' +
      'JOIN user_pokemon ON pokemon.id = user_pokemon.pokemon_id ' +
      'WHERE user_pokemon.user_id = $1 ORDER BY RANDOM() LIMIT 1',
      [message.author.id]
    );

    // Get a random Pokémon from the target user's collection
    const targetPokemon = await db.query(
      'SELECT pokemon.id, pokemon.name, pokemon.image_url, pokemon.types FROM pokemon ' +
      'JOIN user_pokemon ON pokemon.id = user_pokemon.pokemon_id ' +
      'WHERE user_pokemon.user_id = $1 ORDER BY RANDOM() LIMIT 1',
      [targetUser.id]
    );

    if (!userPokemon.rows.length || !targetPokemon.rows.length) {
      return message.reply('Not enough Pokémon to battle!');
    }

    const userPokemonData = userPokemon.rows[0];
    const targetPokemonData = targetPokemon.rows[0];

    // Fetch detailed stats for both Pokémon from PokeAPI
    const userPokemonStats = await axios.get(`https://pokeapi.co/api/v2/pokemon/${userPokemonData.id}`);
    const targetPokemonStats = await axios.get(`https://pokeapi.co/api/v2/pokemon/${targetPokemonData.id}`);

    // Calculate total stats for both Pokémon
    const userTotalStats = userPokemonStats.data.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
    const targetTotalStats = targetPokemonStats.data.stats.reduce((sum, stat) => sum + stat.base_stat, 0);

    // Determine the winner
    const userWins = userTotalStats > targetTotalStats;

    // Create an embed for the battle result
    const embed = new MessageEmbed()
      .setTitle('Pokémon Battle')
      .setDescription(`${message.author.username} vs ${targetUser.username}`)
      .addField(
        `${message.author.username}'s Pokémon`,
        `**${userPokemonData.name}** (${userPokemonData.types})\nTotal Stats: ${userTotalStats}`,
        true
      )
      .addField(
        `${targetUser.username}'s Pokémon`,
        `**${targetPokemonData.name}** (${targetPokemonData.types})\nTotal Stats: ${targetTotalStats}`,
        true
      )
      .setThumbnail(userPokemonData.image_url)
      .setColor(userWins ? '#00FF00' : '#FF0000')
      .setFooter(userWins ? 'You won the battle!' : 'You lost the battle!');

    message.reply({ embeds: [embed] });
  },
};
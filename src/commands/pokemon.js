const db = require('../db/db');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'pokemon',
  execute: async (message, args) => {
    const pokemonName = args.join(' ');
    if (!pokemonName) return message.reply('Please specify a Pokémon name.');

    // Fetch the Pokémon from the user's collection
    const pokemon = await db.query(
      'SELECT pokemon.* FROM pokemon ' +
      'JOIN user_pokemon ON pokemon.id = user_pokemon.pokemon_id ' +
      'WHERE user_pokemon.user_id = $1 AND pokemon.name = $2',
      [message.author.id, pokemonName]
    );

    if (!pokemon.rows.length) {
      return message.reply(`You don't have a Pokémon named **${pokemonName}** in your collection.`);
    }

    const pokemonData = pokemon.rows[0];

    // Create an embed for the Pokémon details
    const embed = new EmbedBuilder()
      .setTitle(pokemonData.name)
      .setColor('#00FF00')
      .addFields(
        { name: 'Types', value: pokemonData.types, inline: true },
        { name: 'HP', value: pokemonData.hp.toString(), inline: true },
        { name: 'Attack', value: pokemonData.attack.toString(), inline: true },
        { name: 'Defense', value: pokemonData.defense.toString(), inline: true },
        { name: 'Special Attack', value: pokemonData.special_attack.toString(), inline: true },
        { name: 'Special Defense', value: pokemonData.special_defense.toString(), inline: true },
        { name: 'Speed', value: pokemonData.speed.toString(), inline: true }
      )
      .setThumbnail(pokemonData.image_url);

    message.reply({ embeds: [embed] });
  },
};
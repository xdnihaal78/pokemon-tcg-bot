const db = require('../db/db');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'wonderpick',
  execute: async (message, args) => {
    const targetUser = message.mentions.users.first();
    if (!targetUser) return message.reply('Mention a user to pick a Pokémon from!');

    // Get a random Pokémon from the target user's collection
    const targetPokemon = await db.query(
      'SELECT pokemon.id, pokemon.name, pokemon.image_url, pokemon.types FROM pokemon ' +
      'JOIN user_pokemon ON pokemon.id = user_pokemon.pokemon_id ' +
      'WHERE user_pokemon.user_id = $1 ORDER BY RANDOM() LIMIT 1',
      [targetUser.id]
    );

    if (!targetPokemon.rows.length) {
      return message.reply(`${targetUser.username} has no Pokémon to pick from!`);
    }

    const pokemon = targetPokemon.rows[0];

    // Transfer the Pokémon to the current user
    await db.query(
      'UPDATE user_pokemon SET user_id = $1 WHERE pokemon_id = $2',
      [message.author.id, pokemon.id]
    );

    // Create an embed for the wonder pick result
    const embed = new EmbedBuilder()
      .setTitle('Wonder Pick')
      .setColor('#00FF00')
      .setDescription(`You picked **${pokemon.name}** (${pokemon.types}) from ${targetUser.username}'s collection!`)
      .setThumbnail(pokemon.image_url);

    message.reply({ embeds: [embed] });
  },
};
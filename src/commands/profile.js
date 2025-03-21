const db = require('../db/db');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'profile',
  execute: async (message) => {
    const user = await db.query('SELECT * FROM users WHERE id = $1', [message.author.id]);
    if (!user.rows.length) {
      return message.reply('You are not registered! Use `!openpack` to register.');
    }

    const { username, xp, level } = user.rows[0];

    // Fetch the user's Pokémon collection
    const pokemonCollection = await db.query(
      'SELECT pokemon.name, pokemon.image_url FROM pokemon ' +
      'JOIN user_pokemon ON pokemon.id = user_pokemon.pokemon_id ' +
      'WHERE user_pokemon.user_id = $1',
      [message.author.id]
    );

    // Create an embed for the profile
    const embed = new EmbedBuilder()
      .setTitle(`${username}'s Profile`)
      .setColor('#00FF00')
      .addFields(
        { name: 'Level', value: level.toString(), inline: true },
        { name: 'XP', value: `${xp}/${level * 100}`, inline: true },
        { name: 'Pokémon Collection', value: pokemonCollection.rows.map(p => p.name).join(', ') || 'None', inline: false }
      )
      .setThumbnail(message.author.displayAvatarURL());

    message.reply({ embeds: [embed] });
  },
};
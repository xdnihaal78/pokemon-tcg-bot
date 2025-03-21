const db = require('../db/db');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'trade',
  execute: async (message, args) => {
    const targetUser = message.mentions.users.first();
    if (!targetUser) return message.reply('Mention a user to trade with!');

    const [userPokemonName, targetPokemonName] = args.slice(1);
    if (!userPokemonName || !targetPokemonName) {
      return message.reply('Usage: `!trade @user <your-pokemon> <their-pokemon>`');
    }

    // Fetch the user's Pokémon
    const userPokemon = await db.query(
      'SELECT pokemon.id FROM pokemon ' +
      'JOIN user_pokemon ON pokemon.id = user_pokemon.pokemon_id ' +
      'WHERE user_pokemon.user_id = $1 AND pokemon.name = $2',
      [message.author.id, userPokemonName]
    );

    // Fetch the target user's Pokémon
    const targetPokemon = await db.query(
      'SELECT pokemon.id FROM pokemon ' +
      'JOIN user_pokemon ON pokemon.id = user_pokemon.pokemon_id ' +
      'WHERE user_pokemon.user_id = $1 AND pokemon.name = $2',
      [targetUser.id, targetPokemonName]
    );

    if (!userPokemon.rows.length || !targetPokemon.rows.length) {
      return message.reply('One or both Pokémon were not found in the users\' collections.');
    }

    // Swap Pokémon
    await db.query(
      'UPDATE user_pokemon SET user_id = $1 WHERE pokemon_id = $2',
      [targetUser.id, userPokemon.rows[0].id]
    );
    await db.query(
      'UPDATE user_pokemon SET user_id = $1 WHERE pokemon_id = $2',
      [message.author.id, targetPokemon.rows[0].id]
    );

    // Create an embed for the trade result
    const embed = new EmbedBuilder()
      .setTitle('Trade Successful')
      .setColor('#00FF00')
      .setDescription(`${message.author.username} traded **${userPokemonName}** for ${targetUser.username}'s **${targetPokemonName}**.`);

    message.reply({ embeds: [embed] });
  },
};
const db = require('../db/db');

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

    // Simple battle logic: Compare Pokémon IDs (higher ID wins)
    const userWins = userPokemonData.id > targetPokemonData.id;

    const resultMessage = userWins
      ? `You won the battle with **${userPokemonData.name}** (${userPokemonData.types}) vs **${targetPokemonData.name}** (${targetPokemonData.types})!`
      : `You lost the battle with **${userPokemonData.name}** (${userPokemonData.types}) vs **${targetPokemonData.name}** (${targetPokemonData.types})!`;

    message.reply(resultMessage);
  },
};
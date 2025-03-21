const axios = require('axios');
const { EmbedBuilder } = require('discord.js');

const POKEMON_API = 'https://api.pokemontcg.io/v2/cards';
const API_KEY = '65ca0d52-f978-42c5-94dd-03a64293d8e5';

module.exports = {
  name: 'battle',
  execute: async (message, args) => {
    const targetUser = message.mentions.users.first();
    if (!targetUser) return message.reply('Mention a user to battle!');

    try {
      // Fetch two random Pokémon cards
      const userPokemon = await fetchRandomPokemon();
      const targetPokemon = await fetchRandomPokemon();

      // Calculate battle outcome
      const winner = determineWinner(userPokemon, targetPokemon);

      // Battle Embed
      const battleEmbed = new EmbedBuilder()
        .setTitle(`🔥 Pokémon Battle: ${message.author.username} vs ${targetUser.username} 🔥`)
        .setDescription(`${userPokemon.name} vs ${targetPokemon.name}`)
        .setImage(userPokemon.image)
        .setFooter({ text: `Winner: ${winner}` });

      message.channel.send({ embeds: [battleEmbed] });
    } catch (error) {
      console.error(error);
      message.reply('Error fetching Pokémon data!');
    }
  }
};

async function fetchRandomPokemon() {
  const response = await axios.get(POKEMON_API, {
    headers: { 'X-Api-Key': API_KEY },
    params: { pageSize: 1, page: Math.floor(Math.random() * 1000) },
  });
  const card = response.data.data[0];
  return {
    name: card.name,
    image: card.images.large,
    hp: parseInt(card.hp) || 50,
    attack: Math.floor(Math.random() * 50) + 10,
  };
}

function determineWinner(pokemon1, pokemon2) {
  return pokemon1.attack > pokemon2.attack ? pokemon1.name : pokemon2.name;
}

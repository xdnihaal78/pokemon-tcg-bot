import { createClient } from '@supabase/supabase-js';
import { EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import 'dotenv/config';

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default {
  name: 'pokemon',
  description: 'Fetches Pokémon details from your collection or the Pokémon TCG API.',
  async execute(message, args) {
    try {
      if (!args.length) {
        return message.reply('Please provide a Pokémon name or card ID!');
      }

      const query = args.join(' '); // Pokémon name or ID
      const userId = message.author.id;

      // First, check if the Pokémon exists in the user's collection
      const { data: userPokemon, error: userPokemonError } = await supabase
        .from('user_pokemon')
        .select('*')
        .eq('user_id', userId)
        .ilike('card_name', `%${query}%`)
        .limit(1);

      if (userPokemonError) {
        console.error(userPokemonError);
        return message.reply('Error fetching Pokémon from your collection.');
      }

      let pokemonCard;
      if (userPokemon.length) {
        // Found in user collection
        pokemonCard = userPokemon[0];
      } else {
        // Fetch from Pokémon TCG API
        const response = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:${query}`, {
          headers: { 'X-Api-Key': process.env.POKEMON_TCG_API_KEY }
        });

        const { data } = await response.json();
        if (!data || !data.length) {
          return message.reply('No Pokémon found with that name or ID.');
        }

        pokemonCard = data[0]; // Get the first matching card
      }

      // Create an embed to display Pokémon details
      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle(pokemonCard.card_name || pokemonCard.name)
        .setImage(pokemonCard.image_url || pokemonCard.images.small)
        .addFields(
          { name: 'Rarity', value: pokemonCard.rarity || 'Unknown', inline: true },
          { name: 'Set', value: pokemonCard.set?.name || 'Unknown', inline: true }
        )
        .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL() });

      message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      message.reply('An error occurred while fetching Pokémon details.');
    }
  }
};

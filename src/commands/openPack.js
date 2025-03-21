import { createClient } from '@supabase/supabase-js';
import { EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import 'dotenv/config';

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default {
  name: 'openpack',
  description: 'Opens a Pokémon card pack and adds the cards to your collection!',
  async execute(message) {
    try {
      const userId = message.author.id;

      // Fetch a random booster pack from Pokémon TCG API
      const packResponse = await fetch('https://api.pokemontcg.io/v2/cards?q=set.id:base1', {
        headers: { 'X-Api-Key': process.env.POKEMON_TCG_API_KEY }
      });

      if (!packResponse.ok) {
        return message.reply('Error fetching Pokémon cards. Try again later.');
      }

      const { data: cards } = await packResponse.json();

      if (!cards.length) {
        return message.reply('No cards found in this pack.');
      }

      // Select 5 random cards from the fetched pack
      const pack = [];
      while (pack.length < 5) {
        const randomCard = cards[Math.floor(Math.random() * cards.length)];
        if (!pack.includes(randomCard)) pack.push(randomCard);
      }

      // Store the cards in the database
      const insertData = pack.map((card) => ({
        user_id: userId,
        card_id: card.id,
        card_name: card.name,
        rarity: card.rarity || 'Common',
        image_url: card.images.small
      }));

      const { error: insertError } = await supabase.from('user_pokemon').insert(insertData);

      if (insertError) {
        console.error(insertError);
        return message.reply('Error saving your cards.');
      }

      // Create embed for the opened pack
      const embed = new EmbedBuilder()
        .setColor(0xffcc00)
        .setTitle('🎉 You Opened a Pokémon Pack!')
        .setDescription('Here are the cards you got:')
        .setFooter({ text: `Enjoy your new cards, ${message.author.username}!`, iconURL: message.author.displayAvatarURL() });

      pack.forEach((card) => {
        embed.addFields({
          name: card.name,
          value: `Rarity: **${card.rarity || 'Common'}**`,
          inline: true
        });
      });

      embed.setImage(pack[0].image_url); // Display one card image

      message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      message.reply('An unexpected error occurred while opening your pack.');
    }
  }
};

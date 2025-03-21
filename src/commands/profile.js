import { createClient } from '@supabase/supabase-js';
import { EmbedBuilder } from 'discord.js';
import 'dotenv/config';

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default {
  name: 'profile',
  description: 'Displays your Pokémon Trainer profile.',
  async execute(message) {
    try {
      const userId = message.author.id;

      // Fetch user details
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        console.error(userError);
        return message.reply('Error fetching your profile.');
      }

      if (!userData) {
        return message.reply("You don't have a profile yet! Use `!start` to create one.");
      }

      // Fetch Pokémon count
      const { count: pokemonCount, error: pokemonError } = await supabase
        .from('user_pokemon')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      if (pokemonError) {
        console.error(pokemonError);
        return message.reply('Error fetching your Pokémon collection.');
      }

      // Create an embed for the profile
      const embed = new EmbedBuilder()
        .setColor(0xffcc00)
        .setTitle(`${message.author.username}'s Trainer Profile`)
        .setThumbnail(message.author.displayAvatarURL())
        .addFields(
          { name: 'Trainer Name', value: userData.username, inline: true },
          { name: 'Pokémon Collected', value: `${pokemonCount || 0}`, inline: true },
          { name: 'XP', value: `${userData.xp}`, inline: true }
        )
        .setFooter({ text: 'Train hard and catch them all!', iconURL: message.author.displayAvatarURL() });

      message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      message.reply('An unexpected error occurred while fetching your profile.');
    }
  }
};

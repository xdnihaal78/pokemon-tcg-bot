import { createClient } from '@supabase/supabase-js';
import { EmbedBuilder } from 'discord.js';
import 'dotenv/config';

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default {
  name: 'leaderboard',
  description: 'Displays the top Pokémon trainers based on wins.',
  async execute(message) {
    try {
      // Fetch top trainers from Supabase
      const { data: leaderboard, error } = await supabase
        .from('users')
        .select('user_id, username, wins')
        .order('wins', { ascending: false }) // Sort by highest wins
        .limit(10);

      if (error) {
        console.error(error);
        return message.reply('Error fetching the leaderboard.');
      }

      if (!leaderboard.length) {
        return message.reply('No leaderboard data available yet!');
      }

      // Create leaderboard embed
      const embed = new EmbedBuilder()
        .setColor(0xffd700)
        .setTitle('🏆 Pokémon Trainer Leaderboard')
        .setDescription('Top trainers based on the number of battles won.')
        .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL() });

      leaderboard.forEach((user, index) => {
        embed.addFields({
          name: `#${index + 1} - ${user.username || `User ${user.user_id}`}`,
          value: `🏆 Wins: **${user.wins}**`,
          inline: false
        });
      });

      message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      message.reply('An unexpected error occurred while fetching the leaderboard.');
    }
  }
};

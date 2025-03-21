import { createClient } from '@supabase/supabase-js';
import { EmbedBuilder } from 'discord.js';
import 'dotenv/config';

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default {
  name: 'mission',
  description: 'Assigns a random Pokémon mission to the user.',
  async execute(message) {
    try {
      const userId = message.author.id;

      // Fetch all available missions
      const { data: missions, error: missionError } = await supabase
        .from('missions')
        .select('*');

      if (missionError) {
        console.error(missionError);
        return message.reply('Error fetching missions.');
      }

      if (!missions.length) {
        return message.reply('No missions available at the moment.');
      }

      // Pick a random mission
      const randomMission = missions[Math.floor(Math.random() * missions.length)];

      // Assign mission to the user
      const { error: insertError } = await supabase
        .from('user_missions')
        .insert([{ user_id: userId, mission_id: randomMission.id, status: 'in_progress' }]);

      if (insertError) {
        console.error(insertError);
        return message.reply('Error assigning the mission.');
      }

      // Create embed for the mission
      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('🎯 New Mission Assigned!')
        .setDescription(`**${randomMission.title}**\n${randomMission.description}`)
        .setFooter({ text: `Good luck, ${message.author.username}!`, iconURL: message.author.displayAvatarURL() });

      message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      message.reply('An unexpected error occurred while assigning the mission.');
    }
  }
};

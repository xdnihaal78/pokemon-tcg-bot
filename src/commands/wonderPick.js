import { createClient } from '@supabase/supabase-js';
import { EmbedBuilder } from 'discord.js';
import 'dotenv/config';

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default {
  name: 'wonderpick',
  description: 'Trade a Pokémon for a random one!',
  async execute(message, args) {
    try {
      if (args.length < 1) {
        return message.reply('Usage: `!wonderpick YourPokemon`');
      }

      const userId = message.author.id;
      const userPokemonName = args[0];

      // Validate user's Pokémon ownership
      const { data: userPokemon, error: userError } = await supabase
        .from('user_pokemon')
        .select('*')
        .eq('user_id', userId)
        .eq('card_name', userPokemonName)
        .single();

      if (!userPokemon) {
        return message.reply(`You don't own a Pokémon named **${userPokemonName}**.`);
      }

      // Fetch a random Pokémon from another user
      const { data: randomPokemon, error: randomError } = await supabase
        .from('user_pokemon')
        .select('*')
        .neq('user_id', userId)
        .limit(1)
        .order('RANDOM()')
        .single();

      if (!randomPokemon) {
        return message.reply('No available Pokémon for Wonder Trade at the moment.');
      }

      // Perform the trade (swap ownership)
      const { error: tradeError1 } = await supabase
        .from('user_pokemon')
        .update({ user_id: randomPokemon.user_id })
        .eq('id', userPokemon.id);

      const { error: tradeError2 } = await supabase
        .from('user_pokemon')
        .update({ user_id: userId })
        .eq('id', randomPokemon.id);

      if (tradeError1 || tradeError2) {
        console.error(tradeError1, tradeError2);
        return message.reply('An error occurred while processing the Wonder Trade.');
      }

      // Confirm trade success
      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle('Wonder Trade Successful!')
        .setDescription(`${message.author.username} traded **${userPokemonName}** and received **${randomPokemon.card_name}**!`)
        .setFooter({ text: 'Enjoy your new Pokémon!' });

      message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      message.reply('An unexpected error occurred while processing the Wonder Trade.');
    }
  }
};

import { createClient } from '@supabase/supabase-js';
import { EmbedBuilder } from 'discord.js';
import 'dotenv/config';

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default {
  name: 'trade',
  description: 'Trade Pokémon with another trainer.',
  async execute(message, args) {
    try {
      if (args.length < 3) {
        return message.reply('Usage: `!trade @user YourPokemon TheirPokemon`');
      }

      const mentionedUser = message.mentions.users.first();
      if (!mentionedUser) {
        return message.reply('You must mention a user to trade with.');
      }

      const senderId = message.author.id;
      const receiverId = mentionedUser.id;
      const senderPokemon = args[1];
      const receiverPokemon = args[2];

      // Validate sender's Pokémon ownership
      const { data: senderPokemonData, error: senderError } = await supabase
        .from('user_pokemon')
        .select('*')
        .eq('user_id', senderId)
        .eq('card_name', senderPokemon)
        .single();

      if (!senderPokemonData) {
        return message.reply(`You don't own a Pokémon named **${senderPokemon}**.`);
      }

      // Validate receiver's Pokémon ownership
      const { data: receiverPokemonData, error: receiverError } = await supabase
        .from('user_pokemon')
        .select('*')
        .eq('user_id', receiverId)
        .eq('card_name', receiverPokemon)
        .single();

      if (!receiverPokemonData) {
        return message.reply(`${mentionedUser.username} doesn't own a Pokémon named **${receiverPokemon}**.`);
      }

      // Perform the trade (update ownership)
      const { error: tradeError } = await supabase
        .from('user_pokemon')
        .update({ user_id: receiverId })
        .eq('id', senderPokemonData.id);

      const { error: tradeError2 } = await supabase
        .from('user_pokemon')
        .update({ user_id: senderId })
        .eq('id', receiverPokemonData.id);

      if (tradeError || tradeError2) {
        console.error(tradeError, tradeError2);
        return message.reply('An error occurred while processing the trade.');
      }

      // Confirm trade success
      const embed = new EmbedBuilder()
        .setColor(0x1abc9c)
        .setTitle('Pokémon Trade Successful!')
        .addFields(
          { name: `${message.author.username} Traded`, value: senderPokemon, inline: true },
          { name: `${mentionedUser.username} Traded`, value: receiverPokemon, inline: true }
        )
        .setFooter({ text: 'Trade completed successfully!' });

      message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      message.reply('An unexpected error occurred while processing the trade.');
    }
  }
};

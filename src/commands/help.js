import { EmbedBuilder } from 'discord.js';

export default {
  name: 'help',
  description: 'Displays a list of available commands and their descriptions.',
  execute(message, args, client) {
    try {
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('📜 Available Commands')
        .setDescription('Here is a list of commands you can use:')
        .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL() });

      client.commands.forEach((cmd) => {
        embed.addFields({ name: `\`${cmd.name}\``, value: cmd.description || 'No description provided.', inline: false });
      });

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply('An error occurred while fetching the help menu.');
    }
  }
};

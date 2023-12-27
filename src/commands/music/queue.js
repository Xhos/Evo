const { EmbedBuilder } = require('discord.js');
const { queue } = require('../../utils/addToQueue');

module.exports = {
  name: 'queue',
  description: 'View the queue',
  testOnly: true,

  callback: async (client, interaction) => {
    if (queue.length === 0) {
      return interaction.reply('The queue is currently empty!');
    }

    let formattedQueue = queue.slice(0, 15).map(track => `- \`${track}\``).join('\n');

    if (queue.length > 15) {
      const additionalTracks = queue.length - 15;
      formattedQueue += `\n... ${additionalTracks} more`;
    }

    const embed = new EmbedBuilder()
      .setTitle('Queue')
      .setDescription(formattedQueue)
      .setColor('#9F85FF');

    await interaction.reply({ embeds: [embed] });
  },
};
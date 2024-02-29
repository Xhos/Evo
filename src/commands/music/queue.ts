const { EmbedBuilder } = require('discord.js');
const { queues } = require('../../utils/queue');

module.exports = {
  name: 'queue',
  description: 'View the queue',
  testOnly: true,

  callback: async (client: any, interaction: any) => {
    const guildId = interaction.guild.id;
    let queue = queues[guildId];

    // if (!queue) {
    //   return interaction.reply('The queue is currently empty!');
    // }

    const formattedQueue = queue.getFormattedQueue();

    const embed = new EmbedBuilder()
      .setTitle('Queue')
      .setDescription(formattedQueue)
      .setColor('#9F85FF');

    await interaction.reply({ embeds: [embed] });
  },
};

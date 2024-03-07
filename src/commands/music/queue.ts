const { EmbedBuilder } = require('discord.js');
const { Queue } = require('../../utils/queue');

module.exports = {
  name: 'queue',
  description: 'View the queue',
  testOnly: true,

  callback: async (client: any, interaction: any) => {
    const queue = Queue.getQueue(interaction.guildId);
    const formattedQueue = queue.getFormattedQueue();

    if (!queue) {
      return interaction.reply('The queue is currently empty!');
    }

    const embed = new EmbedBuilder()
      .setTitle('Queue')
      .setDescription(formattedQueue)
      .setColor('#9F85FF');

    await interaction.reply({ embeds: [embed] });
  },
};

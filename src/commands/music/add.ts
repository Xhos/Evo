import { Queue } from '../../utils/queue';
import { logLevel, log } from '../../utils/log';
module.exports = {
  name: 'add',
  description: 'Add a track to the queue',
  testOnly: true,
  options: [
    {
      name: 'link',
      type: 3,
      description: 'spotify link',
      required: true,
    },
  ],

  callback: async (client: any, interaction: any) => {
    const queue = Queue.getQueue(interaction.guildId);

    const link = interaction.options.getString('link');
    try {
      await queue.add(link, interaction.user.username);
      await interaction.reply('Track added to the queue!');
    } catch (error: any) {
      log(error, logLevel.Error);
      await interaction.reply('There was an error adding the track to the queue.');
    }
  },
};

export {};

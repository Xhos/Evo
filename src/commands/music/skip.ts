import { Queue } from '../../utils/queue';
import { log, logLevel } from '../../utils/log';

module.exports = {
  name: 'skip',
  description: 'Skip the current track',
  testOnly: true,
  options: [
    {
      name: 'num_tracks',
      type: 4,
      description: 'Number of tracks to skip',
      required: false,
    },
  ],

  callback: async (client: any, interaction: any) => {
    const guildId = interaction.guild.id;
    const num = interaction.options.get('num_tracks')?.value || 1;

    await interaction.reply('Attempting to skip to the next track...');

    const queue = Queue.getQueue(guildId);
    if (!queue) {
      log(`No queue found for guild ID: ${guildId}`, logLevel.Error);
      return;
    }

    const result = queue.skip(num);

    await interaction.editReply(result);
  },
};

export {};

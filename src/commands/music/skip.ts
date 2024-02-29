const queues = require('../../utils/queue');

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
    let queue = queues[guildId];

    // if (!queue) {
    //   queue = new Queue();
    //   queues[guildId] = queue;
    // }

    let num = 1;

    if (interaction.options.get('num_tracks') != null) {
      let num = interaction.options.get('num_tracks').value;
    }

    await interaction.reply('Attempting to skip to the next track...');

    await interaction.editReply(await queue.skip(num));
  },
};

export {};

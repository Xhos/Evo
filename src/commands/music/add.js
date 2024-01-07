const { addToQueue } = require('../../utils/addToQueue');

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

  callback: async (client, interaction) => {
    const link = interaction.options.getString('link');
    await addToQueue(link, interaction.user.username);
    await interaction.reply('Track added to the queue!');
  },
};
const skipTrack = require('../../utils/skipTrack');

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

  callback: async (client, interaction) => {
    const guildId = interaction.guild.id;
    if (interaction.options.get('num_tracks') == null) {
      numTracksToSkip = 1;
    } else {
      numTracksToSkip = interaction.options.get('num_tracks').value;
    }
    // Reply immediately
    await interaction.reply('Attempting to skip to the next track...');

    // Then perform the actual operation
    msg = await skipTrack(guildId, numTracksToSkip);

    // Edit the previous reply
    await interaction.editReply(msg);
  },
};
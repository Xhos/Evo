const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
  name: 'leave',
  description: 'Leave the vc',
  testOnly: true,

  callback: async (client: any, interaction: any) => {
    const guildId = interaction.guild.id;
    const connection = getVoiceConnection(guildId);

    if (!connection) {
      return interaction.reply(
        'I am not currently connected to a voice channel!'
      );
    }

    connection.destroy();
    await interaction.reply('Left the voice channel!');
  },
};

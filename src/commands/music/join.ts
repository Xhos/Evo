const {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
} = require('@discordjs/voice');
const fs = require('fs');

module.exports = {
  name: 'join',
  description: 'Join the vc',
  testOnly: true,

  callback: async (client: any, interaction: any) => {
    const channelId = interaction.member.voice.channelId;
    if (!channelId)
      return interaction.reply('You should join a voice channel first!');

    const channel = interaction.guild.channels.resolve(channelId);

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    await interaction.reply('Joined!');
  },
};

export {};

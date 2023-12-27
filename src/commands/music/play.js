const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const { addToQueue, queue } = require('../../utils/addToQueue');
const playTrack = require('../../utils/playTrack');
const { EmbedBuilder } = require('discord.js');
const audioPlayerEventHandler = require('../../handlers/audioPlayerEventHandler');

module.exports = {
  name: 'play',
  description: 'Play a song',
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

    const embed = new EmbedBuilder()
      .setTitle('Downloading...')
      .setColor('#FFFF00')

    const link = interaction.options.getString('link');
  
    const channelId = interaction.member.voice.channelId;
    if (!channelId) return interaction.reply({ content: 'You should join a voice channel first!', ephemeral: true });
  
    // Reply immediately
    await interaction.reply({ embeds: [embed] });
  
    // Then perform the actual operation
    await addToQueue(link);
  
    const channel = interaction.guild.channels.resolve(channelId);
    let connection = getVoiceConnection(channel.guild.id);
  
    if (!connection) {
      connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });
    }
    
    await playTrack(channel.guild.id);

    const newEmbed = new EmbedBuilder()
    .setTitle(`Playing`)
    .setColor('#9F85FF')
    .setDescription("- ```" + queue[0] + "```")
    // Edit the previous reply
    await interaction.editReply({ embeds: [newEmbed] });
  },
};
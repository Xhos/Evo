import { joinVoiceChannel, getVoiceConnection } from '@discordjs/voice';
import { queues, Queue } from '../../utils/queue';
import { players, Player } from '../../utils/player';
import { EmbedBuilder } from 'discord.js';
import { logLevel, log } from '../../utils/log';

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

  callback: async (client: any, interaction: any) => {
    const guildId = interaction.guild.id;
    let queue = queues[guildId];

    if (!queue) {
      queue = queues[guildId] = new Queue(guildId);
    }

    let player = players[guildId];

    if (!player) {
      player = players[guildId] = new Player(guildId);
    }
    const link = interaction.options.getString('link');

    const channelId = interaction.member.voice.channelId;
    if (!channelId)
      return interaction.reply({
        content: 'You should join a voice channel first!',
        ephemeral: true,
      });

    const embed = new EmbedBuilder()
      .setTitle('Downloading...')
      .setColor('#FFFF00');

    await interaction.reply({ embeds: [embed] });

    await queue.add(link, interaction.user.username);

    await player.join(channelId);

    await player.play();

    const currentTrack = queue.getCurrentTrack();
    if (typeof currentTrack === 'string') {
      log(currentTrack, logLevel.Debug);
      return;
    }

    const newEmbed = new EmbedBuilder()
      .setTitle(`Playing`)
      .setColor('#9F85FF')
      .setDescription(
        ` - [${currentTrack.name} - ${currentTrack.artists}](${currentTrack.link})`
      );

    await interaction.editReply({ embeds: [newEmbed] });
  },
};

export {};

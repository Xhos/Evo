import { Queue } from '../../utils/queue';
import { Player } from '../../utils/player';
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

    // Get the queue and player for the guild
    let queue = Queue.getQueue(guildId);
    let player = Player.getPlayer(guildId);

    const link = interaction.options.getString('link');

    // Throw an error if the user is not in a voice channel
    const channelId = interaction.member.voice.channelId;
    if (!channelId)
      return interaction.reply({
        content: 'You should join a voice channel first!',
        ephemeral: true,
      });

    const embed = new EmbedBuilder().setTitle('Downloading...').setColor('#FFFF00');
    await interaction.reply({ embeds: [embed] });

    // Add the track to the queue
    await queue.add(link, interaction.user.username);

    // Join the voice channel
    await player.join(channelId);

    // Play the track
    await player.play();

    const currentTrack = queue.getCurrentTrack();
    if (typeof currentTrack === 'string') {
      log(currentTrack, logLevel.Debug);
      return;
    }

    const newEmbed = new EmbedBuilder()
      .setTitle(`Playing`)
      .setColor('#9F85FF')
      .setDescription(` - [${currentTrack.name} - ${currentTrack.artists}](${currentTrack.link})`);

    await interaction.editReply({ embeds: [newEmbed] });
  },
};

export {};

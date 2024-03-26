import { Queue } from '../../utils/queue';
import { Player } from '../../utils/player';
import { EmbedBuilder } from 'discord.js';
import { logLevel, log } from '../../utils/log';

module.exports = {
  name: 'join',
  description: 'Join the vc',
  testOnly: true,

  callback: async (client: any, interaction: any) => {
    const guildId = interaction.guild.id;

    // Get the queue and player for the guild
    let player = Player.getPlayer(guildId);

    // Throw an error if the user is not in a voice channel
    const channelId = interaction.member.voice.channelId;
    if (!channelId)
      return interaction.reply({
        content: 'You should join a voice channel first!',
        ephemeral: true,
      });

    const embed = new EmbedBuilder().setTitle('Joining...').setColor('#FFFF00');
    await interaction.reply({ embeds: [embed] });

    // Join the voice channel
    await player.join(channelId);

    const newEmbed = new EmbedBuilder().setTitle(`Joined`).setColor('#9F85FF');

    await interaction.editReply({ embeds: [newEmbed] });
  },
};

export {};

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { Queue } = require('../../utils/queue');
const { log, logLevel } = require('../../utils/log');
const { Player } = require('../../utils/player');

module.exports = {
  name: 'player',
  description: 'The music player GUI.',
  testOnly: true,

  callback: async (client: any, interaction: any) => {
    const skipButton = new ButtonBuilder()
      .setCustomId('skip')
      .setLabel('Skip')
      .setStyle(ButtonStyle.Primary);

    const pauseResumeButton = new ButtonBuilder()
      .setCustomId('pause_resume')
      .setLabel('Pause')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(skipButton, pauseResumeButton);

    const currentTrack = Queue.getQueue(interaction.guild.id).getCurrentTrack();
    const embed = new EmbedBuilder()
      .setTitle('Player')
      .setDescription(`[${currentTrack.name} - ${currentTrack.artists}](${currentTrack.link})`)
      .setColor('#9F85FF');

    await interaction.reply({ embeds: [embed], components: [row] });

    client.on('interactionCreate', async (interaction: any) => {
      if (!interaction.isButton()) return;

      const guildId = interaction.guild.id;
      const queue = Queue.getQueue(guildId);
      const player = Player.getPlayer(guildId);

      if (!queue) {
        log(`No queue found for guild ID: ${guildId}`, logLevel.Error);
        return;
      }

      if (interaction.customId === 'skip') {
        try {
          await interaction.deferUpdate();
          await queue.skip(1);
        } catch (error: any) {
          log(error, logLevel.Error);
          await interaction.followUp({
            content: 'There was an error while trying to skip the song.',
            ephemeral: true,
          });
        }
      } else if (interaction.customId === 'pause_resume') {
        try {
          await interaction.deferUpdate();
          let pauseResumeButton;
          if (queue.isPlaying === true) {
            player.pause();
            pauseResumeButton = new ButtonBuilder()
              .setCustomId('pause_resume')
              .setLabel('Resume')
              .setStyle(ButtonStyle.Secondary);
          } else {
            player.resume();
            pauseResumeButton = new ButtonBuilder()
              .setCustomId('pause_resume')
              .setLabel('Pause')
              .setStyle(ButtonStyle.Secondary);
          }
          const row = new ActionRowBuilder().addComponents(skipButton, pauseResumeButton);
          await interaction.editReply({ embeds: [embed], components: [row] });
        } catch (error: any) {
          log(error, logLevel.Error);
          await interaction.followUp({
            content: 'There was an error while trying to pause/resume the player.',
            ephemeral: true,
          });
        }
      }
    });
  },
};

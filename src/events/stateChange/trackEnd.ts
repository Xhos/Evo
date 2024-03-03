const { AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');
const skipTrack = require('../../utils/skipTrack');
import { logLevel, log } from '../../utils/log';

module.exports = (player: any, oldState: any, newState: any) => {
  // Check if the player has just become idle
  if (
    newState.status === AudioPlayerStatus.Idle &&
    oldState.status !== AudioPlayerStatus.Idle
  ) {
    log('The audio player has just become idle');
    // Check if the bot is connected to a voice channel
    const connection = getVoiceConnection(player.guildId);
    if (!connection) {
      log('Not connected to a voice channel.');
      return;
    }
    // Play the next track
    skipTrack(player.guildId, 1);
  }
};

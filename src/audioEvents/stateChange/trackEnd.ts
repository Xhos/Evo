import { AudioPlayerStatus } from '@discordjs/voice';
import { Queue } from '../../utils/queue';
import { logLevel, log } from '../../utils/log';

module.exports = (player: any, oldState: any, newState: any) => {
  const queue = Queue.getQueue(player.guildId);
  // Check if the player has just become idle
  if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
    log('The audio player has just become idle', logLevel.Debug);
    // Play the next track
    queue.skip(1);
  }
};

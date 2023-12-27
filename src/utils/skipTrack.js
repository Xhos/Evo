const playTrack = require('./playTrack');
const { queue } = require('./addToQueue');

async function skipTrack(guildId, num) {
  // Check if the queue is empty
  if (queue.length === 0) {
    return 'The queue is empty.';
  }

  // Check if the number of tracks to skip is more than the length of the queue
  if (num >= queue.length) {
    return 'The number of tracks to skip is more than the length of the queue.';
  }

  // Remove the specified number of tracks from the queue
  for (let i = 0; i < num; i++) {
    queue.shift();
  }

  // Play the next track
  playTrack(guildId);

  return `Successfully skipped ${num} track(s)!`;
}

module.exports = skipTrack;
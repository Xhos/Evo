const { createAudioPlayer, createAudioResource, getVoiceConnection } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');
const { queue } = require('./addToQueue');
const queueDownload = require('./queueDownload');
const audioPlayerEventHandler = require('../handlers/audioPlayerEventHandler');

async function playTrack(guildId) {
  if (queue.length === 0) {
    console.log('The queue is empty.');
    return;
  }

  // Get the current track from the queue
  const currentTrack = queue[0];

  // Download the track without waiting for it to finish
  Promise.resolve(queueDownload(queue)).catch((error) => {
    console.error(`Error downloading track: ${error.message}`);
  });

  // Check if the file exists every second
  const filePath = path.join(__dirname, '..', 'temp', `${currentTrack.name}.mp3`);
  const fileCheckInterval = setInterval(() => {
    if (fs.existsSync(filePath)) {
      clearInterval(fileCheckInterval);

      // Get the voice connection
      const connection = getVoiceConnection(guildId);
      if (!connection) {
        console.log('Not connected to a voice channel.');
        return;
      }

      // Create an audio player and resource
      const player = createAudioPlayer();
      player.guildId = guildId;
      audioPlayerEventHandler(player);
      const resource = createAudioResource(fs.createReadStream(filePath));

      // Play the track
      player.play(resource);
      connection.subscribe(player);

      console.log(`Playing: ${currentTrack.name} - ${currentTrack.artists}`);
    } else {
      console.log(`File ${filePath} does not exist.`);
    }
  }, 1000);
}

module.exports = playTrack;
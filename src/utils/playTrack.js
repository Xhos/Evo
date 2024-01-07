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

  // Download the track and wait for it to finish
  try {
    await queueDownload(queue);
  } catch (error) {
    console.error(`Error downloading track: ${error.message}`);
    return;
  }

  // Check if the file exists
  const filePath = path.join(__dirname, '..', 'temp', `${currentTrack.name}.mp3`);
  if (!fs.existsSync(filePath)) {
    console.log(`File ${filePath} does not exist.`);
    return;
  }

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
}

module.exports = playTrack;
const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = (player, resource) => {
  player.on('stateChange', (oldState, newState) => {
    // Check if the player has just started playing
    if (
      newState.status === AudioPlayerStatus.Playing &&
      oldState.status !== AudioPlayerStatus.Playing
    ) {
      console.log(`Started playing track: ${resource.metadata.title}`);
    }
  });
};

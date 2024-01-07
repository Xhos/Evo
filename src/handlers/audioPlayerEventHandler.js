const path = require('path');
const getAllFiles = require('../utils/getAllFiles');

module.exports = (player) => {
    const eventFolders = getAllFiles(path.join(__dirname, '..', 'events'), true);

    for (const eventFolder of eventFolders) {
        const eventFiles = getAllFiles(eventFolder);
        eventFiles.sort((a, b) => a > b);

        const eventName = eventFolder.replace(/\\/g, '/').split('/').pop();

        player.on(eventName, async (oldState, newState) => {
            for (const eventFile of eventFiles) {
              const eventFunction = require(eventFile);
              await eventFunction(player, oldState, newState);
            }
          });
    }
    player.on('error', (error) => {
      console.error(`Error occurred in player: ${error.message}`);
    });
};
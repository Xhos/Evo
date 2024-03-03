import path from 'path';
import getAllFiles from '../utils/getAllFiles';
import { logLevel, log } from '../utils/log';

const audioPlayerEventHandler = (player) => {
  const eventFolders = getAllFiles(path.join(__dirname, '..', 'events'), true);

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);
    eventFiles.sort((a, b) => (a > b ? 1 : -1));

    const eventName = eventFolder.replace(/\\/g, '/').split('/').pop();

    player.on(eventName, async (oldState, newState) => {
      for (const eventFile of eventFiles) {
        const eventFunction = require(eventFile);
        if (typeof eventFunction === 'function') {
          await eventFunction(player, oldState, newState);
        } else {
          log(`Failed to load event file: ${eventFile}`, logLevel.Error);
        }
      }
    });
  }
  player.on('error', (error) => {
    log(`Error occurred in player: ${error.message}`, logLevel.Error);
  });
};

export default audioPlayerEventHandler;

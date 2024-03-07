import path from 'path';
import getAllFiles from '../utils/getAllFiles';
import { logLevel, log } from '../utils/log';

const audioPlayerEventHandler = (player: any) => {
  const eventFolders = getAllFiles(path.join(__dirname, '..', 'audioEvents'), true);

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);
    eventFiles.sort((a, b) => (a > b ? 1 : -1));

    const eventName = eventFolder.replace(/\\/g, '/').split('/').pop();

    player.on(eventName, async (oldState: any, newState: any) => {
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
  player.on('error', (error: any) => {
    log(`Error occurred in player: ${error.message}, stack: ${error.stack}`, logLevel.Error);
  });
};

export default audioPlayerEventHandler;

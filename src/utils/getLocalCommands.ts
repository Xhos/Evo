const path = require('path');
import getAllFiles from './getAllFiles';

module.exports = (exceptions: string[] = []) => {
  let localCommands: { name: string }[] = [];

  const commandCategories = getAllFiles(
    path.join(__dirname, '..', 'commands'),
    true
  );

  for (const commandCategory of commandCategories) {
    const commandFiles = getAllFiles(commandCategory);

    for (const commandFile of commandFiles) {
      const commandObject: { name: string } = require(commandFile);

      if (exceptions.includes(commandObject.name)) {
        continue;
      }

      localCommands.push(commandObject);
    }
  }

  return localCommands;
};

export {};

import { Player } from '../../utils/player';
import { Queue } from '../../utils/queue';
import { logLevel, log } from '../../utils/log';

module.exports = (client: any) => {
  log('Initializing players/queues...', logLevel.Info);

  const players: { [guildId: string]: Player } = {};
  const queues: { [guildId: string]: Queue } = {};

  client.guilds.cache.forEach((guild: any) => {
    players[guild.id] = new Player(guild.id);
    queues[guild.id] = new Queue(guild.id);
    log(`Initialized player and queue for ${guild.name}.`, logLevel.Info);
  });

  log(
    `Initialized ${Object.keys(players).length} players and ${
      Object.keys(queues).length
    } queues.`,
    logLevel.Info
  );
};

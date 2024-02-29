import { logLevel, log } from '../../utils/log';
module.exports = (client: any) => {
  log(`Logged in as ${client.user.tag}!`, logLevel.Info);
};

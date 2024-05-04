import client from './utils/client';
import eventHandler from './handlers/eventHandler';
import audioPlayerEventHandlers from './handlers/audioPlayerEventHandler';
import dotenv from 'dotenv';

dotenv.config();

eventHandler(client);
audioPlayerEventHandlers(client);
client.login(process.env.DISCORD_TOKEN);

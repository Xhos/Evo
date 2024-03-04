import client from './utils/client';
import eventHandler from './handlers/eventHandler';
import dotenv from 'dotenv';

dotenv.config();

eventHandler(client);

client.login(process.env.DISCORD_TOKEN);

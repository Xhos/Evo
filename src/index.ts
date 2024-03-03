import { Client, IntentsBitField } from 'discord.js';
import dotenv from 'dotenv';
import eventHandler from './handlers/eventHandler';

dotenv.config();

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildVoiceStates,
  ],
});

eventHandler(client);

client.login(process.env.DISCORD_TOKEN);

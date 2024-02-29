// External module imports
import * as oracledb from 'oracledb';
import { Client, IntentsBitField } from 'discord.js';
import dotenv from 'dotenv';

// Internal module imports
import { log, logLevel } from './utils/log';
import eventHandler from './handlers/eventHandler';

// Load environment variables
dotenv.config();

// Database configuration
const dbConfig: oracledb.ConnectionAttributes = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECTION_STRING,
};

// Database connection class
class DBConnection {
  public async initializeDBConnection(): Promise<oracledb.Connection> {
    try {
      const connection = await oracledb.getConnection(dbConfig);
      log('Connected to the database', logLevel.Info);
      return connection;
    } catch (err) {
      log('Error occurred while connecting to the database', logLevel.Error);
      throw err;
    }
  }
}

// Initialize database connection
const dbConnection = new DBConnection();
dbConnection.initializeDBConnection();

// Initialize Discord client
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildVoiceStates,
  ],
});

// Handle events
eventHandler(client);

// Log in to Discord
client.login(process.env.DISCORD_TOKEN);

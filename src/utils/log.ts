import { WebhookClient } from 'discord.js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const webhookClient = new WebhookClient({
  url: process.env.DISCORD_WEBHOOK_URL ?? '',
});

export enum logLevel {
  Error = 'ERROR',
  Warn = 'WARN',
  Info = 'INFO',
  Debug = 'DEBUG',
}

export async function log(message: string, level: logLevel = logLevel.Info) {
  const currentDate = new Date();
  const formattedDate = currentDate
    .toLocaleString('en-GB', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    .replace(/,/g, '')
    .replace(/\//g, '.');

  const formattedMessage = `[${level}] (${formattedDate}) ${message}\n`;

  let colorizedMessage;
  switch (level) {
    case logLevel.Error:
      colorizedMessage = `\x1b[31m${formattedMessage}\x1b[0m`; // Red
      break;
    case logLevel.Warn:
      colorizedMessage = `\x1b[33m${formattedMessage}\x1b[0m`; // Yellow
      break;
    case logLevel.Info:
      colorizedMessage = `\x1b[36m${formattedMessage}\x1b[0m`; // Cyan
      break;
    default:
      colorizedMessage = formattedMessage;
  }

  console.log(colorizedMessage.replace(/\n$/, ''));

  if (level === logLevel.Error || level === logLevel.Warn) {
    try {
      await webhookClient.send(formattedMessage);
    } catch (error: any) {
      console.error(
        `Failed to send message to Discord webhook: ${error.message}`
      );
    }
  }

  const logFileName = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}.log`;
  const logFilePath = path.join(__dirname, '..', 'logs', logFileName);

  try {
    await fs.appendFile(logFilePath, formattedMessage + '\n');
  } catch (error: any) {
    console.error(`Failed to write to log file: ${error.message}`);
  }
}

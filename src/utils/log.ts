// import { WebhookClient } from 'discord.js';
import fs from 'fs/promises';
import path from 'path';

// const webhookClient = new WebhookClient({
//   url: process.env.DISCORD_WEBHOOK_URL ?? '',
// });

export enum logLevel {
  Error = 'ERROR',
  Warn = 'WARN',
  Info = 'INFO',
  Debug = 'DEBUG',
}

export async function log(message: string, level: logLevel = logLevel.Info) {
  let colorizedMessage;
  switch (level) {
    case logLevel.Error:
      colorizedMessage = `\x1b[31m[ERROR] ${message}\x1b[0m`; // Red
      break;
    case logLevel.Warn:
      colorizedMessage = `\x1b[33m[WARN] ${message}\x1b[0m`; // Yellow
      break;
    case logLevel.Info:
      colorizedMessage = `\x1b[36m[INFO] ${message}\x1b[0m`; // Cyan
      break;
    case logLevel.Debug:
      colorizedMessage = `\x1b[35m[DEBUG] ${message}\x1b[0m`; // Magenta
      break;
    default:
      colorizedMessage = `[${level}] ${message}`;
  }

  console.log(colorizedMessage);

  // if (level === logLevel.Error || level === logLevel.Warn) {
  //   try {
  //     await webhookClient.send(`[${level}] ${message}`);
  //   } catch (error: any) {
  //     console.error(`Failed to send message to Discord webhook: ${error.message}`);
  //   }
  // }

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

  const logFileName = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}.log`;
  const logFilePath = path.join(__dirname, '..', 'logs', logFileName);

  const logFileMessage = `[${level}] (${formattedDate}) ${message}`;

  try {
    await fs.appendFile(logFilePath, logFileMessage + '\n');
  } catch (error: any) {
    console.error(`Failed to write to log file: ${error.message}`);
  }
}

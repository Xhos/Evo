import {
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  NoSubscriberBehavior,
  joinVoiceChannel,
} from '@discordjs/voice';
import { queues, Queue } from './queue';
import { logLevel, log } from './log';

import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

export class Player {
  static players: { [guildId: string]: Player } = {};

  guild: any;
  guildId: string;
  queue: Queue;
  player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    },
  });

  constructor(guildId: string) {
    this.guildId = guildId;
    this.guild = client.guilds.cache.get(guildId);
    this.queue = queues[this.guildId];
    Player.players[guildId] = this;
  }

  play() {
    const currentTrack = this.queue.getCurrentTrack();
    if (typeof currentTrack === 'string') {
      log(currentTrack, logLevel.Info);
      return;
    }

    const resource = createAudioResource(currentTrack.path);
    this.player.play(resource);
  }

  join(channelID: string) {
    if (!this.guild) {
      console.error(
        `Guild with id ${this.guildId} not found in client's cache.`
      );
      return;
    }

    const channel = this.guild.channels.resolve(channelID);

    let connection = getVoiceConnection(channel.guild.id);

    if (!connection) {
      connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });
      log('Successfully connected to the voice channel.', logLevel.Info);
    } else {
      log(
        'Join called but already connected to a voice channel.',
        logLevel.Warn
      );
    }

    // async playTrack() {
    //   if (this.queue.length === 0) {
    //     console.log('The queue is empty.');
    //     return;
    //   }

    //   // Get the current track from the queue
    //   const currentTrack = this.queue[0];

    //   // Download the track and wait for it to finish
    //   try {
    //     this.queueDownload();
    //   } catch (error: any) {
    //     console.error(`Error downloading track: ${error.message}`);
    //     return;
    //   }

    //   const playDownloadedTrack = (track: any) => {
    //     // Check if the file exists
    //     const filePath = path.join(__dirname, '..', 'temp', `${track.name}.mp3`);
    //     if (!fs.existsSync(filePath)) {
    //       console.log(`File ${filePath} does not exist.`);
    //       return;
    //     }

    //     // Get the voice connection
    //     const connection = getVoiceConnection(this.guildId);
    //     if (!connection) {
    //       console.log('Not connected to a voice channel.');
    //       return;
    //     }

    //     // Create an audio player and resource
    //     const player = createAudioPlayer();
    //     player.guildId = this.guildId;
    //     audioPlayerEventHandler(player);
    //     const resource = createAudioResource(fs.createReadStream(filePath));

    //     // Play the track
    //     player.play(resource);
    //     connection.subscribe(player);

    //     console.log(`Playing: ${track.name} - ${track.artists}`);

    //     // Remove the event listener after the track is played
    //     // downloadEmitter.off('trackDownloaded', playDownloadedTrack);
    //   };

    //   // downloadEmitter.on('trackDownloaded', playDownloadedTrack);
    // }

    // queueDownload() {
    //   // Implement the logic for downloading the tracks in the queue
    // }
  }
}

export const players: { [guildId: string]: Player } = {};

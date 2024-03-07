import {
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  NoSubscriberBehavior,
  joinVoiceChannel,
} from '@discordjs/voice';
import { Queue } from './queue';
import { logLevel, log } from './log';
import client from './client';

export class Player {
  static players: Map<string, Player> = new Map();

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
    this.queue = Queue.getQueue(guildId); // Get the Queue instance for the guild
    Player.players.set(guildId, this);

    client.guilds
      .fetch(guildId)
      .then((guild) => {
        this.guild = guild;
      })
      .catch((error) => {
        log(`Error fetching guild: ${error}`, logLevel.Error);
      });
  }

  static getPlayer(guildId: string): Player {
    let player = this.players.get(guildId);
    if (!player) {
      player = new Player(guildId);
      this.players.set(guildId, player);
    }
    return player;
  }

  async stop() {
    const queue = Queue.getQueue(this.guildId);
    log('Stopping the player..', logLevel.Debug);
    this.player.stop();
    queue.isPlaying = false;
    log(`Audio stopped: ${this.player.state.status}`, logLevel.Debug);
  }

  async pause() {
    const queue = Queue.getQueue(this.guildId);
    log('Pausing the player..', logLevel.Debug);
    this.player.pause();
    queue.isPlaying = false;
    log(`Audio paused: ${this.player.state.status}`, logLevel.Debug);
  }

  async resume() {
    const queue = Queue.getQueue(this.guildId);
    log('Resuming the player..', logLevel.Debug);
    this.player.unpause();
    queue.isPlaying = true;
    log(`Audio resumed: ${this.player.state.status}`, logLevel.Debug);
  }

  async play() {
    log('Trying to get the current track from the queue..', logLevel.Debug);
    const currentTrack = this.queue.getCurrentTrack();
    if (typeof currentTrack === 'string') {
      return;
    }

    if (currentTrack.downloadStatus === 'not_started') {
      log('Track is not yet downloded, downloading it now..', logLevel.Debug);
      await currentTrack.download();
    }

    log(JSON.stringify(currentTrack), logLevel.Debug);
    const resource = createAudioResource(currentTrack.path);
    this.player.play(resource);

    const queue = Queue.getQueue(this.guildId);
    queue.isPlaying = true;

    log(`Playing: ${currentTrack.name} - ${currentTrack.artists}`, logLevel.Debug);
    log(`Audio player status: ${this.player.state.status}`, logLevel.Debug);

    // Listen for error events on the AudioPlayer
    this.player.on('error', (error) => {
      log(`AudioPlayer error: ${error.message}`, logLevel.Error);
    });
  }

  join(channelID: string) {
    log(`Joining voice channel with id ${channelID}. Guild ID: ${this.guildId}`, logLevel.Debug);

    const channel = this.guild.channels.resolve(channelID);

    let connection = getVoiceConnection(channel.guild.id);

    if (!connection) {
      connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      // Subscribe the VoiceConnection to the AudioPlayer
      connection.subscribe(this.player);
      log('Successfully connected to the voice channel.', logLevel.Info);
    } else {
      log('Join called but already connected to a voice channel.', logLevel.Warn);
    }

    // Check if the voice connection is in the Ready state
    log(`VoiceConnection status: ${connection.state.status}`, logLevel.Debug);

    // Listen for error and state change events on the voice connection
    connection.on('error', (error) => {
      log(`VoiceConnection error: ${error.message}`, logLevel.Error);
    });
    connection.on('stateChange', (oldState, newState) => {
      log(`VoiceConnection state change: ${oldState.status} -> ${newState.status}`, logLevel.Debug);
    });
  }
}

export const players: { [guildId: string]: Player } = {};

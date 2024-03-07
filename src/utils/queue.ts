import { log, logLevel } from './log';
import { Track } from './track';
import { Player } from './player';

export class Queue {
  static queues: Map<string, Queue> = new Map();
  queue: Track[];
  guildId: string;
  isPlaying: boolean = false;

  constructor(guildId: string) {
    this.guildId = guildId;
    this.queue = [];
  }

  static getQueue(guildId: string): Queue {
    let queue = this.queues.get(guildId);
    if (!queue) {
      queue = new Queue(guildId);
      this.queues.set(guildId, queue);
    }
    return queue;
  }

  async getPlatformAndType(link: string) {
    if (link.includes('youtube.com') || link.includes('youtu.be')) {
      return { platform: 'youtube', type: 'track' };
    } else if (link.includes('spotify.com')) {
      if (link.includes('/track/')) {
        return { platform: 'spotify', type: 'track' };
      } else if (link.includes('/playlist/')) {
        return { platform: 'spotify', type: 'playlist' };
      } else if (link.includes('/album/')) {
        return { platform: 'spotify', type: 'album' };
      }
    }
    throw new Error('Invalid link: platform and type could not be determined');
  }

  async add(link: string, requester: string) {
    log(`Adding ${link} to the queue..`, logLevel.Debug);

    const { platform, type } = await this.getPlatformAndType(link);
    let tracks: Track[] = [];

    if (platform === 'spotify') {
      if (type === 'track') {
        const track = await Track.create(link, requester);
        tracks.push(track);
      } else if (type === 'playlist') {
        const playlistId = link.split('playlist/')[1].split('?')[0];
        const spotifyTracks = await Track.getTracksFromPlaylist(playlistId);

        const trackPromises = spotifyTracks
          .map((trackData: any) => {
            if (trackData) {
              return Track.create(trackData.external_urls.spotify, requester);
            }
          })
          .filter((track: any): track is Promise<Track> => track !== undefined);

        tracks = await Promise.all(trackPromises);
      } else if (type === 'album') {
        const albumId = link.split('album/')[1].split('?')[0];
        const spotifyTracks = await Track.getTracksFromAlbum(albumId);

        const trackPromises = spotifyTracks.map((trackData: any) => {
          return Track.create(trackData.external_urls.spotify, requester);
        });

        tracks = await Promise.all(trackPromises);
      }
    } else if (platform === 'youtube') {
      const track = await Track.create(link, requester);
      tracks.push(track);
    }

    // Add all tracks to the queue
    this.queue.push(...tracks);
    log(`${tracks.length} tracks pushed to the queue!`, logLevel.Debug);

    // Download the next tracks in the queue
    await this.downloadNextTracks();

    return `Successfully added ${tracks.length} tracks to the queue!`;
  }

  async downloadNextTracks() {
    // Get the next tracks in the queue
    const nextTracks = this.queue.slice(0, 3);

    // Download the tracks if they haven't been downloaded yet
    log(
      `Downloading next tracks: ${nextTracks.map((track) => track.name).join(', ')}`,
      logLevel.Debug
    );
    for (const track of nextTracks) {
      if (track.downloadStatus === 'not_started') {
        await track.download();
      }
    }
  }

  skip(num: number = 1) {
    let player = Player.getPlayer(this.guildId);

    if (this.queue.length === 0) {
      return 'The queue is empty.';
    }

    if (num >= this.queue.length) {
      return 'The number of tracks to skip is more than the length of the queue.';
    }

    for (let i = 0; i < num; i++) {
      this.queue.shift();
    }

    player.stop();
    player.play();

    this.downloadNextTracks();
    return `Successfully skipped ${num} track(s)!`;
  }

  //get current track
  getCurrentTrack() {
    if (this.queue.length === 0) {
      return 'The queue is empty.';
    }

    return this.queue[0];
  }
  getFormattedQueue() {
    if (this.queue.length === 0) {
      return 'The queue is currently empty!';
    }

    let formattedQueue = this.queue
      .slice(0, 15)
      .map(
        (track, index) =>
          ` - [${track.name} - ${track.artists}](${track.link}) (${track.requester})`
      )
      .join('\n');

    if (this.queue.length > 15) {
      formattedQueue += `\n... ${this.queue.length - 15} more`;
    }

    return formattedQueue;
  }
}

export const queues: { [guildId: string]: Queue } = {};

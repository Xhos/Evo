import { Track } from './track';

export class Queue {
  queue: Track[];
  guildId: string;

  constructor(guildId: string) {
    this.guildId = guildId;
    this.queue = [];
  }

  async add(link: string, requester: string) {
    const track = await Track.linkToName(link, requester);
    this.queue.push(track);
    return `Successfully added ${track.name} to the queue!`;
  }

  skip(num: number = 1) {
    if (this.queue.length === 0) {
      return 'The queue is empty.';
    }

    if (num >= this.queue.length) {
      return 'The number of tracks to skip is more than the length of the queue.';
    }

    for (let i = 0; i < num; i++) {
      this.queue.shift();
    }

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

import { exec } from 'child_process';
import path from 'path';
import ytdl from 'ytdl-core';
import spotifyApi from './spotify';
import { logLevel, log } from '../utils/log';
import searchYT from './youtube';
import fs from 'fs';
import db from './db';

export class Track {
  public createdAt: Date;

  constructor(
    public link: string,
    public requester: string,
    public name: string = '',
    public artists: string = '',
    public platform: string = '',
    public path: string = '',
    public downloadLink: string = '',
    public downloadStatus: 'not_started' | 'downloading' | 'downloaded' = 'not_started'
  ) {
    this.createdAt = new Date();
  }

  static async create(link: string, requester: string) {
    const track = new Track(link, requester);
    await track.initialize();
    return track;
  }

  async initialize() {
    if (this.link.includes('youtube.com') || this.link.includes('youtu.be')) {
      await this.getYoutubeTitle();
      this.platform = 'youtube';
      this.downloadLink = this.link;
    } else if (this.link.includes('spotify.com')) {
      this.platform = 'spotify';
      const trackId = this.link.split('track/')[1].split('?')[0];
      const data = await spotifyApi.getTrack(trackId);
      const artists = data.body.artists.map((artist) => artist.name).join(', ');
      this.artists = artists;
      this.name = data.body.name;
      // await this.getDownloadLink();
    } else {
      throw new Error('Invalid link: platform could not be determined');
    }
  }

  async getDownloadLink() {
    const query = `${this.name} - ${this.artists}`;
    this.downloadLink = await searchYT(query);
  }

  async getYoutubeTitle() {
    const info = await ytdl.getInfo(this.downloadLink);
    this.name = info.videoDetails.title;
  }

  static async getTracksFromPlaylist(playlistId: string) {
    const data = await spotifyApi.getPlaylistTracks(playlistId);
    const tracks = data.body.items.map((item) => item.track);
    return tracks;
  }

  static async getTracksFromAlbum(albumId: string) {
    const data = await spotifyApi.getAlbumTracks(albumId);
    const tracks = data.body.items;
    return tracks;
  }

  async download() {
    if (this.downloadStatus === 'downloading') {
      log(`Track is already being downloaded: ${this.name} - ${this.artists}`, logLevel.Debug);
      return;
    }

    if (this.name === '') {
      log('Track name does not exist', logLevel.Error);
      return;
    }

    log(`Downloading track: ${this.name} - ${this.artists}`, logLevel.Debug);
    const filePath = path.join(
      __dirname,
      '..',
      'temp',
      `${this.name.replace(/[\\/:*?"<>|]/g, '')} - ${this.artists}.mp3`
    );

    this.path = filePath;

    if (fs.existsSync(filePath)) {
      log(`Track already downloaded: ${this.name} - ${this.artists}`, logLevel.Debug);
      this.downloadStatus = 'downloaded';
      return;
    }

    // if (this.downloadLink === '') {
    //   log('Track download link does not exist', logLevel.Error);
    // }

    // const command = `ydl.exe -f bestaudio "${this.downloadLink}" -o "${filePath}"`;
    const command = `ydl.exe -f bestaudio -o "${filePath}" "ytsearch:${this.name} - ${this.artists}"`;
    log(`Command: ${command}`, logLevel.Debug);

    this.downloadStatus = 'downloading';
    try {
      await new Promise((resolve, reject) => {
        exec(command, (error: any, stdout: string, stderr: string) => {
          if (error) {
            log(`Error downloading track: ${error.message}`, logLevel.Error);
            reject(error);
            return;
          }

          if (stderr) {
            log(`Error downloading track: ${stderr}`, logLevel.Error);
            reject(new Error(stderr));
            return;
          }

          log(`Track downloaded: ${stdout}`);
          resolve(stdout);
        });
      });

      this.downloadStatus = 'downloaded';
      this.saveToFirestore();
    } catch (error: any) {
      log(`Error downloading track: ${error.message}`, logLevel.Error);
    } finally {
      if (this.downloadStatus === 'downloading') {
        this.downloadStatus = 'not_started';
      }
    }
  }

  async saveToFirestore() {
    try {
      const docRef = db.collection('tracks').doc('tracks');
      await docRef.set({
        link: this.link,
        requester: this.requester,
        name: this.name,
        artists: this.artists,
        platform: this.platform,
        path: this.path,
        downloadLink: this.downloadLink,
        downloadStatus: this.downloadStatus,
        createdAt: this.createdAt,
      });
      log('Track saved to Firestore');
    } catch (error) {
      log('Error saving track to Firestore', logLevel.Error);
    }
  }
}

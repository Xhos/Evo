import { exec } from 'child_process';
import path from 'path';
require('dotenv').config();
const SpotifyWebApi = require('spotify-web-api-node');
const ytdl = require('ytdl-core');

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_ID,
  clientSecret: process.env.SPOTIFY_SECRET,
});

export class Track {
  name: string;
  artists: string;
  link: string;
  platfotm: string;
  requester: string;
  path: string;

  constructor(
    name: string,
    artists: string,
    link: string,
    platfotm: string,
    requester: string,
    path: string
  ) {
    this.name = name;
    this.artists = artists;
    this.link = link;
    this.platfotm = platfotm;
    this.requester = requester;
    this.path = path;
  }

  async download() {
    const filePath = path.join(
      __dirname,
      '..',
      'temp',
      `${this.name.replace(/[\\/:*?"<>|]/g, '')}.mp3`
    );

    this.path = filePath;

    let command;
    if (this.link.includes('youtube.com') || this.link.includes('youtu.be')) {
      command = `ydl.exe -f bestaudio "${this.link}" -o "${filePath}"`;
    } else {
      command = `ydl.exe --default-search "ytsearch" -f bestaudio "${this.name} - ${this.artists}" -o "${filePath}"`;
    }

    try {
      exec(command, (error: any, stdout: string, stderr: string) => {
        if (error) {
          console.error(`Error downloading track: ${error.message}`);
          return;
        }

        if (stderr) {
          console.error(`Error downloading track: ${stderr}`);
          return;
        }

        console.log(`Track downloaded: ${stdout}`);
      });
    } catch (error: any) {
      console.error(`Error downloading track: ${error.message}`);
    }
  }

  static async linkToName(link: string, requester: string) {
    console.log(`Getting name from link: ${link}`);

    try {
      switch (true) {
        // youtube
        case /youtube\.com|youtu\.be/.test(link):
          const videoId = link.split('v=').pop();
          const video = await ytdl.getBasicInfo(videoId);

          return new Track(
            video.videoDetails.title.replace(/[\\/:*?"<>|]/g, ''),
            '',
            link,
            'youtube',
            requester,
            ''
          );

        // spotify
        case /spotify\.com/.test(link):
          const data = await spotifyApi.clientCredentialsGrant();
          spotifyApi.setAccessToken(data.body['access_token']);

          let type;
          if (link.includes('playlist')) {
            type = 'playlist';
          } else if (link.includes('album')) {
            type = 'album';
          } else {
            type = 'track';
          }

          let id = link.split('/').pop();
          if (id) {
            id = id.split('?')[0]; // remove any parameters
          } else {
            throw new Error('Invalid link: id could not be extracted');
          }

          // spotify playlist
          if (type === 'playlist') {
            const response = await spotifyApi.getPlaylist(id);
            return response.body.tracks.items.map((item: any) => {
              const artists = item.track.artists
                .map((artist: any) => artist.name)
                .join(', ');

              return new Track(
                item.track.name, // remove invalid characters from track name
                artists,
                link,
                'spotify',
                requester,
                ''
              );
            });
          } else if (type === 'album') {
            // spotify album
            const response = await spotifyApi.getAlbum(id);
            return response.body.tracks.items.map((item: any) => {
              const artists = item.artists
                .map((artist: any) => artist.name)
                .join(', ');

              return new Track(
                item.name, // remove invalid characters from track name
                artists,
                link,
                'spotify',
                requester,
                ''
              );
            });
          } else {
            // spotify track
            const response = await spotifyApi.getTrack(id);
            const artists = response.body.artists
              .map((artist: any) => artist.name)
              .join(', ');

            return new Track(
              response.body.name, // remove invalid characters from track name
              artists,
              link,
              'spotify',
              requester,
              ''
            );
          }
        default:
          return new Track(
            '', // remove invalid characters from track name
            '',
            link,
            'search',
            requester,
            ''
          );
      }
    } catch (error) {
      console.error(`Error getting the track from link: ${error}`);
    }
  }
}

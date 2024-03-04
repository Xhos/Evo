import { exec } from 'child_process';
import path from 'path';
import ytdl from 'ytdl-core';
import yts from 'yt-search';
import spotifyApi from './spotify';
import { logLevel, log } from '../utils/log';

export class Track {
  constructor(
    public link: string,
    public requester: string,
    public name: string = '',
    public artists: string = '',
    public platform: string = '',
    public path: string = '',
    public downloadLink: string = '',
    public downloaded: boolean = false
  ) {
    this.initialize();
  }

  async initialize() {
    if (this.link.includes('youtube.com') || this.link.includes('youtu.be')) {
      await this.getYoutubeTitle();
      this.platform = 'youtube';
      this.downloadLink = this.link;
    } else if (this.link.includes('spotify.com')) {
      this.platform = 'spotify';
      const data = await spotifyApi.getTrack(this.link);
      const artists = data.body.artists.map((artist) => artist.name).join(', ');
      this.artists = artists;
      this.name = data.body.name;

      this.downloadLink;
    } else {
      throw new Error('Invalid link: platform could not be determined');
    }
  }

  async getDownloadLink() {
    const query = `${this.name} - ${this.artists}`;
    const result = await yts.search(query);
    if (result.videos.length > 0) {
      this.downloadLink = result.videos[0].url;
    } else {
      throw new Error(`No YouTube videos found for query: ${query}`);
    }
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

  async getSpotifyTitle() {}

  async download() {
    if (this.downloaded) {
      log(`Track already downloaded: ${this.name} - ${this.artists}`, logLevel.Debug);
      return;
    }

    log('Getting download link..', logLevel.Debug);
    await this.getDownloadLink();

    log(`Downloading track: ${this.name} - ${this.artists}`, logLevel.Debug);
    const filePath = path.join(__dirname, '..', 'temp', `${this.name.replace(/[\\/:*?"<>|]/g, '')}.mp3`);

    this.path = filePath;

    const command = `ydl.exe -f bestaudio "${this.downloadLink}" -o "${filePath}"`;

    try {
      exec(command, (error: any, stdout: string, stderr: string) => {
        if (error) {
          log(`Error downloading track: ${error.message}`, logLevel.Error);
          return;
        }

        if (stderr) {
          log(`Error downloading track: ${stderr}`, logLevel.Error);
          return;
        }

        log(`Track downloaded: ${stdout}`);
        this.downloaded = true;
      });
    } catch (error: any) {
      log(`Error downloading track: ${error.message}`, logLevel.Error);
    }
  }

  // async download() {
  //   if (this.platform === 'spotify' && this.link.includes('playlist')) {
  //     log(`Downloading playlist: ${this.link}`, logLevel.Debug);
  //     // Extract the playlist id from the link
  //     let id = this.link.split('/').pop();
  //     if (id) {
  //       id = id.split('?')[0]; // remove any parameters
  //     } else {
  //       throw new Error('Invalid link: id could not be extracted');
  //     }

  //     // Download all tracks in the playlist
  //     const response = await spotifyApi.getPlaylist(id);
  //     const tracks = response.body.tracks.items;
  //     if (!tracks) {
  //       throw new Error('Invalid link: no tracks found in playlist');
  //     }
  //     for (const item of tracks) {
  //       if (item.track) {
  //         const track = new Track(
  //           item.track.name,
  //           item.track.artists.map((artist: any) => artist.name).join(', '),
  //           this.link,
  //           'spotify',
  //           this.requester,
  //           '',
  //           ''
  //         );
  //         await track.download();
  //       }
  //     }
  //   } else {
  //     log(`Downloading track: ${this.name} - ${this.artists}`, logLevel.Debug);
  //     const filePath = path.join(__dirname, '..', 'temp', `${this.name.replace(/[\\/:*?"<>|]/g, '')}.mp3`);

  //     this.path = filePath;

  //     let command;
  //     if (this.link.includes('youtube.com') || this.link.includes('youtu.be')) {
  //       command = `ydl.exe -f bestaudio "${this.link}" -o "${filePath}"`;
  //     } else {
  //       command = `ydl.exe --default-search "ytsearch" -f bestaudio "${this.name} - ${this.artists}" -o "${filePath}"`;
  //     }

  //     try {
  //       exec(command, (error: any, stdout: string, stderr: string) => {
  //         if (error) {
  //           log(`Error downloading track: ${error.message}`, logLevel.Error);
  //           return;
  //         }

  //         if (stderr) {
  //           log(`Error downloading track: ${stderr}`, logLevel.Error);
  //           return;
  //         }

  //         log(`Track downloaded: ${stdout}`);
  //       });
  //     } catch (error: any) {
  //       log(`Error downloading track: ${error.message}`, logLevel.Error);
  //     }
  //   }
  // }

  // static async linkToName(link: string, requester: string) {
  //   log(`Getting name from link: ${link}`, logLevel.Debug);

  //   try {
  //     if (/youtube\.com|youtu\.be/.test(link)) {
  //       return await this.getYoutubeTrackName(link, requester);
  //     } else if (/spotify\.com/.test(link)) {
  //       return await this.getSpotifyTrack(link, requester);
  //     } else {
  //       return new Track('', '', link, 'search', requester, '', '');
  //     }
  //   } catch (error) {
  //     log(`Error getting the track from link: ${error}`, logLevel.Error);
  //   }
  // }

  // static async getYoutubeTrackName(link: string, requester: string) {
  //   const videoId = link.split('v=').pop();
  //   if (!videoId) {
  //     throw new Error('Invalid YouTube link: videoId could not be extracted');
  //   }
  //   const video = await ytdl.getBasicInfo(videoId);

  //   return new Track(video.videoDetails.title.replace(/[\\/:*?"<>|]/g, ''), '', link, 'youtube', requester, '', '');
  // }

  // static async getSpotifyTrack(link: string, requester: string) {
  //   const data = await spotifyApi.clientCredentialsGrant();
  //   spotifyApi.setAccessToken(data.body['access_token']);

  //   let id = link.split('/').pop();
  //   if (id) {
  //     id = id.split('?')[0]; // remove any parameters
  //   } else {
  //     throw new Error('Invalid link: id could not be extracted');
  //   }

  //   if (link.includes('playlist')) {
  //     return new Track('', '', link, 'spotify', requester, '', '');
  //   } else if (link.includes('album')) {
  //     return await this.getSpotifyAlbumTracks(id, link, requester);
  //   } else {
  //     return await this.getSpotifySingleTrack(id, link, requester);
  //   }
  // }
}

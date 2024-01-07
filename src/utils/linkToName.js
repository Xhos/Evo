require('dotenv').config();
const SpotifyWebApi = require('spotify-web-api-node');
const ytdl = require('ytdl-core');

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_ID,
  clientSecret: process.env.SPOTIFY_SECRET,
});

async function linkToName(link) {
  console.log(`Getting name from link: ${link}`);
  try {
    // youtube
    if (link.includes('youtube.com') || link.includes('youtu.be')) {
      const videoId = link.split('v=').pop();
      const video = await ytdl.getBasicInfo(videoId);

      return {
        name: video.videoDetails.title.replace(/[\\/:*?"<>|]/g, ''), // remove invalid characters from track name;
        artists: "",
        link: link
      };

    // spotify
    } else if (link.includes('spotify.com')) {
      const data = await spotifyApi.clientCredentialsGrant();
      spotifyApi.setAccessToken(data.body['access_token']);

      const type = link.includes('playlist') ? 'playlist' : 'track';
      let id = link.split('/').pop();
      id = id.split('?')[0]; // remove any parameters

      // spotify playlist
      if (type === 'playlist') {
        const response = await spotifyApi.getPlaylist(id);
        return response.body.tracks.items.map(item => {
          const artists = item.track.artists.map(artist => artist.name).join(', ');

          return {
            name: item.track.name.replace(/[\\/:*?"<>|]/g, ''), // remove invalid characters from track name
            artists: artists.replace(/[\\/:*?"<>|]/g, ''),
            link: link
          };
        });

      } else {
        // spotify track
        const response = await spotifyApi.getTrack(id);
        const artists = response.body.artists.map(artist => artist.name).join(', ');

        return {
          name: response.body.name.replace(/[\\/:*?"<>|]/g, ''), // remove invalid characters from track name
          artists: artists.replace(/[\\/:*?"<>|]/g, ''),
          link: link
        };
      }
    } else {
      return {
        name: link // remove invalid characters from track name
      };
    }
  } catch (error) {
    console.error(`Error getting name from link: ${error}`);
  }
}

module.exports = linkToName;
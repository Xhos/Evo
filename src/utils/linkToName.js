require('dotenv').config();
const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_ID,
  clientSecret: process.env.SPOTIFY_SECRET,
});

async function linkToName(link) {
    try {
      const data = await spotifyApi.clientCredentialsGrant();
      spotifyApi.setAccessToken(data.body['access_token']);
  
      const type = link.includes('playlist') ? 'playlist' : 'track';
      const id = link.split('/').pop();
  
      if (type === 'playlist') {
        const response = await spotifyApi.getPlaylist(id);
        return response.body.tracks.items.map(item => {
          const artists = item.track.artists.map(artist => artist.name).join(', ');
          const trackName = `${artists} - ${item.track.name}`;
          // Remove invalid characters from track name
          return trackName.replace(/[\\/:*?"<>|]/g, '');
        });
      } else {
        const response = await spotifyApi.getTrack(id);
        const artists = response.body.artists.map(artist => artist.name).join(', ');
        const trackName = `${artists} - ${response.body.name}`;
        // Remove invalid characters from track name
        return trackName.replace(/[\\/:*?"<>|]/g, '');
      }
    } catch (error) {
      console.error(`Error getting name from link: ${error}`);
    }
  }

module.exports = linkToName;
import SpotifyWebApi from 'spotify-web-api-node';
import { log, logLevel } from './log';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_ID,
  clientSecret: process.env.SPOTIFY_SECRET,
});

async function initializeSpotifyApi() {
  try {
    const data: any = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);
  } catch (err) {
    log(`Something went wrong when retrieving an access token for Spotify API: ${err}`, logLevel.Error);
  }
}

initializeSpotifyApi();

export default spotifyApi;

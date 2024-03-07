import SpotifyWebApi from 'spotify-web-api-node';
import { log, logLevel } from './log';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_ID,
  clientSecret: process.env.SPOTIFY_SECRET,
});

async function initializeSpotifyApi() {
  try {
    const data: any = await spotifyApi.clientCredentialsGrant();
    log('The token expires in ' + data.body['expires_in'], logLevel.Debug);
    log('The access token is ' + data.body['access_token'], logLevel.Debug);
    spotifyApi.setAccessToken(data.body['access_token']);
  } catch (err) {
    log(`Something went wrong when retrieving an access token for Spotify API: ${err}`, logLevel.Error);
  }
}

async function testConnection(trackId: string) {
  try {
    const response = await spotifyApi.getTrack(trackId);
    log(response.body.name, logLevel.Debug);
  } catch (error) {
    log(`Error occurred while fetching track details: ${error}`, logLevel.Error);
  }
}

(async () => {
  try {
    await initializeSpotifyApi();
    await testConnection('0YJ9FWWHn9EfnN0lHwbzvV');
    log('Spotify API connection initialized', logLevel.Info);
  } catch (error) {
    log(`Error initializing Spotify API connection: ${error}`, logLevel.Error);
  }
})();

export default spotifyApi;

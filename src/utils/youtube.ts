import https from 'https';
import { log, logLevel } from './log';

async function searchYT(query: string): Promise<string> {
  log(`Searching for video: ${query}`, logLevel.Debug);
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      hostname: 'www.googleapis.com',
      port: null,
      path: `/youtube/v3/search?key=${process.env.YT_TOKEN}&q=${encodeURIComponent(query)}&maxResults=1&type=video`,
      headers: {
        'User-Agent': 'insomnia/8.6.1',
        'Content-Length': '0',
      },
    };

    log(`Sending request: ${JSON.stringify(options)}`, logLevel.Debug);

    const req = https.request(options, (res) => {
      const chunks: any[] = [];

      res.on('data', (chunk: any) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        const body = Buffer.concat(chunks);
        const response = JSON.parse(body.toString());
        if (response.items && response.items.length > 0) {
          const videoUrl = `https://www.youtube.com/watch?v=${response.items[0].id.videoId}`;
          log(`Found video: ${videoUrl}`, logLevel.Debug);
          resolve(videoUrl);
        } else {
          reject(new Error('No videos found'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

export default searchYT;

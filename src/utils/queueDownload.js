const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

// Convert exec to a function that returns a promise
const execPromise = util.promisify(exec);

async function queueDownload(queue) {
  console.log(typeof queue);
  if (typeof queue === 'string') {
    // If it's a string, convert it to an array
    queue = [queue];
  }
  // Make a copy of the queue array
  const queueCopy = [...queue];
  for (const track of queueCopy) {
    // Skip if the track name is empty or null
    if (!track.name) {
      continue;
    }
    console.log(queue);
    // Construct the file path
    const filePath = path.join(__dirname, '..', 'temp', `${track.name}.mp3`);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      // If the file does not exist, download it

      // if link is a youtube link, use ytdl do download by link
      let command;
      if (track.link.includes('youtube.com') || track.link.includes('youtu.be')) {
        command = `ydl.exe -f bestaudio "${track.link}" -o "${filePath}"`;
      } else {
        command = `ydl.exe --default-search "ytsearch" -f bestaudio "${track.name} - ${track.artists}" -o "${filePath}"`;
      }
      

      try {
        // Execute the command and wait for it to finish
        const { stdout, stderr } = await execPromise(command);

        if (stderr) {
          console.error(`Error downloading track: ${stderr}`);
          return;
        }

        console.log(`Track downloaded: ${stdout}`);
      } catch (error) {
        console.error(`Error downloading track: ${error.message}`);
      }
    }
  }
}

module.exports = queueDownload;
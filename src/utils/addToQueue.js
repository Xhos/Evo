const linkToName = require('./linkToName');

let queue = [];

async function addToQueue(link, requester) {
  const trackInfo = await linkToName(link);
  console.log(trackInfo);
  if (Array.isArray(trackInfo)) {
    queue.push(...trackInfo.map(info => ({...info, requester: requester})));
  } else {
    queue.push({name: trackInfo.name, artists: trackInfo.artists, link: trackInfo.link, requester: requester});
  }
}

module.exports = {
  addToQueue,
  queue,
};
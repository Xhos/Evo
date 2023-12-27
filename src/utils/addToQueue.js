const linkToName = require('./linkToName');

let queue = [];

async function addToQueue(link) {
  const names = await linkToName(link);
  console.log(names);
  if (Array.isArray(names)) {
    queue.push(...names);
  } else {
    queue.push(names);
  }
}

module.exports = {
  addToQueue,
  queue,
};
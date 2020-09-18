const { default: PQueue } = require('p-queue');
const isomorphic = require('./isomorphic.js');
const name = 'video-tools';

const { map: commands } = require('video-tools');

const videoQueue = new PQueue({ concurrency: 1 });

const exec = async (command, args) => {
  if (!commands[command]) {
    throw new Error(`"${command}" is not a know command`);
  }

  return commands[command](...args);
};

const queue = async (command, args) => {
  return await videoQueue.add(() => exec(command, args));
};

const implementation = { queue, exec };

module.exports = isomorphic({ name, implementation });

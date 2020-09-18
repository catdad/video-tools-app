const isomorphic = require('./isomorphic.js');
const name = 'video-tools';

const { map: commands } = require('video-tools');

const implementation = {
  async exec(command, args) {
    if (!commands[command]) {
      throw new Error(`"${command}" is not a know command`);
    }

    return commands[command](...args);
  }
};

module.exports = isomorphic({ name, implementation });

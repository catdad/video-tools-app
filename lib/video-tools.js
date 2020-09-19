const through = require('through2');
const progressStream = require('ffmpeg-progress-stream');
const { default: PQueue } = require('p-queue');

const progress = require('./progress.js');
const isomorphic = require('./isomorphic.js');
const name = 'video-tools';

const { map: commands } = require('video-tools');

const videoQueue = new PQueue({ concurrency: 1 });

const getFrames = async (command, args) => {
  if (['container', 'x264'].includes(command)) {
    const meta = await commands.meta(...args);
    return Number(meta.video.nb_frames);
  }

  return 0;
};

const exec = async (command, args, { frames = 0 } = {}) => {
  if (!commands[command]) {
    throw new Error(`"${command}" is not a know command`);
  }

  if (['container', 'x264'].includes(command) && frames) {
    let current = 0;

    const stderr = through();
    args[0] = args[0] || {};
    args[0].stderr = stderr;

    stderr.pipe(progressStream(frames))
      .on('data', info => {
        const frame = Number(info.frame);

        progress.tick(frame - current);
        current = frame;
      });
  }

  return commands[command](...args);
};

const queue = async (command, args) => {
  const frames = await getFrames(command, args);
  progress.init(frames);

  return await videoQueue.add(() => exec(command, args, { frames }));
};

const implementation = { queue, exec };

module.exports = isomorphic({ name, implementation });

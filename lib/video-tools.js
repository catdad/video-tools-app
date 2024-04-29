const through = require('through2');
const progressStream = require('ffmpeg-progress-stream');
const { default: PQueue } = require('p-queue');
const { get } = require('lodash');

const isomorphic = require('./isomorphic.js');
const name = 'video-tools';

const { map: commands, SYMBOL_RETURN_STDOUT } = require('video-tools');

const videoQueue = new PQueue({ concurrency: 1 });
const taskInfo = { current: 0, total: 0, taskCount: 0, remainingCount: 0 };

const resetStdio = () => {
  // for some reason, ffmpeg sometimes turns the terminal blue
  // and I can't get it to stop even when I try stripping all style characters
  // so at least reset the terminal back to normal once ffmpeg is done
  process.stdout.write('\x1b[0m');
  process.stderr.write('\x1b[0m');
};

// do this on startup, for development purposes
resetStdio();

// self-flushing stream that also resets the terminal each time
const cleanStream = (iostream) => through((chunk, enc, cb) => {
  iostream.write(chunk);
  resetStdio();
  cb();
});

const getFrames = async (args) => {
  const meta = await commands.meta(...args);
  return Number(get(meta, 'video.nb_frames') || get(meta, 'video.tags.NUMBER_OF_FRAMES') || 0);
};

const exec = async (command, args, { debug = false, frames = 0, onUpdate = () => {} } = {}) => {
  if (!commands[command]) {
    throw new Error(`"${command}" is not a know command`);
  }

  args[0] = args[0] || {};

  if (['container', 'x264'].includes(command) && frames) {
    const debug = get(args, '0.debug') || get(args, '0.dry');

    const stderr = through((chunk, enc, cb) => {
      if (debug) {
        process.stderr.write(chunk);
      }

      resetStdio();

      cb(null, chunk);
    });

    args[0].stderr = stderr;
    args[0].stdout = cleanStream(process.stdout);

    delete args[0].debug;

    stderr.pipe(progressStream(frames))
      .on('data', info => {
        const frame = Number(info.frame);
        onUpdate(frame);
      });
  } else if (command === 'desktop') {
    const stdin = through();

    args[0].stdin = stdin;
    args[0].stdout = cleanStream(process.stdout);
    args[0].stderr = cleanStream(process.stderr);

    // for now, automatically stop video after 10 seconds
    setTimeout(() => {
      resetStdio();
      stdin.write('q');
      stdin.end();
    }, 20 * 1000);
  } else if (debug) {
    args[0].stdout = cleanStream(process.stdout);
    args[0].stderr = cleanStream(process.stderr);
  }

  if (args && args[0] && args[0].output === '-') {
    args[0].output = SYMBOL_RETURN_STDOUT;
  }

  return await (commands[command](...args).finally(() => {
    resetStdio();
  }));
};

const queue = async (command, args) => {
  const frames = await getFrames(args);

  const onUpdate = frame => {
    taskInfo.current = frame;
    taskInfo.total = frames;
  };

  taskInfo.taskCount += 1;
  taskInfo.remainingCount += 1;

  return await videoQueue.add(() => exec(command, args, { frames, onUpdate })).finally(() => {
    taskInfo.remainingCount -= 1;
  });
};

const queueInspect = async () => {
  const {
    current: taskCurrent, total: taskTotal
  } = taskInfo;

  return { taskCurrent, taskTotal };
};

const implementation = { queue, exec, queueInspect, getFrames };

module.exports = isomorphic({ name, implementation });

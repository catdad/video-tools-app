const through = require('through2');
const progressStream = require('ffmpeg-progress-stream');
const { default: PQueue } = require('p-queue');

const progress = require('./progress.js');
const isomorphic = require('./isomorphic.js');
const name = 'video-tools';

const { map: commands, SYMBOL_RETURN_STDOUT } = require('video-tools');

const videoQueue = new PQueue({ concurrency: 1 });
const taskInfo = { current: 0, total: 0, taskCount: 0, remainingCount: 0 };

const _getFrames = async (command, args) => {
  if (['container', 'x264'].includes(command)) {
    const meta = await commands.meta(...args);
    return Number(meta.video.nb_frames);
  }

  return 0;
};

const getFrames = async (args) => {
  const meta = await commands.meta(...args);
  return Number(meta.video.nb_frames);
};

const exec = async (command, args, { debug = false, frames = 0, onUpdate = () => {} } = {}) => {
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

        onUpdate(frame);

        progress.tick(frame - current);
        current = frame;
      });
  } else if (debug) {
    args[0] = args[0] || {};
    args[0].stderr = process.stderr;
  }

  if (args && args[0] && args[0].output === '-') {
    args[0].output = SYMBOL_RETURN_STDOUT;
  }

  return await commands[command](...args);
};

const queue = async (command, args) => {
  const frames = await _getFrames(command, args);
  progress.init(frames);

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
  const { current: progressCurrent, total: progressTotal } = await progress.inspect();
  const {
    current: taskCurrent, total: taskTotal,
    remainingCount: remainingTasks, taskCount: totalTasks
  } = taskInfo;

  return {
    progressCurrent, progressTotal,
    taskCurrent, taskTotal,
    remainingTasks, totalTasks
  };
};

const implementation = { queue, exec, queueInspect, getFrames };

module.exports = isomorphic({ name, implementation });

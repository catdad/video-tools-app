const {
  html, css,
  createContext, useContext, useEffect,
  useSignal, effect, batch
} = require('../tools/ui.js');

const videoTools = require('../../lib/video-tools.js');
const windowProgress = require('../../lib/progress.js');
const toast = require('../tools/toast.js');

css('./Queue.css');

const QueueContext = createContext({});

const withQueue = Component => ({ children, ...props }) => {
  const items = useSignal([]);
  const current = useSignal(null);
  const totalFrames = useSignal(0);
  const completeFrames = useSignal(0);

  function add(...newItems) {
    (async () => {
      let newFrames = 0;

      for (const item of newItems) {
        try {
          const frames = await videoTools.getFrames(item.args);
          item.frames = frames;
          newFrames += frames;
        } catch (e) {
          console.error('failed to get frames for', item.filename, e);
          item.frames = 0;
        }
      }

      batch(() => {
        items.value = [...items.value, ...newItems];
        totalFrames.value += newFrames;
      });
    })();
  }

  // reset frame counters when all tasks are complete
  effect(() => {
    if (!current.value && items.value.length === 0) {
      batch(() => {
        totalFrames.value = 0;
        completeFrames.value = 0;
      });
    }
  });

  // manage tasks inside the queue
  effect(() => {
    items.value;
    current.value;

    if (current.value) {
      return;
    }

    if (!items.value.length) {
      return;
    }

    // we have queue items and the queue is not currently running,
    // so start something

    batch(() => {
      const [item, ...rest] = items.value;
      const { command, args, filename, frames } = item;

      toast.info(`"${filename}" is starting...`);

      batch(() => {
        items.value = rest;
        current.value = filename;
      });

      Promise.resolve().then(async () => {
        try {
          await videoTools.queue(command, args);
          toast.success(`"${filename}" is complete`);
        } catch (err) {
          console.error('task failed', filename, err);
          toast.error(`"${filename}" failed:\n${err.message}`);
        } finally {
          batch(() => {
            current.value = null;
            completeFrames.value += frames;
          });
        }
      });
    });
  });

  const api = {
    add,
    items,
    current,
    completeFrames,
    totalFrames
  };

  return html`
    <${QueueContext.Provider} value=${api}>
      <${Component} ...${props}>${children}<//>
    <//>
  `;
};

const useQueue = () => {
  return useContext(QueueContext);
};

const Break = () => html`<span>\u00A0|\u00A0<//>`;

const Modal = ({ children }) => {
  return html`<div class=modal>${children}<//>`;
};

const QueueModal = () => {
  const { items, current } = useQueue();

  const currentText = html`<p>
    <div>Currently working on:<//>
    <div>${current.value}<//>
  </p>`;

  const queueText = items.value.length ?
    html`<p>Up next:</p>
    <ol>
      ${items.value.map(item => html`<li>${item.filename}<//>`)}
    </ol>` :
    html`<p>Nothing is queued up after that.<//>`;

  return html`<div class=modal>
    ${currentText}
    ${queueText}
  <//>`;
};

const Queue = () => {
  const { items, current, completeFrames, totalFrames } = useQueue();
  const progress = useSignal(undefined);
  const showTasks = useSignal(false);

  useEffect(() => {
    if (!current.value) {
      return;
    }

    const t = setInterval(() => {
      videoTools.queueInspect().then(result => {
        progress.value = { ...result };
      }).catch(err => {
        // TODO umm?
        console.error('failed to get progress:', err);
      });
    }, 1000);

    return () => {
      clearInterval(t);
    };
  }, [current.value]);

  effect(() => {
    if (items.value.length === 0 && !current.value) {
      progress.value = null;
      windowProgress.clear();
    }
  });

  // don't render this component if nothing is being processed
  if (!progress.value) {
    return html`<div class=queue onclick=${() => (showTasks.value = !showTasks.value)}>
      <span>You are doing such a good job</span>
      ${showTasks.value ? html`<${Modal}>
        <div>This is where queued videos will appear<//>
      <//>` : null}
    <//>`;
  }

  const {
    taskCurrent, taskTotal
  } = progress.value;

  const progressFrames = completeFrames.value + taskCurrent;
  const progressRatio = progressFrames / totalFrames.value;
  const progressPercent = Math.floor(progressRatio * 100);
  const currentPercent = Math.floor(taskCurrent / taskTotal * 100);

  windowProgress.set(progressRatio);

  return html`<div class=queue onclick=${() => (showTasks.value = !showTasks.value)}>
    <span>Overall: ${progressPercent}% (${progressFrames}/${totalFrames.value})<//>
    <${Break} />
    <span>Current: ${currentPercent}% (${taskCurrent}/${taskTotal})<//>
    <${Break} />
    <span>Tasks: ${items.value.length + 1}<//>
    ${showTasks.value ? html`<${QueueModal} />` : null}
  <//>`;
};

module.exports = {
  Queue,
  withQueue,
  useQueue
};

const { html, css, createContext, useContext, useEffect,
  useSignal, effect, batch
} = require('../tools/ui.js');

const videoTools = require('../../lib/video-tools.js');
const toast = require('../tools/toast.js');

css('./Queue.css');

const QueueContext = createContext({});

const withQueue = Component => ({ children, ...props }) => {
  const items = useSignal([]);
  const current = useSignal(null);

  effect(() => {
    items.value;
    current.value;

    console.log('QUEUE: something changed', items.value, current.value);

    if (current.value) {
      return;
    }

    if (!items.value.length) {
      return;
    }

    console.log('QUEUE: about to run a task');

    // we have queue items and the queue is not currently running,
    // so start something

    batch(() => {
      const [{ command, args, filename }, ...rest] = items.value;
      items.value = rest;

      toast.info(`"${filename}" is starting...`);

      current.value = filename;

      videoTools.queue(command, args).then(() => {
        toast.success(`"${filename}" is complete`);
      }).catch(err => {
        toast.error(`"${filename}" failed:\n${err.message}`);
      }).finally(() => {
        current.value = null;
      });
    });
  });

  const api = {
    items,
    current
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

const Queue = () => {
  const { items, current } = useQueue();
  const progress = useSignal(undefined);

  useEffect(() => {
    if (!current.value) {
      return;
    }

    const t = setInterval(() => {
      videoTools.queueInspect().then(result => {
        console.log(result);

        if (result.progressTotal === 0) {
          progress.value = undefined;
          return;
        }

        progress.value = { ...result };
      }).catch(err => {
        // TODO umm?
        console.error('failed to get progress:', err);

        // set a value different from the current in order
        // to trigger a refetch
        progress.value = Math.random();
      });
    }, 1000);

    return () => {
      clearInterval(t);
    };
  }, [current.value]);

  if (['undefined', 'number'].includes(typeof progress.value)) {
    return;
  }

  const {
    progressCurrent, progressTotal,
    taskCurrent, taskTotal,
    remainingTasks, totalTasks
  } = progress.value;

  return html`<div class=queue>
    <span>Overall: ${Math.round(progressCurrent / progressTotal * 100)}% - (${progressCurrent}/${progressTotal})<//>
    <${Break} />
    <span>Current: ${Math.round(taskCurrent / taskTotal * 100)}% - (${taskCurrent}/${taskTotal})<//>
    <${Break} />
    <span>Tasks: ${remainingTasks} of ${totalTasks}<//>
    <${Break} />
    <span>Local items: ${items.value.length}<//>
  <//>`;
};

module.exports = {
  Queue,
  withQueue,
  useQueue
};

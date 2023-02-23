const { html, css, createContext, useContext, useSignal } = require('../tools/ui.js');

css('./Queue.css');

const QueueContext = createContext({});

const withQueue = Component => ({ children, ...props }) => {
  const items = useSignal([]);

  const api = {
    items
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

const Queue = () => {
  const { items } = useQueue();

  return html`<div class=queue>This is the queue<//>`;
};

module.exports = {
  Queue,
  withQueue,
  useQueue
};

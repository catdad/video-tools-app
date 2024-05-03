const EventEmitter = require('events');
const { html, createContext, useSignal, useSignalEffect, useRef } = require('./ui.js');

const keyboard = require('../../lib/keyboard.js');
const { useContext } = require('preact/hooks');
const { useConfigSignal } = require('./config.js');

const ShortcutsContext = createContext({});

const addShortcut = (events, accelerator) => {
  keyboard.add(accelerator);
  keyboard.events.on(accelerator, () => {
    events.emit(accelerator);
  });
};

const removeShortcut = (events, accelerator) => {
  keyboard.remove(accelerator);

  for (const func of events.listeners(accelerator)) {
    events.off(accelerator, func);
  }
};

const withShortcuts = Component => ({ children, ...props }) => {
  const events = useSignal(new EventEmitter());
  const captureVideo = useConfigSignal('shortcuts.capture.video', 'Alt+4');
  const captureStop = useConfigSignal('shortcuts.capture.stop', 'Alt+5');

  useSignalEffect(() => {
    const e = events.value;
    const video = captureVideo.value;
    const stop = captureStop.value;

    addShortcut(e, video);
    addShortcut(e, stop);

    return () => {
      removeShortcut(e, video);
      removeShortcut(e, stop);
    };
  });

  const api = {
    captureVideo,
    captureStop,
    events
  };

  return html`
    <${ShortcutsContext.Provider} = value=${api}>
      <${Component} ...${props}>${children}<//>
    <//>
  `;
};

const useShortcuts = () => useContext(ShortcutsContext);

module.exports = { withShortcuts, useShortcuts };

const EventEmitter = require('events');
const { app, globalShortcut } = require('electron');
const is = require('./is.js');

const name = 'keyboard';
const isomorphic = require('./isomorphic.js');

const events = new EventEmitter();

let initialized = false;
const shortcuts = new Map();

if (is.main) {
  app.whenReady().then(() => {
    initialized = true;
    shortcuts.forEach((accelerator, name) => add(name, accelerator));
  });

  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
  });
}

function add(name, accelerator) {
  if (!initialized) {
    shortcuts.set(name, accelerator);
    return;
  }

  globalShortcut.unregister(accelerator);

  globalShortcut.register(accelerator, () => {
    events.emit(name);
  });
}

function remove(name) {
  if (shortcuts.has(name)) {
    const accelerator = shortcuts.get(name);
    globalShortcut.unregister(accelerator);
    shortcuts.remove(name);
  }
}

const implementation = { add, remove };

module.exports = isomorphic({ name, implementation, events });

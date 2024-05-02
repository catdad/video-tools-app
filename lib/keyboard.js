const EventEmitter = require('events');
const { app, globalShortcut } = require('electron');
const is = require('./is.js');

const name = 'keyboard';
const isomorphic = require('./isomorphic.js');

const events = new EventEmitter();

let initialized = false;
const shortcuts = {};

if (is.main) {
  app.whenReady().then(() => {
    initialized = true;
    Object.keys(shortcuts).forEach(accelerator => add(accelerator));
  });

  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
  });
}

function add(accelerator) {
  shortcuts[accelerator] = true;

  if (!initialized) {
    return;
  }

  globalShortcut.unregister(accelerator);

  globalShortcut.register(accelerator, () => {
    events.emit(accelerator);
  });
}

function remove(accelerator) {
  globalShortcut.remove(accelerator);
  delete shortcuts[accelerator];
}

const implementation = { add, remove };

module.exports = isomorphic({ name, implementation, events });

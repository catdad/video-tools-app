const name = 'keyboard';

const EventEmitter = require('events');
const { app, globalShortcut } = require('electron');
const is = require('./is.js');
const { info, error } = require('./log.js')(name);

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
  info(`adding keyboard shortcut: ${accelerator}`);

  globalShortcut.unregister(accelerator);

  globalShortcut.register(accelerator, () => {
    info(`triggering keyboard shortcut: ${accelerator}`);
    events.emit(accelerator);
  });
}

function remove(accelerator) {
  info(`removing keyboard shortcut: ${accelerator}`);

  globalShortcut.unregister(accelerator);
  delete shortcuts[accelerator];
}

const implementation = { add, remove };

module.exports = isomorphic({ name, implementation, events });

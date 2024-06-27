const electron = require('electron');
const is = require('./is.js');
const log = require('./log.js');

const gid = () => Math.random().toString(36).substr(2);

module.exports = ({ name, implementation, events }) => {
  const { info, error } = log(`${name}-isomorphic`);
  const CB_CHANNEL = `${name}-channel`;

  const keys = Object.keys(implementation).filter(k => k[0] !== '_');

  if (is.main && electron.ipcMain.listenerCount(CB_CHANNEL) === 0) {
    info(`initializing main ipc for ${name} module`);

    if (events) {
      const emit = events.emit.bind(events);

      events.emit = (evname, ...args) => {
        emit(name, ...args);

        for (const window of electron.BrowserWindow.getAllWindows()) {
          window.webContents.send(`${name}:event`, { evname, args });
        }
      };
    }

    const callback = (ev, id) => (err, result) => {
      const cbName = `${name}:callback:${id}`;
      const threadTimestamp = Date.now();

      const send = ev.reply ? ev.reply.bind(ev) : ev.sender.send.bind(ev.sender);

      if (err) {
        return send(cbName, {
          ok: false,
          err: err.message,
          threadTimestamp
        });
      }

      return send(cbName, {
        ok: true,
        value: result,
        threadTimestamp
      });
    };

    electron.ipcMain.on(CB_CHANNEL, async (ev, { id, opname, args }) => {
      const cb = callback(ev, id);

      if (!implementation[opname] || opname[0] === '_') {
        return cb(new Error(`unknown operation "${opname}"`));
      }

      try {
        const result = await implementation[opname](...args);
        return cb(null, result);
      } catch (e) {
        error(e);
        return cb(e);
      }
    });
  }

  if (!is.main && events) {
    electron.ipcRenderer.on(`${name}:event`, (ev, { evname, args }) => {
      events.emit(evname, ...args);
    });
  }

  const rendererSend = (opname, args) => {
    const id = gid() + gid();

    return new Promise((resolve, reject) => {
      electron.ipcRenderer.once(`${name}:callback:${id}`, (ev, result) => {
        if (result.ok) {
          return resolve(result.value);
        }

        return reject(new Error(result.err));
      });

      electron.ipcRenderer.send(CB_CHANNEL, { id, opname, args });
    });
  };

  return Object.defineProperties(keys.reduce((memo, key) => {
    memo[key] = is.main ? implementation[key] : (...args) => rendererSend(key, args);
    return memo;
  }, {}), {
    events: {
      enumerable: true,
      writable: false,
      value: events
    }
  });
};

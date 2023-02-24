const { BrowserWindow } = require('electron');

const isomorphic = require('./isomorphic.js');
const name = 'progress';

const set = (value) => {
  BrowserWindow.getAllWindows().filter(w => w.isVisible()).forEach(win => {
    win.setProgressBar(value);
  });
};

const clear = () => void set(-1);

module.exports = isomorphic({
  name,
  implementation: { set, clear }
});

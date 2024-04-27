const { BrowserWindow } = require('electron');

const isomorphic = require('./isomorphic.js');
const name = 'browser';

const maximizeToggle = () => {
  const browser = BrowserWindow.getFocusedWindow();

  if (browser.isMaximized()) {
    browser.unmaximize();
  } else {
    browser.maximize();
  }
};

const minimize = () => void BrowserWindow.getFocusedWindow().minimize();

const close = () => void BrowserWindow.getFocusedWindow().close();

module.exports = isomorphic({
  name,
  implementation: { close, minimize, maximizeToggle }
});

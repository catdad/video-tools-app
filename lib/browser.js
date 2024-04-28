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

const clickthrough = () => {
  const window = BrowserWindow.getFocusedWindow();

  window.setIgnoreMouseEvents(true);
  window.setAlwaysOnTop(true);
  window.setOpacity(0.5);
};

module.exports = isomorphic({
  name,
  implementation: { close, minimize, maximizeToggle, clickthrough }
});

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

const enterClickthrough = () => {
  // TODO
  // * setVisibleOnAllWorkspaces
  for (const window of BrowserWindow.getAllWindows()) {
    window.setIgnoreMouseEvents(true, { forward: true });
    window.setAlwaysOnTop(true);
    window.blur();
  }
};

const exitClickthrough = () => {
  for (const window of BrowserWindow.getAllWindows()) {
    window.setIgnoreMouseEvents(false);
    window.setAlwaysOnTop(false);
  }
};

module.exports = isomorphic({
  name,
  implementation: { close, minimize, maximizeToggle, enterClickthrough, exitClickthrough }
});


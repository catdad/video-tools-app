const { BrowserWindow, dialog } = require('electron');

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

const focus = () => {
  for (const window of BrowserWindow.getAllWindows()) {
    window.restore();
    window.show();
  }
};

const enterClickthrough = async () => {
  // TODO
  // * setVisibleOnAllWorkspaces
  for (const window of BrowserWindow.getAllWindows()) {
    window.setIgnoreMouseEvents(true, { forward: true });
    window.setAlwaysOnTop(true);
    window.setVisibleOnAllWorkspaces(true);
    window.blur();
  }
};

const exitClickthrough = () => {
  for (const window of BrowserWindow.getAllWindows()) {
    window.setIgnoreMouseEvents(false);
    window.setAlwaysOnTop(false);
    window.setVisibleOnAllWorkspaces(false);
  }
};

const directoryDialog = (defaultPath) => {
  // sync method will actually block the entire Electron application
  // which, in this case, is in fact what we want... the rare case
  const result = dialog.showOpenDialogSync({
    defaultPath,
    properties: ['openDirectory']
  });

  if (Array.isArray(result)) {
    return { canceled: false, destination: result[0] };
  }

  return { canceled: true };
};

module.exports = isomorphic({
  name,
  implementation: {
    close,
    minimize,
    maximizeToggle,
    focus,
    enterClickthrough,
    exitClickthrough,
    directoryDialog
  }
});


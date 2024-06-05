const { BrowserWindow, dialog, systemPreferences } = require('electron');

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
  for (const window of BrowserWindow.getAllWindows()) {
    window.blur();
    
    window.setIgnoreMouseEvents(true, { forward: true });
    window.setAlwaysOnTop(true);
    window.setVisibleOnAllWorkspaces(true);
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

const getCapturePermissionStatus = async () => {
  if (!['darwin', 'win32'].includes(process.platform)) {
    return true;
  }

  const status = await systemPreferences.getMediaAccessStatus('screen');

  return status === 'granted';
};

const requestCapturePermission = async () => {
  if (process.platform !== 'darwin') {
    return true;
  }

  const granted = await systemPreferences.askForMediaAccess('screen');

  return granted === true;
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
    directoryDialog,
    getCapturePermissionStatus,
    requestCapturePermission
  }
});

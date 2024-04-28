const path = require('path');
const url = require('url');
const EventEmitter = require('events');
const events = new EventEmitter();

const { app, BrowserWindow, Menu, screen, systemPreferences } = require('electron');

require('./lib/app-id.js')(app);
require('./lib/video-tools.js');
require('./lib/progress.js');
require('./lib/browser.js');
const log = require('./lib/log.js')('main');
const config = require('./lib/config.js');
const debounce = require('./lib/debounce.js');
const icon = require('./lib/icon.js')();
const menu = require('./lib/menu.js');

log.info(`electron node version: ${process.version}`);

// macOS Mojave light/dark mode changed
const setMacOSTheme = () => {
  if (!(systemPreferences.setAppLevelAppearance && systemPreferences.isDarkMode)) {
    log.info('this system does not support setting app-level appearance');
    return;
  }

  const mode = systemPreferences.isDarkMode() ? 'dark' : 'light';
  log.info(`setting app-level appearance to ${mode}`);
  systemPreferences.setAppLevelAppearance(mode);
};

if (systemPreferences.subscribeNotification) {
  systemPreferences.subscribeNotification('AppleInterfaceThemeChangedNotification', setMacOSTheme);
  setMacOSTheme();
}

function getLocationOnExistingScreen() {
  const x = config.getProp('window.x');
  const y = config.getProp('window.y');
  const width = config.getProp('window.width') || 1000;
  const height = config.getProp('window.height') || 800;

  for (const { bounds } of screen.getAllDisplays()) {
    const xInBounds = x >= bounds.x && x <= bounds.x + bounds.width;
    const yInBounds = y >= bounds.y && y <= bounds.y + bounds.height;

    if (xInBounds && yInBounds) {
      return { x, y, width, height };
    }
  }

  return { width, height };
}

(async () => {
  await Promise.all([
    app.whenReady(),
    config.read()
  ]);

  // TODO provide a toggle in the ui for this
  config.setProp('ui-mode', 'dark');

  Menu.setApplicationMenu(menu.create({ events }));

  const windowOptions = {
    ...getLocationOnExistingScreen(),
    backgroundColor: '#121212',
    darkTheme: true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webviewTag: true
    },
    frame: process.platform === 'darwin' ? true : false,
    titleBarStyle: process.platform === 'darwin' ? 'hidden' : undefined,
    transparent: true,
    backgroundColor: '#000000ff',
    icon
  };

  if (process.platform === 'darwin' && config.getProp('experiments.framelessWindow')) {
    windowOptions.titleBarStyle = 'hidden';
  }

  // Create the browser window.
  const mainWindow = new BrowserWindow(windowOptions);

  if (config.getProp('window.maximized')) {
    mainWindow.maximize();
  }

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'public', 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  const onBoundsChange = debounce(() => {
    if (mainWindow.isMaximized() || mainWindow.isMinimized()) {
      return;
    }

    const bounds = mainWindow.getBounds();

    config.setProp('window.x', bounds.x);
    config.setProp('window.y', bounds.y);
    config.setProp('window.width', bounds.width);
    config.setProp('window.height', bounds.height);
  }, 500);

  mainWindow.on('resize', onBoundsChange);
  mainWindow.on('move', onBoundsChange);

  mainWindow.on('maximize', () => {
    config.setProp('window.maximized', true);
  });

  mainWindow.on('unmaximize', () => {
    config.setProp('window.maximized', false);
  });

  mainWindow.webContents.on('devtools-opened', () => {
    config.setProp('devToolsOpen', true);
  });

  mainWindow.webContents.on('devtools-closed', () => {
    config.setProp('devToolsOpen', false);
  });

  if (config.getProp('devToolsOpen')) {
    mainWindow.webContents.openDevTools();
  }

  events.on('reload', () => {
    mainWindow.reload();
  });
})().then(() => {
  log.info('application is running');
}).catch(err => {
  log.error('application has failed to start', err);
  process.exitCode = 1;
});

// It's common to need to do some cleanup before closing, so if
// you do, do it here
app.once('before-quit', () => {
  log.info(`${app.getName()} is closing, cleaning up`);
});

app.on('window-all-closed', () => {
  app.quit();
});

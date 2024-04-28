const { Menu } = require('electron');
const is = require('./is.js');

const name = 'menu';
const isomorphic = require('./isomorphic.js');
let mainMenu;
let open = false;

function createMenu({ events }) {
  const template = [{
    label: process.platform === 'darwin' ? is.name : 'Menu',
    submenu: [
      ...(is.prod ? [] : [
        { role: 'toggledevtools' },
        { type: 'separator' },
      ]),
      // {
      //   label: 'About',
      //   click: () => {
      //     events.emit('ipcevent', { name: 'about' });
      //   }
      // },
      // {
      //   label: 'Check for updates',
      //   click: () => {
      //     events.emit('ipcevent', { name: 'check-for-update' });
      //   }
      // },
      // {
      //   label: 'Keyboard shortcuts',
      //   click: () => {
      //     events.emit('ipcevent', { name: 'shortcuts' });
      //   }
      // },
      // { type: 'separator' },
      { role: 'reload' },
      { role: 'quit' }
    ]
  }];

  mainMenu = Menu.buildFromTemplate(template);

  return mainMenu;
}

async function openContext(opts) {
  if (!mainMenu) {
    return;
  }

  mainMenu.popup(opts);

  open = true;

  mainMenu.once('menu-will-close', () => {
    // this needs to be throttled, otherwise
    // open will be set to false before the next toggle call
    setTimeout(() => {
      open = false;
    }, 100);
  });
}

async function closeContext() {
  if (!mainMenu) {
    return;
  }

  mainMenu.closePopup();
}

async function toggleContext() {
  if (open) {
    return closeContext();
  }

  return openContext();
}

const implementation = {
  create: createMenu,
  openContext,
  closeContext,
  toggleContext
};

module.exports = isomorphic({ name, implementation });

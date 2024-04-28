const {
  html, css,
  MaterialIcon: MI
} = require('../tools/ui.js');
const browser = require('../../lib/browser.js');
const menu = require('../../lib/menu.js');

const Icons = {
  Close: MI`Close`,
  Minimize: MI`Minimize`,
  Maximize: MI`CropSquare`,
  Menu: MI`Menu`
};

css('./Frame.css');

const Icon = Elem => () => html`<${Elem} style=${{ fontSize: 18 }} />`;

const MenuControls = () => {
  if (process.platform === 'darwin') {
    return;
  }

  return html`<div class="frame-buttons">
    <button onClick=${() => menu.toggleContext()}><${Icon(Icons.Menu)} /></button>
  </div>`;
};

const WindowControls = () => {
  if (process.platform === 'darwin') {
    return;
  }

  return html`<div class="frame-buttons">
    <button onClick=${() => browser.minimize()}><${Icon(Icons.Minimize)} /></button>
    <button onClick=${() => browser.maximizeToggle()}><${Icon(Icons.Maximize)} /></button>
    <button onClick=${() => browser.close()}><${Icon(Icons.Close)} /></button>
  </div>`;
};

const Frame = () => {
  return html`<div class="frame" style="height: 30px">
    <${MenuControls} />
    <div class="frame-title">video tools</div>
    <${WindowControls} />
  </div>`;
};

module.exports = Frame;

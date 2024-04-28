const {
  Tab,
  html, css, createRef,
  useEffect, useState,
  setVar
} = require('../tools/ui.js');
const browser = require('../../lib/browser.js');
const menu = require('../../lib/menu.js');

const Close = require('@material-ui/icons/Close').default;
const Minimize = require('@material-ui/icons/Minimize').default;
const Maximize = require('@material-ui/icons/WebAsset').default;
const Menu = require('@material-ui/icons/Menu.js').default;

css('./Frame.css');

const Icon = Elem => () => html`<${Elem} style=${{ fontSize: 18 }} />`;

const MenuControls = () => {
  if (process.platform === 'darwin') {
    return;
  }

  return html`<div class="frame-buttons">
    <button onClick=${() => menu.toggleContext()}><${Icon(Menu)} /></button>
  </div>`;
};

const WindowControls = () => {
  if (process.platform === 'darwin') {
    return;
  }

  return html`<div class="frame-buttons">
    <button onClick=${() => browser.minimize()}><${Icon(Minimize)} /></button>
    <button onClick=${() => browser.maximizeToggle()}><${Icon(Maximize)} /></button>
    <button onClick=${() => browser.close()}><${Icon(Close)} /></button>
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

const {
  Tab,
  html, css, createRef,
  useEffect, useState,
  setVar
} = require('../tools/ui.js');
const browser = require('../../lib/browser.js');

const Close = require('@material-ui/icons/Close').default;
const Minimize = require('@material-ui/icons/Minimize').default;
const Maximize = require('@material-ui/icons/WebAsset').default;

css('./Frame.css');

const Controls = () => {
  if (process.platform === 'darwin') {
    return;
  }

  const fontSize = 18;

  return html`<div class="frame-buttons">
    <button onClick=${() => browser.minimize()}><${Minimize} style=${{ fontSize }} /></button>
    <button onClick=${() => browser.maximizeToggle()}><${Maximize} style=${{ fontSize }} /></button>
    <button onClick=${() => browser.close()}><${Close} style=${{ fontSize }} /></button>
  </div>`;
};

const Frame = () => {
  return html`<div class="frame" style="height: 30px">
    <div class="frame-title">Video Tools</div>
    <${Controls} />
  </div>`;
};

module.exports = Frame;

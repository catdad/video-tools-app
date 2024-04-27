const {
  Tab,
  html, css, createRef,
  useEffect, useState,
  setVar
} = require('../tools/ui.js');
const browser = require('../../lib/browser.js');

css('./Frame.css');

const Frame = () => {
  return html`<div class="frame" style="height: 30px">
    <div class="frame-title">Video Tools</div>
    <div class="frame-buttons">
      <button onClick=${() => browser.minimize()}>Min</button>
      <button onClick=${() => browser.maximizeToggle()}>Max</button>
      <button onClick=${() => browser.close()}>Close</button>
    </div>
  </div>`;
};

module.exports = Frame;

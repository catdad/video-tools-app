const path = require('path');

const { html, css, Material: M, batch } = require('../tools/ui.js');
const { useConfigSignal, useConfigPaths } = require('../tools/config.js');

const videoTools = require('../../lib/video-tools.js');
const { useTransparent } = require('../tools/transparent.js');
const { useFrame } = require('../Frame/Frame.js');

css('./Capture.css');

const makeEven = val => val % 2 === 0 ? val : val - 1;

function Capture({ 'class': classNames = ''} = {}) {
  const { isTransparent } = useTransparent();
  const { frameButtons } = useFrame();
  const { desktop } = useConfigPaths();
  const outputDirectory = useConfigSignal('capture.output', desktop);

  const onSetup = () => {
    const x = window.screenX < 0 ? 0 : window.screenX;
    const y = window.screenY < 0 ? 0 : window.screenY;
    const width = makeEven(window.screenX < 0 ? window.outerWidth + window.screenX : window.outerWidth);
    const height = makeEven(window.screenY < 0 ? window.outerHeight + window.screenY : window.outerHeight);

    const exit = () => {
      batch(() => {
        isTransparent.value = false;
        frameButtons.value = null;
      });
    };

    const buttons = html`
      <button onClick=${() => {
        videoTools.exec('desktop', [{
          x, y, width, height,
          offsetX: x,
          offsetY: y,
          output: path.resolve(outputDirectory.value, `Screen Recording - ${new Date().toISOString().replace(/:/g, '-')}.mp4`)
        }])
          .then(() => console.log('done!'))
          .catch(err => console.log('failed:', err))
          .finally(() => exit());
      }}>Start</button>
      <button onClick=${() => {
        exit();
      }}>Stop</button>
    `;

    batch(() => {
      isTransparent.value = true;
      frameButtons.value = buttons;
    });
  };

  return html`
    <div class="${classNames} capture">
      <h2>Screen recording</h2>
      <${M`Button`} onClick=${onSetup}>Setup<//>
    </div>
  `;
}

module.exports = Capture;

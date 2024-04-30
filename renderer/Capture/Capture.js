const path = require('path');

const { html, css, Material: M, batch } = require('../tools/ui.js');
const { useConfigSignal, useConfigPaths } = require('../tools/config.js');

const videoTools = require('../../lib/video-tools.js');
const { useTransparent } = require('../tools/transparent.js');
const { useFrame } = require('../Frame/Frame.js');

css('./Capture.css');

const makeEven = val => val % 2 === 0 ? val : val - 1;

const getVars = () => {
  const style = window.getComputedStyle(document.documentElement);
  const frameHeight = style.getPropertyValue('--frame-height');
  const frameBorder = style.getPropertyValue('--frame-border');

  return {
    frame: parseInt(frameHeight, 10),
    border: parseInt(frameBorder, 10)
  };
};

function Capture({ 'class': classNames = ''} = {}) {
  const { isTransparent } = useTransparent();
  const { frameButtons } = useFrame();
  const { desktop } = useConfigPaths();
  const outputDirectory = useConfigSignal('capture.output', desktop);

  const onSetup = () => {
    const { frame, border } = getVars();
    const x = (window.screenX < 0 ? 0 : window.screenX) + border;
    const y = (window.screenY < 0 ? 0 : window.screenY) + frame;
    const width = makeEven((window.screenX < 0 ? window.outerWidth + window.screenX : window.outerWidth) - border);
    const height = makeEven((window.screenY < 0 ? window.outerHeight + window.screenY : window.outerHeight) - border - frame);

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
    <div class="${classNames} capture ${isTransparent.value ? 'capture-transparent' : ''}">
      <h2>Screen recording</h2>
      <${M`Button`} onClick=${onSetup}>Setup<//>
    </div>
  `;
}

module.exports = Capture;

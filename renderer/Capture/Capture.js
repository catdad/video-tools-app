const path = require('path');

const { html, css, Material: M, batch, createRef } = require('../tools/ui.js');
const { useConfigSignal, useConfigPaths } = require('../tools/config.js');

const videoTools = require('../../lib/video-tools.js');
const browser = require('../../lib/browser.js');
const { useTransparent } = require('../tools/transparent.js');
const { useFrame } = require('../Frame/Frame.js');

css('./Capture.css');

const makeEven = val => val % 2 === 0 ? val : val - 1;

const getVars = () => {
  const style = window.getComputedStyle(document.documentElement);

  return {
    frame: parseInt(style.getPropertyValue('--frame-height'), 10),
    border: parseInt(style.getPropertyValue('--frame-border'), 10)
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
    const width = makeEven((window.screenX < 0 ? window.outerWidth + window.screenX : window.outerWidth) - border - border);
    const height = makeEven((window.screenY < 0 ? window.outerHeight + window.screenY : window.outerHeight) - border - frame);
    const eventHandlers = createRef([]);

    const exit = () => {
      batch(() => {
        isTransparent.value = false;
        frameButtons.value = null;
      });

      browser.exitClickthrough();

      for (const { name, handler} of eventHandlers.current || []) {
        window.removeEventListener(name, handler);
      }

      eventHandlers.current = [];
    };

    const buttons = html`
      <button onClick=${() => {
        const onClick = (ev) => {
          console.log(ev);
          exit();
        };

        window.addEventListener('focus', onClick);

        eventHandlers.current = eventHandlers.current || [];
        eventHandlers.current.push({ name: 'focus', handler: onClick });

        Promise.resolve().then(async () => {
          await browser.enterClickthrough();

          try {
            await videoTools.exec('desktop', [{
              x, y, width, height,
              offsetX: x,
              offsetY: y,
              output: path.resolve(outputDirectory.value, `Screen Recording - ${new Date().toISOString().replace(/:/g, '-')}.mp4`)
            }]);
          } catch (e) {
            console.log('capture failed:', err);
          } finally {
            exit();
          }
        });
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

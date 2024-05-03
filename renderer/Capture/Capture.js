const path = require('path');

const {
  html, css, Material: M, batch, createRef,
  PrimaryButton, SecondaryButton, PrimaryTextField: TextField
} = require('../tools/ui.js');
const { useConfigSignal, useConfigPaths } = require('../tools/config.js');

const videoTools = require('../../lib/video-tools.js');
const browser = require('../../lib/browser.js');
const keyboard = require('../../lib/keyboard.js');
const { useTransparent } = require('../tools/transparent.js');
const { useFrame } = require('../Frame/Frame.js');

css('./Capture.css');

const SHORTCUTS = {
  stop: 'Alt+4'
};

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

    const exitCapture = () => {
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
      <${PrimaryButton} style=${{ height: 'calc(var(--frame-height) - 4px)' }} onClick=${() => {
        const onFocus = (ev) => {
          videoTools.stopCurrent();
          keyboard.remove(SHORTCUTS.stop);
          exitCapture();
        };

        window.addEventListener('focus', onFocus);

        eventHandlers.current = eventHandlers.current || [];
        eventHandlers.current.push({ name: 'focus', handler: onFocus });

        Promise.resolve().then(async () => {
          frameButtons.value = html`<span>Stop: ${SHORTCUTS.stop} or click the app in taskbar</span>`
          await keyboard.add(SHORTCUTS.stop);
          await browser.enterClickthrough();

          keyboard.events.once(SHORTCUTS.stop, () => onFocus());

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
            exitCapture();
          }
        });
      }}>Start<//>
      <${SecondaryButton} onClick=${() => {
        exitCapture();
      }}>Cancel<//>
    `;

    batch(() => {
      isTransparent.value = true;
      frameButtons.value = buttons;
    });
  };

  const onDirectoryFocus = (ev) => {
    ev.target.blur();

    browser.directoryDialog(outputDirectory.value).then(({ destination }) => {
      if (destination) {
        outputDirectory.value = destination;
      }
    }).catch(e => {
      console.log('failed to select directory:', e);
    });
  };

  return html`
    <div class="${classNames} capture ${isTransparent.value ? 'capture-transparent' : ''}">
      <h2>Screen recording</h2>
      <div style=${{
        width: 'clamp(100px, 80vw, 300px)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <${TextField}
          label="destination folder"
          value=${outputDirectory.value}
          onClick=${onDirectoryFocus}
          webkitdirectory=true
        />
        <hr style=${{
          width: '100%',
          border: '1px dashed #ffffff22'
        }} />
        <${PrimaryButton} onClick=${onSetup}>Select capture area<//>
      </div>
    </div>
  `;
}

module.exports = Capture;

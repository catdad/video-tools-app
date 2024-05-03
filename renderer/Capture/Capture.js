const path = require('path');

const {
  html, css, Material: M, batch, createRef,
  PrimaryButton, SecondaryButton, PrimaryTextField: TextField,
  useSignalEffect, useSignal
} = require('../tools/ui.js');
const { useConfigSignal, useConfigPaths } = require('../tools/config.js');

const videoTools = require('../../lib/video-tools.js');
const browser = require('../../lib/browser.js');
const keyboard = require('../../lib/keyboard.js');
const { useTransparent } = require('../tools/transparent.js');
const { useFrame } = require('../Frame/Frame.js');
const { useShortcuts } = require('../tools/shortcuts.js');

css('./Capture.css');

const focusArea = process.platform === 'darwin' ? 'dock' : 'taskbar';

const makeEven = val => val % 2 === 0 ? val : val - 1;

const getVars = () => {
  const style = window.getComputedStyle(document.documentElement);

  return {
    frame: parseInt(style.getPropertyValue('--frame-height'), 10),
    border: parseInt(style.getPropertyValue('--frame-border'), 10)
  };
};

function Capture({ 'class': classNames = ''} = {}) {
  const { captureStop, captureVideo } = useShortcuts();
  const { isTransparent } = useTransparent();
  const { frameButtons } = useFrame();
  const { desktop } = useConfigPaths();
  const outputDirectory = useConfigSignal('capture.output', desktop);
  const localEvents = createRef([]);

  const view = useSignal('main');

  console.log(view.value, isTransparent.value);

  useSignalEffect(() => {
    const transparent = isTransparent.value;
    const v = view.value;

    const onMain = () => void batch(() => {
      isTransparent.value = false;
      frameButtons.value = null;
    });

    const onCapture = () => void  batch(() => {
      isTransparent.value = true;
      frameButtons.value = html`
        <${PrimaryButton} style=${{
          height: 'calc(var(--frame-height) - 4px)'
        }} onClick=${() => {
          startCapture();
        }}>Start<//>
        <${SecondaryButton} onClick=${() => {
          exitCapture();
        }}>Cancel<//>
      `
    });

    switch(true) {
      case v === 'main' && transparent:
      case v === 'capture':
        return onCapture();
      case v === 'main':
        return onMain();
    }
  });

  const startCapture = () => {
    const { frame, border } = getVars();
    const x = (window.screenX < 0 ? 0 : window.screenX) + border;
    const y = (window.screenY < 0 ? 0 : window.screenY) + frame;
    const width = makeEven((window.screenX < 0 ? window.outerWidth + window.screenX : window.outerWidth) - border - border);
    const height = makeEven((window.screenY < 0 ? window.outerHeight + window.screenY : window.outerHeight) - border - frame);

    const onFocus = () => {
      videoTools.stopCurrent();
      keyboard.remove(captureStop.value);
      exitCapture();
    };

    window.addEventListener('focus', onFocus);

    localEvents.current = localEvents.current || [];
    localEvents.current.push({ name: 'focus', handler: onFocus });

    Promise.resolve().then(async () => {
      frameButtons.value = html`<span>Stop: ${captureStop.value} or click the app in the ${focusArea}</span>`
      await keyboard.add(captureStop.value);
      await browser.enterClickthrough();

      keyboard.events.once(captureStop.value, () => onFocus());

      try {
        await videoTools.exec('desktop', [{
          x, y, width, height,
          offsetX: x,
          offsetY: y,
          output: path.resolve(outputDirectory.value, `Screen Recording - ${new Date().toISOString().replace(/:/g, '-')}.mp4`)
        }]);
      } catch (e) {
        console.log('capture failed:', e);
      } finally {
        exitCapture();
      }
    });
  };

  const exitCapture = () => {
    browser.exitClickthrough();

    for (const { name, handler} of localEvents.current || []) {
      window.removeEventListener(name, handler);
    }

    localEvents.current = [];
    batch(() => {
      view.value = 'main';
      isTransparent.value = false;
    });
  };

  const onSetup = () => {
    view.value = 'capture';
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

        <h3>Keyboard Shortcuts</h3>
        <table>
          <tr>
            <td>Jump to screen recording:</td>
            <td><b>${captureVideo.value}</b></td>
          </tr>
          <tr>
            <td>Stop screen recording:</td>
            <td><b>${captureStop.value}</b></td>
          </tr>
        </table>
        <p><i>
          When recording, you can also stop the video by clicking on
          the app in your ${focusArea}
        </i></p>
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

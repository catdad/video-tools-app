const path = require('path');

const {
  html, css, Material: M, MaterialIcon: MI, batch, createRef,
  PrimaryButton, SecondaryButton, PrimaryTextField: TextField,
  useSignalEffect, useSignal,
  useContext, createContext
} = require('../tools/ui.js');
const { useConfigSignal, useConfigPaths, useConfig } = require('../tools/config.js');

const videoTools = require('../../lib/video-tools.js');
const browser = require('../../lib/browser.js');
const keyboard = require('../../lib/keyboard.js');
const log = require('../../lib/log.js')('capture');
const { useTransparent } = require('../tools/transparent.js');
const { useFrame } = require('../Frame/Frame.js');
const { useShortcuts } = require('../tools/shortcuts.js');

css('./Capture.css');

const focusArea = process.platform === 'darwin' ? 'dock' : 'taskbar';

const makeEven = val => val % 2 === 0 ? val : val - 1;
const dpr = val => val * (window.devicePixelRatio || 1);

const getVars = () => {
  const style = window.getComputedStyle(document.documentElement);

  return {
    frame: parseInt(style.getPropertyValue('--frame-height'), 10),
    border: parseInt(style.getPropertyValue('--frame-border'), 10)
  };
};

const CaptureContext = createContext({});

const withCapture = Component => ({ children, ...props }) => {
  const VIEWS = {
    main: 'main',
    capture: 'capture'
  };
  const view = useSignal('main');

  return html`
    <${CaptureContext.Provider} value=${{ VIEWS, view }}>
      <${Component} ...${props}>${children}<//>
    <//>
  `;
};

const useCapture = () => useContext(CaptureContext);

const withCapturePermission = Component => ({ children, 'class': classNames = '', ...props }) => {
  const { capturePermission, setCapturePermission } = useConfig();
  const errorMessage = useSignal();
  log.info('permission allowed by the OS:', capturePermission);

  const bodyChildren = [];

  switch (true) {
    case !!errorMessage.value:
      bodyChildren.push(html`
      <p class="capture-alert">
        <${MI`Warning`} fontSize=small />
        <span>${errorMessage.value}</span>
      </p>
      `);
      // allow to fall through
    case capturePermission === false:
      const onPermission = () => {
        browser.requestCapturePermission().then(result => {
          if (result === true) {
            console.log('we got permission');
            return setCapturePermission(true);
          }

          errorMessage.value = 'Permission was not granted. You may need to restart the app or go into your OS settings to allow permission.';
        }).catch(err => {
          errorMessage.value = `An unexpected error occured: "${err.message}". You may need to restart the app or go into your OS settings to allow permission.`;
        });
      };

      bodyChildren.push(html`
        <p class="capture-alert">
          <${MI`Help`} fontSize=small />
          <span>
          To capture desktop video, you first need to request permission
          from the Operating System
          </span>
        </p>
        <${PrimaryButton} onClick=${onPermission}>Request permission<//>
      `);
      break;
    default:
      bodyChildren.push(html`<${Component} ...${props}>${children}<//>`);
  }

  return html`
    <div class="${classNames} capture">
      <div style=${{
        width: 'clamp(100px, 80vw, 300px)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h2>Screen recording</h2>
        ${bodyChildren}
      </div>
    </div>
  `;
};

function Capture() {
  const { captureStop, captureVideo } = useShortcuts();
  const { isTransparent } = useTransparent();
  const { frameButtons } = useFrame();
  const { desktop } = useConfigPaths();
  const outputDirectory = useConfigSignal('capture.output', desktop);
  const framerate = useConfigSignal('capture.framerate', 30);
  const localEvents = createRef([]);

  const { view } = useCapture();

  useSignalEffect(() => {
    switch(view.value) {
      case 'capture':
        browser.focus();
        return void batch(() => {
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
          `;
        });
      case 'main':
        return void batch(() => {
          isTransparent.value = false;
          frameButtons.value = null;
        });
    }
  });

  const startCapture = () => {
    const { frame, border } = getVars();

    // since these values are calculated from the browser,
    // we need to multiply by dpr to get the real desktop values
    const x = dpr((window.screenX < 0 ? 0 : window.screenX) + border);
    const y = dpr((window.screenY < 0 ? 0 : window.screenY) + frame);
    const width = dpr(makeEven((window.screenX < 0 ? window.outerWidth + window.screenX : window.outerWidth) - border - border));
    const height = dpr(makeEven((window.screenY < 0 ? window.outerHeight + window.screenY : window.outerHeight) - border - frame));

    const onFocus = () => {
      videoTools.stopCurrent();
      keyboard.remove(captureStop.value);
      exitCapture();
    };

    // TODO the app on a mac focuses immediately
    // so this doesn't work 😔
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
          output: path.resolve(outputDirectory.value, `Screen Recording - ${new Date().toISOString().replace(/:/g, '-')}.mp4`),
          framerate: framerate.value
        }]);
      } catch (e) {
        log.error('capture failed:', e);
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

  const onFramerate = (ev) => {
    const value = ev.target.value;

    if (value.length) {
      framerate.value = Number(value) || 30;
    }
  };

  return html`
    <${TextField}
      label="destination folder"
      value=${outputDirectory.value}
      onClick=${onDirectoryFocus}
      webkitdirectory=true
    />
    <${TextField}
      type="number"
      label="framerate"
      value=${framerate.value}
      onInput=${onFramerate}
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
    <p class="capture-alert">
      <${MI`Help`} fontSize=small />
      <span>
      To stop recording, you can also click the app in your ${focusArea}
      </span>
    </p>
    <hr style=${{
      width: '100%',
      border: '1px dashed #ffffff22'
    }} />
    <${PrimaryButton} onClick=${onSetup}>Select capture area<//>
  `;
}

module.exports = { Capture: withCapturePermission(Capture), withCapture, useCapture };

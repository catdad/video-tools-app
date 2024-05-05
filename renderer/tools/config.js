const { get, set } = require('lodash');
const { html, createContext, useEffect, useContext, useSignal, effect, batch } = require('../tools/ui.js');
const toast = require('../tools/toast.js');
const CONFIG = require('../../lib/config.js');
const browser = require('../../lib/browser.js');

const noop = () => {};

const Config = createContext({});

const withConfig = Component => ({ children, ...props }) => {
  const state = useSignal('loading');
  const localConfig = useSignal();
  const paths = useSignal({});
  const capturePermission = useSignal(false);

  const api = {
    get: (path, fallback) => get(localConfig.peek(), path, fallback),
    set: (path, value) => {
      set(localConfig.peek(), path, value);
      CONFIG.setProp(path, value).catch(noop);
    },
    get paths() {
      return paths.value;
    },
    get capturePermission() {
      return capturePermission.value;
    }
  };

  useEffect(() => {
    (async () => {
      const [config, desktop, screenPermission] = await Promise.all([
        CONFIG.read(),
        CONFIG.getPath('desktop'),
        browser.getCapturePermissionStatus()
      ]);

      batch(() => {
        state.value = 'available';
        localConfig.value = config;
        paths.value = {
          ...paths.value,
          desktop
        };
        capturePermission.value = screenPermission;
      });
    })().catch(err => {
      toast.error([
        'failed to load configuration',
        'try restarting the application',
        err.toString()
      ].join('<br/>'), { duration: -1 });
    });
  }, []);

  if (state.value === 'loading') {
    return html`<div></div>`;
  }

  return html`
    <${Config.Provider} value=${api}>
      <${Component} ...${props}>${children}<//>
    <//>
  `;
};

const useConfig = () => useContext(Config);

const useConfigSignal = (key, defaultValue) => {
  const config = useConfig();
  const configValue = config.get(key);
  const signal = useSignal(configValue === undefined ? defaultValue : configValue);

  effect(() => {
    config.set(key, signal.value);
  });

  return signal;
};

const useConfigPaths = () => {
  const config = useConfig();
  return config.paths;
};

module.exports = { withConfig, useConfig, useConfigSignal, useConfigPaths };

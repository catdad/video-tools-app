const { get, set } = require('lodash');
const { html, createContext, useEffect, useContext, useSignal, effect, batch } = require('../tools/ui.js');
const toast = require('../tools/toast.js');
const CONFIG = require('../../lib/config.js');

const noop = () => {};

const Config = createContext({});

const withConfig = Component => ({ children, ...props }) => {
  const state = useSignal('loading');
  const localConfig = useSignal();

  const api = {
    get: (path, fallback) => get(localConfig.peek(), path, fallback),
    set: (path, value) => {
      set(localConfig.peek(), path, value);
      CONFIG.setProp(path, value).catch(noop);
    }
  };

  useEffect(() => {
    CONFIG.read().then(obj => {
      batch(() => {
        state.value = 'available';
        localConfig.value = obj;
      });
    }).catch(err => {
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

module.exports = { withConfig, useConfig, useConfigSignal };

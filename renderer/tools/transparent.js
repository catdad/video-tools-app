const { html, createContext, useContext, useSignal, useSignalEffect, Material: M } = require('./ui.js');

const Transparent = createContext({});

const withTransparent = Component => ({ children, ...props }) => {
  const isTransparent = useSignal(false);

  useSignalEffect(() => {
    const props = Object.entries({
      '--dynamic-background': 'transparent',
      '--dynamic-corners': 'var(--c)'
    });

    const transparent = isTransparent.value;

    for (const [key, value] of props) {
      transparent ?
        document.documentElement.style.setProperty(key, value) :
        document.documentElement.style.removeProperty(key);
    }
  });

  return html`
    <${Transparent.Provider} value=${{ isTransparent }}>
      <${Component} ...${props}>${children}<//>
    <//>
  `;
};

const useTransparent = () => useContext(Transparent);

module.exports = { withTransparent, useTransparent };

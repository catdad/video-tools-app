const { html, useContext, useEffect, useState } = require('./ui.js');
const { ThemeProvider, createTheme } = require('@material-ui/core/styles');
const { Config } = require('./config.js');

const noop = () => {};

const getVar = (style, name) => style.getPropertyValue(name).trim();

const darkModeMedia = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : {
  matches: false,
  addListener: noop,
  removeListener: noop
};

function Theme({ children = []} = {}) {
  const config = useContext(Config);
  const mode = config.get('ui-mode');
  const defaultDark = mode === 'dark' ? true :
    mode === 'light' ? false :
      darkModeMedia.matches;
  const [isDarkMode, setDarkMode] = useState(defaultDark);

  useEffect(() => {
    const onChange = () => {
      setDarkMode(darkModeMedia.matches);
    };

    darkModeMedia.addListener(onChange);

    return () => {
      darkModeMedia.removeListener(onChange);
    };
  }, [/* execute once */]);

  const style = getComputedStyle(document.documentElement);

  const theme = createTheme({
    palette: {
      type: isDarkMode ? 'dark' : 'light',
      primary: { main: getVar(style, '--primary') },
      secondary: { main: getVar(style, '--secondary') },
      text: { primary: getVar(style, '--color-text') },
      background: {
        default: getVar(style, '--color-background'),
        paper: getVar(style, '--color-background')
      }
    },
    typography: {
      fontFamily: getVar(style, '--font-family')
    }
  });

  return html`
    <${ThemeProvider} theme=${theme}>${children}<//>
  `;
}

const withTheme = (Component) => (props) => html`
  <${Theme}><${Component} ...${props} /><//>
`;

module.exports = { Theme, withTheme };

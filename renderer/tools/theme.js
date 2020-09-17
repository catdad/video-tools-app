const { html, useEffect, useState } = require('./ui.js');
const { ThemeProvider, createMuiTheme } = require('@material-ui/core/styles');

const noop = () => {};

const getVar = (style, name) => style.getPropertyValue(name).trim();

const darkModeMedia = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : {
  matches: false,
  addListener: noop,
  removeListener: noop
};

function Theme({ children = []} = {}) {
  const [isDarkMode, setDarkMode] = useState(darkModeMedia.matches);

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

  const theme = createMuiTheme({
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

const {
  AppBar, Tabs, Tab,
  html, css,
  useContext, useEffect, useState,
  setVar
} = require('../tools/ui.js');
const { Config, withConfig } = require('../tools/config.js');
const { withTheme } = require('../tools/theme.js');

const VideoContainer = require('../VideoContainer/VideoContainer.js');
const VideoX264 = require('../VideoX264/VideoX264.js');

css('./App.css');

const TABS = [
  ['video container', VideoContainer],
  ['transcode to x264', VideoX264]
].reduce((obj, [name, Component], idx) => {
  obj[idx] = obj[name] = { idx, name, Component };

  return obj;
}, {});

const NAME = 'default-tab';

function App() {
  const config = useContext(Config);
  const configTab = config.get(NAME);
  const [tab, setTab] = useState(TABS[configTab] ? configTab : TABS[0].name);
  const app = {};
  const tabBar = {};

  useEffect(() => {
    const { height } = tabBar.current.getBoundingClientRect();
    setVar(app.current, 'tabs-height', `${height}px`);
  }, []);

  const onTabChange = (ev, newValue) => {
    if (newValue === TABS[tab].idx) {
      return;
    }

    const newTabName = TABS[newValue].name;

    config.set(NAME, newTabName);
    setTab(newTabName);
  };

  const tabDom = Object.keys(TABS).filter(k => isNaN(Number(k))).map(name => {
    return html`<${Tab} label=${name} />`;
  });

  return html`
    <div ref=${tabBar}>
      <${AppBar} position=static>
        <${Tabs} ref=${tabBar} value=${TABS[tab].idx} onChange=${onTabChange}>
          ${tabDom}
        <//>
      <//>
    </div>
    <div class=app ref=${app}>
      <${TABS[tab].Component} />
    </div>
  `;
}

module.exports = withConfig(withTheme(App));

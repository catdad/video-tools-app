const { AppBar, Tabs, Tab, html, css, useEffect, useState, setVar } = require('../tools/ui.js');
const { withConfig } = require('../tools/config.js');
const { withTheme } = require('../tools/theme.js');

const VideoContainer = require('../VideoContainer/VideoContainer.js');
const VideoX264 = require('../VideoX264/VideoX264.js');

css('./App.css');

const TABS = [
  'video container',
  'transcode to x264'
].reduce((obj, name, idx) => {
  obj[idx] = name;
  obj[name] = idx;

  return obj;
}, {});

const PANELS = {
  'video container': VideoContainer,
  'transcode to x264': VideoX264
};

function App() {
  const [tab, setTab] = useState('video container');
  const app = {};
  const tabBar = {};

  useEffect(() => {
    const { height } = tabBar.current.getBoundingClientRect();
    setVar(app.current, 'tabs-height', `${height}px`);
  }, []);

  const onTabChange = (ev, newValue) => {
    if (newValue === Number(TABS[tab])) {
      return;
    }

    setTab(TABS[newValue]);
  };

  const tabDom = Object.keys(PANELS).map(name => {
    return html`<${Tab} label=${name} />`;
  });

  return html`
    <div ref=${tabBar}>
      <${AppBar} position=static>
        <${Tabs} ref=${tabBar} value=${TABS[tab]} onChange=${onTabChange}>
          ${tabDom}
        <//>
      <//>
    </div>
    <div class=app ref=${app}>
      <${PANELS[tab]} />
    </div>
  `;
}

module.exports = withConfig(withTheme(App));

const {
  html, css, useState,
  Material: M
} = require('../tools/ui.js');
const { useConfig, withConfig } = require('../tools/config.js');
const { Queue, withQueue } = require('../Queue/Queue.js');
const { withTheme } = require('../tools/theme.js');

const TabBar = require('../TabBar/TabBar.js');
const VideoX264 = require('../VideoX264/VideoX264.js');
const VideoInfo = require('../VideoInfo/VideoInfo.js');
const VideoLUTs = require('../VideoLUTs/VideoLUTs.js');
const Frame = require('../Frame/Frame.js');

css('./App.css');

const TABS = [
  ['transcode', VideoX264],
  ['info', VideoInfo],
  ['LUTs', VideoLUTs],
].reduce((obj, [name, Component], idx) => Object.defineProperties(obj, {
  [idx]: {
    enumerable: false,
    value: { idx, name, Component }
  },
  [name]: {
    enumerable: true,
    value: { idx, name, Component }
  }
}), {});

const NAME = 'default-tab';

function App() {
  const config = useConfig();
  const configTab = config.get(NAME);
  const [tab, setTab] = useState(TABS[configTab] ? configTab : TABS[0].name);

  const onTabChange = (ev, newValue) => {
    if (newValue === TABS[tab].idx) {
      return;
    }

    const newTabName = TABS[newValue].name;

    config.set(NAME, newTabName);
    setTab(newTabName);
  };

  const tabDom = Object.keys(TABS).map(name => {
    return html`<${M`Tab`} label=${name} />`;
  });

  return html`
    <${Frame} />
    <${TabBar} selected=${TABS[tab].idx} onChange=${onTabChange}>
      ${tabDom}
    <//>
    <div class="wrapper">
      <div class="app">
        <${TABS[tab].Component} />
      </div>
    </div>
    <${Queue} />
  `;
}

module.exports = withConfig(withTheme(withQueue(App)));

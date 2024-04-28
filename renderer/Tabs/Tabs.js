const { html, createContext, useContext, Material: M } = require('../tools/ui.js');
const { useConfigSignal } = require('../tools/config.js');

const TABS = [
  ['capture', require('../Capture/Capture.js')],
  ['transcode', require('../VideoX264/VideoX264.js')],
  ['info', require('../VideoInfo/VideoInfo.js')],
  ['LUTs', require('../VideoLUTs/VideoLUTs.js')],
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

const TabContext = createContext({});

const withTabs = Component => ({ children, ...props }) => {
  const tab = useConfigSignal('default-tab', TABS[0].name);

  const tabDom = Object.keys(TABS).map(name => {
    return html`<${M`Tab`} label=${name} />`;
  });

  const onTabChange = (ev, newValue) => {
    if (newValue === TABS[tab.value].idx) {
      return;
    }

    tab.value = TABS[newValue].name;
  };

  const TabBar = () => html`
    <div>
      <${M`AppBar`} position=static>
        <${M`Tabs`} value=${TABS[tab.value].idx} onChange=${onTabChange} variant=scrollable scrollButtons=auto>
          ${tabDom}
        <//>
      <//>
    </div>
  `;

  const Tab = () => html`<${TABS[tab.value].Component} />`;

  return html`
    <${TabContext.Provider} value=${{ Tab, TabBar }}>
      <${Component} ...${props}>${children}<//>
    <//>
  `;
};

const useTabs = () => useContext(TabContext);

module.exports = { useTabs, withTabs, TABS };

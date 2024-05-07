const { html, css, createContext, useContext, Material: M, useSignalEffect, batch } = require('../tools/ui.js');
const { useConfigSignal } = require('../tools/config.js');
const { useTransparent } = require('../tools/transparent.js');
const { useShortcuts } = require('../tools/shortcuts.js');
const { useCapture } = require('../Capture/Capture.js');

css('./Tabs.css');

const TABS = [
  ['capture', require('../Capture/Capture.js').Capture],
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
  const defaultTab = TABS[0].name;
  const tab = useConfigSignal('default-tab', defaultTab);
  const { isTransparent } = useTransparent();
  const { captureVideo, events: shortcutEvents } = useShortcuts();
  const { view: captureView, VIEWS: CAPTURE_VIEWS } = useCapture();

  const tabDom = Object.keys(TABS).map(name => {
    return html`<${M`Tab`} label=${name} />`;
  });

  const onTabChange = (ev, newValue) => {
    if (TABS[tab.value] && newValue === TABS[tab.value].idx) {
      return;
    }

    tab.value = TABS[newValue].name;
  };

  const selectedTab = TABS[tab.value] || TABS[defaultTab];

  const TabBar = () => isTransparent.value ? undefined : html`
    <div class="tab-bar">
      <${M`AppBar`} position=static>
        <${M`Tabs`} value=${selectedTab.idx} onChange=${onTabChange} scrollButtons=auto>
          ${tabDom}
        <//>
      <//>
    </div>
  `;

  const Tab = () => html`<${selectedTab.Component} class="tab-panel" />`;

  useSignalEffect(() => {
    const name = captureVideo.value;
    const events = shortcutEvents.value;

    const onCaptureVideo = () => {
      batch(() => {
        // this signals to the Capture tab to be in recording mode
        // and skip setup screen
        captureView.value = CAPTURE_VIEWS.capture;
        tab.value = TABS.capture.name;
      });
    };

    events.on(name, onCaptureVideo);

    return () => {
      events.off(name, onCaptureVideo);
    };
  });

  return html`
    <${TabContext.Provider} value=${{ Tab, TabBar }}>
      <${Component} ...${props}>${children}<//>
    <//>
  `;
};

const useTabs = () => useContext(TabContext);

module.exports = { useTabs, withTabs, TABS };

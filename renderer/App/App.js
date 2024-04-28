const { html, css } = require('../tools/ui.js');
const { withConfig } = require('../tools/config.js');
const { Queue, withQueue } = require('../Queue/Queue.js');
const { withTheme } = require('../tools/theme.js');
const { withTabs, useTabs } = require('../Tabs/Tabs.js');

const Frame = require('../Frame/Frame.js');

css('./App.css');

function App() {
  const { Tab, TabBar } = useTabs();

  return html`
    <${Frame} />
    <${TabBar} />
    <div class="wrapper">
      <div class="app">
        <${Tab} />
      </div>
    </div>
    <${Queue} />
  `;
}

module.exports = withConfig(withTheme(withQueue(withTabs(App))));

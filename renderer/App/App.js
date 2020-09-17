const { html, css } = require('../tools/ui.js');
const { withConfig } = require('../tools/config.js');
const { withTheme } = require('../tools/theme.js');

const VideoContainer = require('../VideoContainer/VideoContainer.js');

css('./App.css');

function App() {
  return html`
    <div class=app>
      <${VideoContainer} />
    </div>
  `;
}

module.exports = withConfig(withTheme(App));

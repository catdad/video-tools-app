const { Button, html, css, useContext, useState } = require('../tools/ui.js');
const { withConfig, Config } = require('../tools/config.js');

const VideoContainer = require('../VideoContainer/VideoContainer.js');

css('./App.css');

function App() {
//  const config = useContext(Config);

  return html`
    <div class=app>
      <${VideoContainer} />
    </div>
  `;
}

module.exports = withConfig(App);

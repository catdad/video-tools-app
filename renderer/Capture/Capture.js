const path = require('path');

const { html, Material: M } = require('../tools/ui.js');
const { useConfigSignal, useConfigPaths } = require('../tools/config.js');

const videoTools = require('../../lib/video-tools.js');

function Capture() {
  const { desktop } = useConfigPaths();
  const outputDirectory = useConfigSignal('capture.output', desktop);

  const onStart = () => {
    console.log('start recording');
  };

  return html`
    <div class="tab-panel capture">
      <h2>Screen recording</h2>
      <${M`Button`} onClick=${onStart}>start<//>
    </div>
  `;
}

module.exports = Capture;

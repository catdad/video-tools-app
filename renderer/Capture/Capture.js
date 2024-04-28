const path = require('path');

const { html, Material: M } = require('../tools/ui.js');
const { useConfigSignal, useConfigPaths } = require('../tools/config.js');

const videoTools = require('../../lib/video-tools.js');

function Capture() {
  const { desktop } = useConfigPaths();
  const outputDirectory = useConfigSignal('capture.output', desktop);

  const onStart = () => {
    videoTools.exec('desktop', [{
      offsetX: 0,
      offsetY: 0,
      x: 0,
      y: 0,
      width: 500,
      height: 500,
      output: path.resolve(outputDirectory.value, `Screen Recording - ${new Date().toISOString().replace(/:/g, '-')}.mp4`)
    }])
      .then(() => console.log('done!'))
      .catch(err => console.log('failed:', err));
  };

  return html`
    <div class="tab-panel capture">
      <h2>Screen recording</h2>
      <${M`Button`} onClick=${onStart}>start<//>
    </div>
  `;
}

module.exports = Capture;

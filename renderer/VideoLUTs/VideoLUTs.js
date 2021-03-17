const path = require('path');
const glob = require('fast-glob');

const {
  Card, CardContent, ObjectList,
  html, css, useContext, useState
} = require('../tools/ui.js');
const toast = require('../tools/toast.js');
//const videoTools = require('../../lib/video-tools.js');

const FileInput = require('../FileInput/FileInput.js');
//const NamingFields = require('../NamingFields/NamingFields.js');

const { Config, withConfig } = require('../tools/config.js');

css('../styles/tab-panel.css');

const LUTS_DIR = 'videoluts.luts-dir';

function VideoLUTs() {
  const config = useContext(Config);
  const [luts, setLuts] = useState(null);

  const onLUTs = ([dir]) => {
    if (!dir) return;

    (async () => {
      const dirPath = dir.path;

      // TODO seems like the promise-based version hangs?
      const cubes = glob.sync(['**/*.cube'], { cwd: dirPath });

      config.set(LUTS_DIR, dirPath);
      setLuts({
        cwd: dirPath,
        luts: cubes
      });
    })().catch(err => {
      /* eslint-disable-next-line no-console */
      console.error('could not load LUTs:', err);
      toast.error(`could not load LUTs:\n${err.message}`);
    });
  };

  if (luts === null && config.get(LUTS_DIR)) {
    onLUTs([{ path: config.get(LUTS_DIR) }]);
  }

  if (luts === null) {
    return html`
      <div class=tab-panel>
        <h2>Drag a LUTs folder</h2>
        <${FileInput} nobutton onchange=${onLUTs} />
      </div>
    `;
  }

  const lutsMap = luts.luts.reduce((memo, item) => {
    const name = path.basename(item);
    const dir = path.dirname(item);

    memo[dir] = memo[dir] || [];
    memo[dir].push(name);

    return memo;
  }, {});

  return html`
    <div class=tab-panel>
      <h2>LUTs</h2>

      <${Card} raised className=card >
        <${CardContent}>
          <${ObjectList} value=${lutsMap} />
        <//>
      <//>
    </div>`;
}

module.exports = withConfig(VideoLUTs);

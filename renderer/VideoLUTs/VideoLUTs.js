const path = require('path');
const glob = require('fast-glob');
const fs = require('fs');

const {
  Card, CardContent, ObjectList,
  html, css, useContext, useState
} = require('../tools/ui.js');
const toast = require('../tools/toast.js');
const videoTools = require('../../lib/video-tools.js');

const FileInput = require('../FileInput/FileInput.js');
//const NamingFields = require('../NamingFields/NamingFields.js');

const { Config, withConfig } = require('../tools/config.js');

css('../styles/tab-panel.css');
css('./VideoLUTs.css');

const LUTS_DIR = 'videoluts.luts-dir';

const exists = async file => {
  try {
    // TODO seems like the promise-based version hangs?
    fs.statSync(file);
    return true;
  } catch (e) {
    return false;
  }
};

function VideoLUTs() {
  const config = useContext(Config);
  const [luts, setLuts] = useState(null);
  const [image, setImage] = useState(null);
  const [editedImage, setEditedImage] = useState(null);

  const onLUTs = ([dir] = []) => {
    if (!dir) return;

    const { path: dirPath } = dir;

    (async () => {
      const real = await exists(dirPath);

      if (!real) {
        return;
      }

      // TODO seems like the promise-based version hangs?
      const cubes = glob.sync(['**/*.cube'], { cwd: dirPath });

      config.set(LUTS_DIR, dirPath);
      setLuts({
        cwd: dirPath,
        list: cubes
      });
    })().catch(err => {
      /* eslint-disable-next-line no-console */
      console.error('could not load LUTs:', err);
      toast.error(`could not load LUTs:\n${err.message}`);
    });
  };

  const onImage = ([img] = []) => {
    if (!img) return;

    setEditedImage(null);
    setImage(img.path);
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

  const onLut = which => () => {
    if (!image) return;

    const outdir = path.dirname(image);
    const lutname = path.basename(which);
    const imgname = path.basename(image);
    const output = path.resolve(outdir, `${imgname}.${lutname}.${Math.random()}.jpg`);

    const args = { input: image, output, lut: which };

    videoTools.exec('lut', [args]).then(() => {
      setEditedImage(output);
    }).catch(err => {
      setEditedImage(null);
      console.log('ERROR APPLYING LUT', err);
    });
  };

  const lutsMap = luts.list.reduce((memo, item) => {
    const name = path.basename(item);
    const dir = path.dirname(item);

    memo[dir] = memo[dir] || {};
    memo[dir][name] = onLut(path.resolve(luts.cwd, item));

    return memo;
  }, {});

  const renderedLuts = html`
    <h2>LUTs</h2>
    <${Card} raised className=card >
      <${CardContent}>
        <${ObjectList} value=${lutsMap} />
      <//>
    <//>
  `;

  const renderedImage = image ?
    html`
      <img src="${editedImage || image}" />
      <${FileInput} nobutton onchange=${onImage} />
    ` :
    html`
      <h2>Drag an image to render</h2>
      <${FileInput} nobutton onchange=${onImage} />
    `;

  return html`
    <div class="tab-panel video-luts">
      ${renderedImage}
      ${renderedLuts}
    </div>`;
}

module.exports = withConfig(VideoLUTs);

const path = require('path');
const { pipeline } = require('stream');
const { promisify } = require('util');
const fs = require('fs-extra');
const glob = require('fast-glob');
const byline = require('byline');
const through = require('through2');
const { clipboard, nativeImage } = require('electron');

const {
  Card, CardContent, ObjectList,
  html, css, useContext, useState
} = require('../tools/ui.js');
const toast = require('../tools/toast.js');
const videoTools = require('../../lib/video-tools.js');
const { usingFile } = require('../../lib/temp.js');

const FileInput = require('../FileInput/FileInput.js');

const { Config, withConfig } = require('../tools/config.js');

css('../styles/tab-panel.css');
css('./VideoLUTs.css');

const LUTS_DIR = 'videoluts.luts-dir';

const findCubes = async (cwd) => {
  const cubes = await glob(['**/*.cube', '**/*.CUBE'], { cwd });

  return cubes.sort((a, b) => a.localeCompare(b));
};

const Panel = ({ class: className, title, children }) => html`
  <div class="panel ${className}">
    <h2>${title}</h2>
    <div class="panel-body">
      ${children}
    </div>
  </div>
`;

function VideoLUTs() {
  const config = useContext(Config);
  const [luts, setLuts] = useState(null);
  const [data, setData] = useState({});

  const { image, editedImageUrl, editedImageBuffer, downloadName } = data;

  const onLUTs = ([dir] = []) => {
    if (!dir) return;

    const { path: dirPath } = dir;

    Promise.resolve().then(async () => {
      const real = await fs.pathExists(dirPath);

      if (!real) {
        return;
      }

      const cubes = await findCubes(dirPath);

      config.set(LUTS_DIR, dirPath);
      setLuts({
        cwd: dirPath,
        list: cubes
      });
    }).catch(err => {
      /* eslint-disable-next-line no-console */
      console.error('could not load LUTs:', err);
      toast.error(`could not load LUTs:\n${err.message}`);
    });
  };

  const onImage = ([img] = []) => {
    if (!img) return;

    setData({
      image: img.path,
      editedImageUrl: null,
      editedImageBuffer: null
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

  const copyLut = async (from, to) => {
    await promisify(pipeline)(
      fs.createReadStream(from, { encoding: 'utf8' }),
      byline.createStream(),
      through((line, _, cb) => {
        if (/^[0-9]/.test(line)) {
          return cb(null, `${line}\n`);
        }

        if (/^LUT_3D_SIZE/.test(line)) {
          return cb(null, `${line}\n`);
        }

        return cb();
      }),
      fs.createWriteStream(to)
    );
  };

  const onLut = lut => () => {
    if (!image) return;

    (async () => {
      const name = `${path.parse(image).name}.${path.parse(lut).name}.jpg`;

      const { url, buffer } = await usingFile({ prefix: 'lut-', extension: 'cube' }, async (lutCopy) => {
        // TODO this is slower than I would like
        await copyLut(lut, lutCopy);

        const args = { input: image, output: '-', lib: true, lut: lutCopy };

        const img = await videoTools.exec('lut', [args]);
        const buffer = Buffer.from(img);
        const url = `data:image/jpeg;base64,${buffer.toString('base64')}`;

        return { url, buffer };
      });

      setData({
        ...data,
        editedImageUrl: url,
        editedImageBuffer: buffer,
        downloadName: name
      });
    })().catch(() => {
      setData({
        ...data,
        editedImageUrl: null,
        editedImageBuffer: null
      });
      toast.error(`Failed to apply "${lut}" LUT`);
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
    <${Panel} class="luts" title="LUTs">
      <${Card} raised className="card" >
        <${CardContent}>
          <${ObjectList} value=${lutsMap} />
        <//>
      <//>
    <//>
  `;

  const onCopy = () => void clipboard.writeImage(nativeImage.createFromBuffer(editedImageBuffer));
  const onReset = () => void setData({ ...data, editedImageUrl: null, editedImageBuffer: null });

  const renderedImage = image ?
    html`
      <${Panel} class="img" title="${editedImageUrl ? `Edited Image (${downloadName})` : 'Original Image'}">
        <img src="${editedImageUrl || image}" />
        <div class="buttons">
          <button onclick=${onCopy} disabled=${!editedImageBuffer}>Copy</button>
          <button onclick=${onReset} disabled=${!editedImageBuffer}>Reset</button>
        </div>
        <${FileInput} nobutton onchange=${onImage} />
      <//>
    ` :
    html`
      <${Panel} class="img" title="Drag an image to render">
        <${FileInput} nobutton onchange=${onImage} />
      <//>
    `;

  return html`
    <div class="tab-panel video-luts">
      ${renderedImage}
      ${renderedLuts}
    </div>`;
}

module.exports = withConfig(VideoLUTs);

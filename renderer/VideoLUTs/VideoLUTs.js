const path = require('path');
const { pipeline } = require('stream');
const { promisify } = require('util');
const fs = require('fs-extra');
const glob = require('fast-glob');
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
const LUTS_IMG = 'videoluts.luts-img';

const findCubes = async (cwd) => {
  const cubes = await glob(['**/*.cube', '**/*.CUBE'], { cwd });

  return cubes.sort((a, b) => a.localeCompare(b));
};

const readLine = text => {
  const linefeed = text.indexOf('\n');
  return {
    line: text.slice(0, linefeed),
    remainder: text.slice(linefeed + 1)
  };
};

const copyLut = async (from, to) => {
  let numLines = 0;
  const controlNumLines = 5;

  await promisify(pipeline)(
    fs.createReadStream(from),
    // most luts will contain the DOMAIN parameters at the top
    // so once we get to the lookup table we have parsed the entire
    // header and there is no need to continue parsing lines
    through((chunk, _, cb) => {
      if (numLines > controlNumLines) {
        return cb(null, chunk);
      }

      let result = '';
      let remainder = chunk.toString();
      let line = '';

      while (remainder.indexOf('\n') >= 0) {
        ({ line, remainder } = readLine(remainder));

        if (/^[0-9]/.test(line)) {
          numLines += 1;
          result += `${line}\n`;
        } else if (/^LUT_3D_SIZE/.test(line)) {
          result += `${line}\n`;
        }

        if (numLines > controlNumLines) {
          return cb(null, `${result}${remainder}`);
        }
      }

      return cb(null, result);
    }),
    fs.createWriteStream(to)
  );
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
      if (!(await fs.pathExists(dirPath))) return;

      const cubes = await findCubes(dirPath);

      config.set(LUTS_DIR, dirPath);
      setLuts({
        cwd: dirPath,
        list: cubes
      });
    }).catch(err => {
      toast.error(`could not load LUTs:\n${err.message}`);
    });
  };

  const onImage = ([img] = []) => {
    if (!img) return;

    const { path: image } = img;

    Promise.resolve().then(async () => {
      if (!(await fs.pathExists(image))) return;

      setData({
        image,
        editedImageUrl: null,
        editedImageBuffer: null
      });
      config.set(LUTS_IMG, img.path);
    }).catch(err => {
      toast.error(`could not load image:\n${err.message}`);
    });
  };

  if (luts === null && config.get(LUTS_DIR)) {
    onLUTs([{ path: config.get(LUTS_DIR) }]);
  }

  if (!data.image && config.get(LUTS_IMG)) {
    onImage([{ path: config.get(LUTS_IMG) }]);
  }

  if (luts === null) {
    return html`
      <div class=tab-panel>
        <h2>Drag a LUTs folder</h2>
        <${FileInput} nobutton onchange=${onLUTs} />
      </div>
    `;
  }

  const onLut = lut => () => {
    if (!image) return;

    (async () => {
      const name = `${path.parse(image).name}.${path.parse(lut).name}.jpg`;

      const { url, buffer } = await usingFile({ prefix: 'lut-', extension: 'cube' }, async (lutCopy) => {
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
      <//>
    ` :
    html`
      <${Panel} class="img" title="Drag an image to render" />
    `;

  return html`
    <div class="tab-panel video-luts">
      <${FileInput} nobutton onchange=${onImage}>${renderedImage}<//>
      <${FileInput} nobutton onchange=${onLUTs}>${renderedLuts}<//>
    </div>`;
}

module.exports = withConfig(VideoLUTs);

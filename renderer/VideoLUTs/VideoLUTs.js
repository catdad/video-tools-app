const path = require('path');
const { pipeline } = require('stream');
const { promisify } = require('util');
const fs = require('fs-extra');
const glob = require('fast-glob');
const through = require('through2');
const { clipboard, nativeImage } = require('electron');

const {
  Card, CardContent, ObjectList, PrimaryButton,
  html, css, useSignal, batch
} = require('../tools/ui.js');
const toast = require('../tools/toast.js');
const videoTools = require('../../lib/video-tools.js');
const { usingFile } = require('../../lib/temp.js');

const FileInput = require('../FileInput/FileInput.js');

const { useConfig, useConfigSignal } = require('../tools/config.js');
const { useEffect } = require('react');

css('../styles/tab-panel.css');
css('./VideoLUTs.css');

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
  const lutsDir = useConfigSignal('videoluts.luts-dir');
  const lutsImg = useConfigSignal('videoluts.luts-img');

  const luts = useSignal();
  const renderedUrl = useSignal();
  const renderedBuffer = useSignal();
  const renderedName = useSignal();

  const onLutSelected = lut => {
    const image = lutsImg.value;

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

      batch(() => {
        renderedUrl.value = url;
        renderedBuffer.value = buffer;
        renderedName.value = name;
      });
    })().catch(() => {
      toast.error(`Failed to apply "${lut}" LUT`);

      batch(() => {
        renderedUrl.value = null;
        renderedBuffer.value = null;
        renderedName.value = null;
      });
    });
  };

  const openLuts = (dirPath) => {
    Promise.resolve().then(async () => {
      if (!(await fs.pathExists(dirPath))) return;

      const list = await findCubes(dirPath);
      const map = list.reduce((memo, item) => {
        const name = path.basename(item);
        const dir = path.dirname(item);
        const filepath = path.resolve(dirPath, item);

        memo[dir] = memo[dir] || {};
        memo[dir][name] = () => void onLutSelected(filepath);

        return memo;
      }, {});

      luts.value = {
        cwd: dirPath,
        list,
        map
      };
    }).catch(err => {
      toast.error(`could not load LUTs:\n${err.message}`);
    });
  };

  const onLUTs = ([dir] = []) => {
    if (!dir) return;
    lutsDir.value = dir.path;
  };

  const openImage = (image) => {
    Promise.resolve().then(async () => {
      if (!(await fs.pathExists(image))) return;

      batch(() => {
        renderedUrl.value = null;
        renderedBuffer.value = null;
      });
    }).catch(err => {
      toast.error(`could not load image:\n${err.message}`);
    });
  };

  const onImage = ([img] = []) => {
    if (!img) return;
    lutsImg.value = img.path;
  };

  // using signal's effect seems to make this an infinite loop 🤷‍♀️
  useEffect(() => {
    if (lutsDir.value) {
      openLuts(lutsDir.value);
    }

    if (lutsImg.value) {
      openImage(lutsImg.value);
    }
  }, [lutsDir.value, lutsImg.value]);

  if (!luts.value) {
    return html`
      <div class=tab-panel>
        <h2>Drag a LUTs folder</h2>
        <${FileInput} nobutton onchange=${onLUTs} />
      </div>
    `;
  }

  const renderedLuts = html`
    <${Panel} class="luts" title="LUTs">
      <${Card} raised className="card" >
        <${CardContent}>
          <${ObjectList} value=${luts.value.map} />
        <//>
      <//>
    <//>
  `;

  const onCopy = () => void clipboard.writeImage(nativeImage.createFromBuffer(renderedBuffer.value));
  const onReset = () => void batch(() => {
    renderedUrl.value = null;
    renderedBuffer.value = null;
    renderedName.value = null;
  });

  const renderedImage = lutsImg.value ?
    html`
      <${Panel} class="img" title="${renderedUrl.value ? `Edited Image (${renderedName.value})` : 'Original Image'}">
        <img src="${renderedUrl.value || lutsImg.value}" />
        <div class="buttons">
          <${PrimaryButton} onclick=${onCopy} disabled=${!renderedBuffer.value}>Copy<//>
          <${PrimaryButton} onclick=${onReset} disabled=${!renderedBuffer.value}>Reset<//>
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

module.exports = VideoLUTs;

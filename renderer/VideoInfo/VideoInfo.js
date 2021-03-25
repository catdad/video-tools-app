const prettyMs = require('pretty-ms');
const prettyBytes = require('pretty-bytes');
const { get } = require('lodash');

const {
  Card, CardContent, ObjectList,
  html, css, useState
} = require('../tools/ui.js');

const toast = require('../tools/toast.js');
const videoTools = require('../../lib/video-tools.js');
const FileInput = require('../FileInput/FileInput.js');

css('../styles/tab-panel.css');
css('./VideoInfo.css');

const getMeta = async files => {
  const results = [];

  for (let file of files) {
    const data = {
      name: file.name,
      path: file.path,
      bytes: file.size,
      type: file.type,
    };

    try {
      const meta = await videoTools.exec('meta', [{ input: file.path }]);
      results.push({ ...data, ...meta });
    } catch (e) {
      results.push({ ...data, ...{ ok: false, error: e }});
    }
  }

  return results;
};

function VideoInfo() {
  const [files, setFiles] = useState([]);

  const onFiles = files => {
    getMeta(files).then(meta => {
      setFiles(meta);
    }).catch(err => {
      toast.error(`failed to get metadata:\n${err.message}`);
    });
  };

  const elems = files.map(file => {
    const { name, path, bytes, type, audio, video } = file;
    const seconds = get(file, 'video.duration', 0);
    const duration = prettyMs(Number(seconds) * 1000);
    const size = `${prettyBytes(bytes)}  (${bytes} bytes)`;

    // this object sets the order of the UI
    // yes, I know order is technically not guaranteed, but it works
    // well enough and I am lazy
    const data = { path, type, size, duration, audio, video };

    return html`
      <${Card} raised className=card >
        <${CardContent}>
          <h3>${name}</h3>
          <${ObjectList} value=${data} />
        <//>
      <//>
    `;
  });

  return html`
    <div class="tab-panel video-info">
      <h2>Drag files here to see metadata</h2>
      <${FileInput} nobutton onchange=${onFiles} />
      ${elems}
    </div>
  `;
}

module.exports = VideoInfo;

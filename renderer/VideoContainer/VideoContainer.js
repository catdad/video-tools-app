const path = require('path');

const { html, css, useState } = require('../tools/ui.js');
const toast = require('../tools/toast.js');
const videoTools = require('../../lib/video-tools.js');

const FileInput = require('../FileInput/FileInput.js');
const NamingFields = require('../NamingFields/NamingFields.js');

css('../styles/tab-panel.css');

function VideoContainer() {
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [format, setFormat] = useState('mp4');

  const onQueue = (files) => {
    for (let file of files) {
      if (!/^video/.test(file.type || '')) {
        toast.error(`cannot convert "${file.name}" of type "${file.type}"`);
        continue;
      }

      const _suffix = suffix ? suffix :
        path.parse(file.path).ext === `.${format}` ? '.container' : '';

      videoTools.queue('container', [{
        input: file.path,
        format,
        prefix,
        suffix: _suffix
      }]).then(() => {
        toast.success(`"${file.name}" is complete`);
      }).catch(err => {
        toast.error(`"${file.name}" failed:\n${err.message}`);
      });
    }
  };

  const children = [];

  children.push(
    html`<${NamingFields} nooutput ...${{
      prefix, setPrefix,
      suffix, setSuffix,
      format, setFormat
    }}/>`
  );

  return html`
    <div class=tab-panel>
      <h2>Drag files here to change the video container</h2>
      <${FileInput} nobutton onchange=${onQueue} />
      ${children}
    </div>
  `;
}

module.exports = VideoContainer;

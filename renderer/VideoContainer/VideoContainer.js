const path = require('path');

const { html, css, useState } = require('../tools/ui.js');
const toast = require('../tools/toast.js');

const FileInput = require('../FileInput/FileInput.js');
const NamingFields = require('../NamingFields/NamingFields.js');
const { useQueue } = require('../Queue/Queue.js');

css('../styles/tab-panel.css');

function VideoContainer() {
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [format, setFormat] = useState('mp4');

  const { add: addToQueue } = useQueue();

  const onQueue = (files) => {
    const newItems = files.filter(file => {
      if (!/^video/.test(file.type || '')) {
        toast.error(`cannot convert "${file.name}" of type "${file.type}"`);
        return false;
      }

      return true;
    }).map(file => {
      const _suffix = suffix ? suffix :
      path.parse(file.path).ext === `.${format}` ? '.container' : '';

      return {
        command: 'container',
        filepath: file.path,
        filename: file.name,
        args: [{
          input: file.path,
          format,
          prefix,
          suffix: _suffix
        }]
      };
    });

    if (newItems.length) {
      addToQueue(...newItems);
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

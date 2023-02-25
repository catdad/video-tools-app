const path = require('path');

const { html, css } = require('../tools/ui.js');
const { useConfigSignal } = require('../tools/config.js');
const toast = require('../tools/toast.js');

const FileInput = require('../FileInput/FileInput.js');
const NamingFields = require('../NamingFields/NamingFields.js');
const { useQueue } = require('../Queue/Queue.js');

css('../styles/tab-panel.css');

function VideoContainer() {
  const prefix = useConfigSignal('videocontainer.prefix', '');
  const suffix = useConfigSignal('videocontainer.suffix', '');
  const format = useConfigSignal('videocontainer.format', 'mp4');

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

  return html`
    <div class=tab-panel>
      <h2>Drag files here to change the video container</h2>
      <${FileInput} nobutton onchange=${onQueue} />
      <${NamingFields} nooutput ...${{ prefix, suffix, format }}/>
    </div>
  `;
}

module.exports = VideoContainer;

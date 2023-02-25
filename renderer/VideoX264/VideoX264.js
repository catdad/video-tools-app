const path = require('path');
const os = require('os');
const cpus = os.cpus().length;

const { FormControlLabel, Slider, Switch, html, css } = require('../tools/ui.js');
const { useConfigSignal } = require('../tools/config.js');
const toast = require('../tools/toast.js');

const FileInput = require('../FileInput/FileInput.js');
const NamingFields = require('../NamingFields/NamingFields.js');
const { useQueue } = require('../Queue/Queue.js');

css('../styles/tab-panel.css');

function VideoX264() {
  const prefix = useConfigSignal('videox264.prefix', '');
  const suffix = useConfigSignal('videox264.suffix', '');
  const format = useConfigSignal('videox264.format', 'mp4');
  const audio = useConfigSignal('videox264.audio', true);
  const video = useConfigSignal('videox264.video', true);
  const threads = useConfigSignal('videox264.threads', Math.floor(cpus / 2));

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
        path.parse(file.path).ext === `.${format}` ? '.repack' : '';

      return {
        command: 'x264',
        filepath: file.path,
        filename: file.name,
        args: [{
          input: file.path,
          video,
          audio,
          format,
          prefix,
          suffix: _suffix,
          threads
        }]
      };
    });

    if (newItems.length) {
      addToQueue(...newItems);
    }
  };

  const controlsDom = html`
    <h3>Transcode</h3>
    <p><i>Channels that are not transcoded will be copied directly.</i></p>
    <div>
      <${FormControlLabel}
        control=${html`<${Switch} checked=${audio.value} onChange=${(e, v) => (audio.value = v)} />`}
        label="Transcode Audio"
      />
      <${FormControlLabel}
        control=${html`<${Switch} checked=${video.value} onChange=${(e, v) => (video.value = v)} />`}
        label="Transcode Video"
      />
    </div>
    <div style=${{ width: 'clamp(100px, 80vw, 300px)' }} >
      <p>Threads</p>
      <${Slider}
        value=${threads.value}
        step=${1} min=${1} max=${cpus} marks
        valueLabelDisplay=on
        onChange=${(e, v) => (threads.value = v)}
      />
    </div>
  `;

  return html`
    <div class=tab-panel>
      <h2>Drag files here to encode to x264</h2>
      <${FileInput} nobutton onchange=${onQueue} />
      ${controlsDom}
      <${NamingFields} nooutput ...${{ prefix, suffix, format }}/>
    </div>
  `;
}

module.exports = VideoX264;

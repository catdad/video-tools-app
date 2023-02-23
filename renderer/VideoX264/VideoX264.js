const path = require('path');
const os = require('os');
const cpus = os.cpus().length;

const { FormControlLabel, Slider, Switch, html, css, useState, useEffect } = require('../tools/ui.js');
const toast = require('../tools/toast.js');
const videoTools = require('../../lib/video-tools.js');

const FileInput = require('../FileInput/FileInput.js');
const NamingFields = require('../NamingFields/NamingFields.js');
const { useQueue } = require('../Queue/Queue.js');

css('../styles/tab-panel.css');

function VideoX264() {
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [format, setFormat] = useState('mp4');
  const [audio, setAudio] = useState(true);
  const [video, setVideo] = useState(true);
  const [threads, setThreads] = useState(Math.floor(cpus / 2));

  const { items: queueItems } = useQueue();

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
      queueItems.value = [...queueItems.value, ...newItems];
    }
  };

  const controlsDom = html`
    <h3>Transcode</h3>
    <p><i>Channels that are not transcoded will be copied directly.</i></p>
    <div>
      <${FormControlLabel}
        control=${html`<${Switch} checked=${audio} onChange=${(e, v) => setAudio(v)} />`}
        label="Transcode Audio"
      />
      <${FormControlLabel}
        control=${html`<${Switch} checked=${video} onChange=${(e, v) => setVideo(v)} />`}
        label="Transcode Video"
      />
    </div>
    <div style=${{ width: 'clamp(100px, 80vw, 300px)' }} >
      <p>Threads</p>
      <${Slider}
        value=${threads}
        step=${1} min=${1} max=${cpus} marks
        valueLabelDisplay=on
        onChange=${(e, v) => v === threads ? void 0 : setThreads(v)}
      />
    </div>
  `;

  const namingDom = html`<${NamingFields} nooutput ...${{
    prefix, setPrefix,
    suffix, setSuffix,
    format, setFormat
  }}/>`;

  return html`
    <div class=tab-panel>
      <h2>Drag files here to encode to x264</h2>
      <${FileInput} nobutton onchange=${onQueue} />
      ${controlsDom}
      ${namingDom}
    </div>
  `;
}

module.exports = VideoX264;

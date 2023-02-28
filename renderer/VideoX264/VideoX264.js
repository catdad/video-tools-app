const path = require('path');
const os = require('os');
const cpus = os.cpus().length;

const { FormControlLabel, Slider, Toggle, html, css } = require('../tools/ui.js');
const { useConfigSignal } = require('../tools/config.js');
const toast = require('../tools/toast.js');

const FileInput = require('../FileInput/FileInput.js');
const NamingFields = require('../NamingFields/NamingFields.js');
const { useQueue } = require('../Queue/Queue.js');

css('../styles/tab-panel.css');
css('./VideoX264.css');

function VideoX264() {
  const prefix = useConfigSignal('videox264.prefix', '');
  const suffix = useConfigSignal('videox264.suffix', '');
  const format = useConfigSignal('videox264.format', 'mp4');
  const audio = useConfigSignal('videox264.audio', 'aac');
  const video = useConfigSignal('videox264.video', 'h264');
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
      const expectSameFormat = path.parse(file.path).ext === `.${format}`;
      const _suffix = suffix.value || (expectSameFormat ? '.repack' : '');

      return {
        command: 'x264',
        filepath: file.path,
        filename: file.name,
        args: [{
          input: file.path,
          video: video.value,
          audio: audio.value,
          format: format.value,
          prefix: prefix.value,
          suffix: _suffix,
          threads: threads.value
        }]
      };
    });

    if (newItems.length) {
      addToQueue(...newItems);
    }
  };

  const controlsDom = html`
    <h3>Transcode</h3>
    <div>
      <${FormControlLabel}
        classes=${{ root: 'toggle' }}
        control=${html`<${Toggle} values=${['aac', 'mp3', 'copy']} value=${audio.value} onChange=${(v) => (audio.value = v)} />`}
        label="Audio" labelPlacement=start
      />
      <${FormControlLabel}
        classes=${{ root: 'toggle' }}
        control=${html`<${Toggle} values=${['h264', 'copy']} value=${video.value} onChange=${(v) => (video.value = v)} />`}
        label="Video" labelPlacement=start
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
    <div class="tab-panel video-x264">
      <h2>Drag files to convert here</h2>
      <${FileInput} nobutton onchange=${onQueue} />
      ${controlsDom}
      <${NamingFields} nooutput ...${{ prefix, suffix, format }}/>
    </div>
  `;
}

module.exports = VideoX264;

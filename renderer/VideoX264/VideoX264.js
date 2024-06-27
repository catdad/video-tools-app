const path = require('path');
const os = require('os');
const cpus = os.cpus().length;

const { Toggle, PrimaryTextField: TextField, html, css, Material: M } = require('../tools/ui.js');

const { useConfigSignal } = require('../tools/config.js');
const toast = require('../tools/toast.js');

const FileInput = require('../FileInput/FileInput.js');
const NamingFields = require('../NamingFields/NamingFields.js');
const { useQueue } = require('../Queue/Queue.js');

css('./VideoX264.css');

function VideoX264({ 'class': classNames = ''} = {}) {
  const prefix = useConfigSignal('videox264.prefix', '');
  const suffix = useConfigSignal('videox264.suffix', '');
  const format = useConfigSignal('videox264.format', 'mp4');
  const audio = useConfigSignal('videox264.audio', 'aac');
  const video = useConfigSignal('videox264.video', 'h264');
  const threads = useConfigSignal('videox264.threads', Math.floor(cpus / 2));
  const width = useConfigSignal('videox264.width', '');
  const height = useConfigSignal('videox264.height', '');

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

      const args = {
        input: file.path,
        video: video.value,
        audio: audio.value,
        format: format.value,
        prefix: prefix.value,
        suffix: _suffix,
        threads: threads.value
      };

      if (video.value !== 'copy' && !!width.value) {
        args.width = width.value;
      }

      if (video.value !== 'copy' && !!height.value) {
        args.height = height.value;
      }

      return {
        command: 'x264',
        filepath: file.path,
        filename: file.name,
        args: [args]
      };
    });

    if (newItems.length) {
      addToQueue(...newItems);
    }
  };

  const onWidthInput = ev => (width.value = ev.target.value);
  const onHeightInput = ev => (height.value = ev.target.value);

  const controlsDom = html`
    <h3>Transcode</h3>
    <div>
      <${M`FormControlLabel`}
        classes=${{ root: 'toggle' }}
        control=${html`<${Toggle} values=${['aac', 'mp3', 'copy']} value=${audio.value} onChange=${(v) => (audio.value = v)} />`}
        label="Audio" labelPlacement=start
      />
      <${M`FormControlLabel`}
        classes=${{ root: 'toggle' }}
        control=${html`<${Toggle} values=${['h264', 'copy']} value=${video.value} onChange=${(v) => (video.value = v)} />`}
        label="Video" labelPlacement=start
      />
    </div>
    <div style=${{ width: 'clamp(100px, 80vw, 300px)' }} >
      <p>Threads</p>
      <${M`Slider`}
        value=${threads.value}
        step=${1} min=${1} max=${cpus} marks
        valueLabelDisplay=on
        onChange=${(e, v) => (threads.value = v)}
      />
    </div>
  `;

  const sizeStyle = {
    opacity: video.value === 'copy' ? 0.3 : ''
  };

  return html`
    <div class="${classNames} video-x264">
      <h2>Drag files to convert here</h2>
      <${FileInput} nobutton onchange=${onQueue} />
      ${controlsDom}
      <h3>Options</h3>
      <div style=${{
        width: 'clamp(100px, 80vw, 300px)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <${NamingFields} nooutput ...${{ prefix, suffix, format }}/>
        <hr style=${{
          width: '100%',
          border: '1px dashed #ffffff22'
        }} />
        <${TextField} label="max width" disabled=${video.value === 'copy'} value=${video.value === 'copy' ? '' : width.value} onInput=${onWidthInput} style=${sizeStyle} />
        <${TextField} label="max height" disabled=${video.value === 'copy'} value=${video.value === 'copy' ? '' : height.value} onInput=${onHeightInput} style=${sizeStyle} />
      </div>
    </div>
  `;
}

module.exports = VideoX264;

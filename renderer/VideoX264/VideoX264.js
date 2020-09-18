const path = require('path');

const { FormControlLabel, Switch, html, css, useState } = require('../tools/ui.js');
const toast = require('../tools/toast.js');
const videoTools = require('../../lib/video-tools.js');

const FileInput = require('../FileInput/FileInput.js');
const NamingFields = require('../NamingFields/NamingFields.js');

css('./VideoX264.css');

function VideoX264() {
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [format, setFormat] = useState('mp4');
  const [audio, setAudio] = useState(true);
  const [video, setVideo] = useState(true);

  const onQueue = (files) => {
    for (let file of files) {
      if (!/^video/.test(file.type || '')) {
        toast.error(`cannot convert "${file.name}" of type "${file.type}"`);
        continue;
      }

      const _suffix = suffix ? suffix :
        path.parse(file.path).ext === `.${format}` ? '.repack' : '';

      videoTools.queue('x264', [{
        input: file.path,
        video,
        audio,
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
  `;

  const namingDom = html`<${NamingFields} nooutput ...${{
    prefix, setPrefix,
    suffix, setSuffix,
    format, setFormat
  }}/>`;

  return html`
    <div class=video-x264>
      <p>Drag files here to encode to x264</p>
      <${FileInput} nobutton onchange=${onQueue} />
      ${controlsDom}
      ${namingDom}
    </div>
  `;
}

module.exports = VideoX264;

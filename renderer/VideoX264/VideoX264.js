const path = require('path');
const os = require('os');
const cpus = os.cpus().length;

const { FormControlLabel, Slider, Switch, html, css, useState, useEffect } = require('../tools/ui.js');
const toast = require('../tools/toast.js');
const videoTools = require('../../lib/video-tools.js');

const FileInput = require('../FileInput/FileInput.js');
const NamingFields = require('../NamingFields/NamingFields.js');

css('../styles/tab-panel.css');

function VideoX264() {
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [format, setFormat] = useState('mp4');
  const [audio, setAudio] = useState(true);
  const [video, setVideo] = useState(true);
  const [threads, setThreads] = useState(Math.floor(cpus / 2));
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      videoTools.queueInspect().then(result => {
        console.log(result);

        if (result.progressTotal === 0) {
          setProgress(null);
          return;
        }

        setProgress({ ...result });
      }).catch(err => {
        // TODO umm?
        console.error('failed to get progress:', err);

        // set a value different from the current in order
        // to trigger a refetch
        setProgress(Math.random());
      });
    }, 1000);

    return () => {
      clearTimeout(t);
    };
  }, [progress]);

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
        suffix: _suffix,
        threads
      }]).then(() => {
        toast.success(`"${file.name}" is complete`);
      }).catch(err => {
        toast.error(`"${file.name}" failed:\n${err.message}`);
      });
    }

    // start tracking progress
    setProgress(Math.random());
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

  const progressDom = (progress && progress.progressTotal) ? html`
    <h3>Progress</h3>
    <div>Overall: ${Math.round(progress.progressCurrent / progress.progressTotal * 100)}% - (${progress.progressCurrent}/${progress.progressTotal})<//>
    <div>Current Task: ${Math.round(progress.taskCurrent / progress.taskTotal * 100)}% - (${progress.taskCurrent}/${progress.taskTotal})<//>
    <div>Tasks: ${progress.remainingTasks} remaining of ${progress.totalTasks}<//>
  ` : null;

  return html`
    <div class=tab-panel>
      <h2>Drag files here to encode to x264</h2>
      <${FileInput} nobutton onchange=${onQueue} />
      ${controlsDom}
      ${namingDom}
      ${progressDom}
    </div>
  `;
}

module.exports = VideoX264;

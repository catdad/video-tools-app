const prettyMs = require('pretty-ms');
const prettyBytes = require('pretty-bytes');
const { get } = require('lodash');

const {
  Card, CardContent, ObjectList,
  html, css, useSignal
} = require('../tools/ui.js');

const toast = require('../tools/toast.js');
const videoTools = require('../../lib/video-tools.js');
const FileInput = require('../FileInput/FileInput.js');

css('../styles/tab-panel.css');
css('./VideoInfo.css');

function VideoInfo() {
  const metadata = useSignal([]);

  const updateMetadata = async (files) => {
    for (let file of files) {
      const data = {
        name: file.name,
        path: file.path,
        bytes: file.size,
      };

      try {
        const meta = await videoTools.exec('meta', [{ input: file.path }]);
        metadata.value = [...metadata.value, { ...data, ...meta }];
      } catch (e) {
        metadata.value = [...metadata.value, { ...data, ...{ ok: false, error: e }}];
      }
    }
  };

  const onFiles = files => {
    metadata.value = [];

    updateMetadata(files).catch(err => {
      toast.error(`failed to get metadata:\n${err.message}`);
    });
  };

  const elems = metadata.value.map(file => {
    const { name, path, bytes, audio, video } = file;
    const seconds = get(file, 'video.duration', 0);
    const duration = prettyMs(Number(seconds) * 1000);
    const size = `${prettyBytes(bytes)}  (${bytes} bytes)`;
    const videoSummary = `${video.codec_name} (${video.width}x${video.height})`;
    const audioSummary = `${audio.codec_name} (${audio.channels} channels)`;

    // this object sets the order of the UI
    // yes, I know order is technically not guaranteed, but it works
    // well enough and I am lazy
    const data = { path, size, duration, 'video summary': videoSummary, 'audio summary': audioSummary, audio, video };

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

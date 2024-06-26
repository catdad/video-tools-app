const prettyMs = require('pretty-ms');
const prettyBytes = require('pretty-bytes');
const { get } = require('lodash');

const {
  ObjectList,
  html, css, useSignal,
  Material: M
} = require('../tools/ui.js');

const toast = require('../tools/toast.js');
const videoTools = require('../../lib/video-tools.js');
const FileInput = require('../FileInput/FileInput.js');

css('./VideoInfo.css');

const fps = value => {
  return /^[0-9]{1,}\/[0-9]{1,}$/.test(value) ?
    +eval(value).toFixed(2) :
    'unknown';
};

function VideoInfo({ 'class': classNames = ''} = {}) {
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
        metadata.value = [...metadata.value, { ...data, ok: false, error: e }];
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
    const { name, path, bytes, audio, video, error } = file;

    if (error) {
      return { name, error: error.message };
    }

    const size = `${prettyBytes(bytes)}  (${bytes} bytes)`;

    if (!audio && !video) {
      return { name, path, size, error: 'The file does not appear to be a video' };
    }

    const seconds = get(file, 'video.duration', 0);
    const duration = prettyMs(Number(seconds) * 1000);
    const videoSummary = video ? `${video.codec_name} (${video.width}x${video.height}) (${fps(video.r_frame_rate)} fps)` : 'N/A';
    const audioSummary = audio ? `${audio.codec_name} (${audio.channels} channels)` : 'N/A';

    // this object sets the order of the UI
    // yes, I know order is technically not guaranteed, but it works
    // well enough and I am lazy
    return { name, path, size, duration, 'video summary': videoSummary, 'audio summary': audioSummary, audio, video };
  }).map(({ name, ...data}) => {
    return html`
      <${M`Card`} raised className=card >
        <${M`CardContent`}>
          <h3>${name}</h3>
          <${ObjectList} value=${data} />
        <//>
      <//>
    `;
  });

  return html`
    <div class="${classNames} video-info">
      <h2>Drag files here to see metadata</h2>
      <${FileInput} nobutton onchange=${onFiles} />
      ${elems}
    </div>
  `;
}

module.exports = VideoInfo;

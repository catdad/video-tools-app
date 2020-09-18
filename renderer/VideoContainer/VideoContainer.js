const { html, css, useContext, useState } = require('../tools/ui.js');
const { Config, withConfig } = require('../tools/config.js');

const FileInput = require('../FileInput/FileInput.js');
const NamingFields = require('../NamingFields/NamingFields.js');

css('./VideoContainer.css');

const FILE = 'videocontainer.file';

function VideoContainer() {
  const config = useContext(Config);

  const [file, setFile] = useState(config.get(FILE) || {});
  const [output, setOutput] = useState('');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [format, setFormat] = useState('mp4');

  const onFile = newFile => {
    const { name, path, type, size } = newFile;

    config.set(FILE, { name, path, type, size });
    setFile({ name, path, type, size });
  };

  const children = [html`
    <div>
      <${FileInput} onchange=${onFile} />
    </div>
  `];

  if (file.path) {
    children.push(
      html`<div>${file.path}</div>`,
      html`<${NamingFields} ...${{
        prefix, setPrefix,
        suffix, setSuffix,
        output, setOutput,
        format, setFormat
      }}/>`
    );
  }

  return html`
    <div class=videocontainer>
      ${children}
    </div>
  `;
}

module.exports = withConfig(VideoContainer);

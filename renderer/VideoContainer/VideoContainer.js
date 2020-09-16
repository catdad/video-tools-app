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

  const onFile = newFile => {
    const { name, path, type, size } = newFile;

    config.set(FILE, { name, path, type, size });
    setFile({ name, path, type, size });
  };

  const fileInput = html`
    <div>
      <${FileInput} onchange=${onFile} />
    </div>
  `;

  if (!file.name || !file.path) {
    return fileInput;
  }

  return html`
    <div>
      <p>${file.name}</p>
      <p>${file.path}</p>
      <p>${file.type}</p>
      <p>${file.size}</p>
    </div>
    ${fileInput}
    <${NamingFields} ...${{ prefix, setPrefix, suffix, setSuffix, output, setOutput }}/>
  `;
}

module.exports = withConfig(VideoContainer);

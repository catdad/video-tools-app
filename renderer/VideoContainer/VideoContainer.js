const { Button, TextField, html, css, useContext, useRef, useState } = require('../tools/ui.js');

const FileInput = require('../FileInput/FileInput.js');
const NamingFields = require('../NamingFields/NamingFields.js');

function VideoContainer() {
  const [file, setFile] = useState(null);
  const [output, setOutput] = useState('');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');

  const onFile = newFile => setFile(newFile);

  if (file === null) {
    return html`
      <div>
        <${FileInput} onchange=${onFile} />
      </div>
    `;
  }

  return html`
    <div>
      <p>${file.name}</p>
      <p>${file.path}</p>
      <p>${file.type}</p>
      <p>${file.size}</p>
    </div>
    <${NamingFields} ...${{ prefix, setPrefix, suffix, setSuffix, output, setOutput }}/>
  `;
}

module.exports = VideoContainer;

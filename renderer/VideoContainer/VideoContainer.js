const { Button, TextField, html, css, useContext, useRef, useState } = require('../tools/ui.js');

const FileInput = require('../FileInput/FileInput.js');

function VideoContainer() {
  const [file, setFile] = useState(null);

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
  `;
}

module.exports = VideoContainer;

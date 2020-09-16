const { Button, TextField, html, css, useContext, useRef, useState } = require('../tools/ui.js');

function VideoContainer() {
  const inputRef = useRef();
  const [file, setFile] = useState(null);

  const onInput = () => {
    const { files } = inputRef.current;

    if (files.length === 0) {
      return;
    }

    setFile(files[0]);
  };

  const onInputButton = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  if (file === null) {
    return html`
      <div>
        <label>Pick a file:</label>
        <${Button} onclick=${onInputButton} raised>select file<//>
        <input type=file class=hidden onchange=${onInput} ref=${inputRef} />
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

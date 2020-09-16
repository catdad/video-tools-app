const { Button, html, useRef, useState } = require('../tools/ui.js');

function FileInput({ onchange = () => {} }) {
  const inputRef = useRef();
  const [file, setFile] = useState(null);

  const onInput = () => {
    const { files } = inputRef.current;
    const currentFile = files[0] || null;

    if (currentFile !== file) {
      setFile(currentFile);
      onchange(currentFile);
    }
  };

  const onInputButton = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return html`
    <div>
      <label>Pick a file:</label>
      <${Button} onclick=${onInputButton} raised>select file<//>
      <input type=file class=hidden onchange=${onInput} ref=${inputRef} />
    </div>
  `;
}

module.exports = FileInput;

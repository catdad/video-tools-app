const { PrimaryButton, html, useEffect, useRef, useState } = require('../tools/ui.js');

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

  useEffect(() => {
    const onDrop = ev => {
      ev.stopPropagation();
      ev.preventDefault();

      const { files } = ev.dataTransfer;
      const currentFile = files[0];

      if (currentFile) {
        setFile(currentFile);
        onchange(currentFile);
      }
    };

    const onDrag = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
    };

    window.addEventListener('drop', onDrop);
    window.addEventListener('dragover', onDrag);

    return () => {
      window.removeEventListener('drop', onDrop);
      window.removeEventListener('dragover', onDrag);
    };
  }, [onchange]);

  return html`
    <div>
      <label>Pick a file:</label>
      <${PrimaryButton} onclick=${onInputButton}>select file<//>
      <input type=file class=hidden onchange=${onInput} ref=${inputRef} />
    </div>
  `;
}

module.exports = FileInput;

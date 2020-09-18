const { PrimaryButton, html, useEffect, useRef } = require('../tools/ui.js');

function FileInput({
  onchange = () => {},
  nobutton = false
}) {
  const inputRef = useRef();

  const onInput = () => {
    const { files } = inputRef.current;
    onchange([...files]);
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
      onchange([...files]);
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

  if (nobutton) {
    return;
  }

  return html`
    <div>
      <label>Pick a file:</label>
      <${PrimaryButton} onclick=${onInputButton}>select file<//>
      <input type=file class=hidden onchange=${onInput} ref=${inputRef} />
    </div>
  `;
}

module.exports = FileInput;

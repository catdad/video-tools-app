const { PrimaryButton, html, useEffect, useRef } = require('../tools/ui.js');
// note: this only works because we run with `contextIsolation: false`
const { webUtils } = require('electron');

function FileInput({
  onchange = () => {},
  nobutton = false,
  children
}) {
  const parentRef = useRef(window);
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

      onchange([...files].map(file => ({
        type: file.type,
        name: file.name,
        size: file.size,
        path: webUtils.getPathForFile(file)
      })));
    };

    const onDrag = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
    };

    const parent = parentRef.current;

    parent.addEventListener('drop', onDrop);
    parent.addEventListener('dragover', onDrag);

    return () => {
      parent.removeEventListener('drop', onDrop);
      parent.removeEventListener('dragover', onDrag);
    };
  }, [onchange, parentRef.current]);

  if (children) {
    // I think this is a hack?
    children.ref = node => {
      if (node && node.base) {
        parentRef.current = node.base;
      } else {
        parentRef.current = window;
      }
    };
    return children;
  }

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

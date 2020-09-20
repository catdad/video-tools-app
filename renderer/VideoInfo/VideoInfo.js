const {
  Card, CardContent, Collapse, List, ListItem, ListItemText,
  html, css, useState
} = require('../tools/ui.js');

const toast = require('../tools/toast.js');
const videoTools = require('../../lib/video-tools.js');
const FileInput = require('../FileInput/FileInput.js');

//const ExpandLess = require('@material-ui/icons/ExpandLess');
//const ExpandMore = require('@material-ui/icons/ExpandMore');

css('../styles/tab-panel.css');
css('./VideoInfo.css');

const getMeta = async files => {
  const results = [];

  for (let file of files) {
    const data = {
      name: file.name,
      path: file.path,
      size: file.size,
      type: file.type,
    };

    try {
      const meta = await videoTools.exec('meta', [{ input: file.path }]);
      results.push({ ...data, ...meta });
    } catch (e) {
      results.push({ ...data, ...{ ok: false, error: e }});
    }
  }

  return results;
};

const ObjectListItem = ({ name = '', value = {} }) => {
  const [open, setOpen] = useState(false);

  if (typeof value === 'object') {
    return html`
      <${ListItem} button onClick=${() => setOpen(!open)} >
        <${ListItemText} primary=${`${name} ${ open ? '⯅' : '⯆'}`} />
      <//>
      <${Collapse} in=${open} timeout=auto unmountOnExit >
        <${ObjectList} value=${value} className="nested" />
      <//>
    `;
  }

  return html`
    <${ListItem}>
      <${ListItemText} primary=${`${name}: ${value}`} />
    <//>
  `;
};

const ObjectList = ({ value = {}, ...props }) => {
  return html`
    <${List} ...${props}>
      ${Object.keys(value).map(key => html`
        <${ObjectListItem} name=${key} value=${value[key]} />
      `)}
    <//>
  `;
};

function VideoInfo() {
  const [files, setFiles] = useState([]);

  const onFiles = files => {
    getMeta(files).then(meta => {
      setFiles(meta);
    }).catch(err => {
      toast.error(`failed to get metadata:\n${err.message}`);
    });
  };

  console.log(files);

  const elems = files.map(file => {
    return html`
      <${Card}>
        <${CardContent}>
          <h3>${file.name}</h3>
          <${ObjectList} value=${file} />
        <//>
      <//>
    `;
  });

  return html`
    <div class="tab-panel video-info">
      <h2>Drag files here to see metadata</h2>
      <${FileInput} nobutton onchange=${onFiles} />
      ${elems}
    </div>
  `;
}

module.exports = VideoInfo;

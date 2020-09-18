const { PrimaryTextField: TextField, html } = require('../tools/ui.js');

function NamingFields({
  output = '', setOutput = () => {},
  prefix = '', setPrefix = () => {},
  suffix = '', setSuffix = () => {},
  format = '', setFormat = () => {}
}) {

  const onOutputInput = ev => setOutput(ev.target.value);
  const onPrefixInput = ev => setPrefix(ev.target.value);
  const onSuffixInput = ev => setSuffix(ev.target.value);
  const onFormatInput = ev => setFormat(ev.target.value);

  return html`
    <div>Naming</div>
    <${TextField} label=format value=${format} onInput=${onFormatInput} />
    <${TextField} label=name value=${output} onInput=${onOutputInput} />
    <${TextField} label=prefix value=${prefix} onInput=${onPrefixInput} />
    <${TextField} label=suffix value=${suffix} onInput=${onSuffixInput} />
  `;
}

module.exports = NamingFields;

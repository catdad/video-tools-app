const { PrimaryTextField: TextField, html } = require('../tools/ui.js');

function NamingFields({
  output = '', setOutput = () => {}, nooutput = false,
  prefix = '', setPrefix = () => {},
  suffix = '', setSuffix = () => {},
  format = '', setFormat = () => {}, noformat = false
}) {

  const onOutputInput = ev => setOutput(ev.target.value);
  const onPrefixInput = ev => setPrefix(ev.target.value);
  const onSuffixInput = ev => setSuffix(ev.target.value);
  const onFormatInput = ev => setFormat(ev.target.value);

  return html`
    <h3>Naming</h3>
    ${noformat ? '' : html`<${TextField} label=format value=${format} onInput=${onFormatInput} />`}
    ${nooutput ? '' : html`<${TextField} label=name value=${output} onInput=${onOutputInput} />`}
    <${TextField} label=prefix value=${prefix} onInput=${onPrefixInput} />
    <${TextField} label=suffix value=${suffix} onInput=${onSuffixInput} />
  `;
}

module.exports = NamingFields;

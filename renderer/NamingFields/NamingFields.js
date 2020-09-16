const { TextField, html } = require('../tools/ui.js');

function NamingFields({
  output = '', setOutput = () => {},
  prefix = '', setPrefix = () => {},
  suffix = '', setSuffix = () => {}
}) {

  const onOutputInput = ev => setOutput(ev.target.value);
  const onPrefixInput = ev => setPrefix(ev.target.value);
  const onSuffixInput = ev => setSuffix(ev.target.value);

  return html`
    <div>Naming</div>
    <${TextField} label=name value=${output} onInput=${onOutputInput} />
    <${TextField} label=prefix value=${prefix} onInput=${onPrefixInput} />
    <${TextField} label=suffix value=${suffix} onInput=${onSuffixInput} />
  `;
}

module.exports = NamingFields;

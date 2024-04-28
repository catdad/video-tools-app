const { PrimaryTextField: TextField, html } = require('../tools/ui.js');

function NamingFields({
  output = {}, nooutput = false,
  prefix = {},
  suffix = {},
  format = {}, noformat = false
}) {

  const onOutputInput = ev => (output.value = ev.target.value);
  const onPrefixInput = ev => (prefix.value = ev.target.value);
  const onSuffixInput = ev => (suffix.value = ev.target.value);
  const onFormatInput = ev => (format.value = ev.target.value);

  return html`
    ${noformat ? '' : html`<${TextField} label=format value=${format.value} onInput=${onFormatInput} />`}
    ${nooutput ? '' : html`<${TextField} label=name value=${output} onInput=${onOutputInput} />`}
    <${TextField} label=prefix value=${prefix.value} onInput=${onPrefixInput} />
    <${TextField} label=suffix value=${suffix.value} onInput=${onSuffixInput} />
  `;
}

module.exports = NamingFields;

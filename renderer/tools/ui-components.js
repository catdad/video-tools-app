const components = require('@material-ui/core');

const { Collapse, List, ListItem, ListItemText, Button, ButtonGroup, TextField } = components;

const ExpandLess = require('@material-ui/icons/ExpandLess').default;
const ExpandMore = require('@material-ui/icons/ExpandMore').default;

module.exports = ({ html, hooks: { useState } }) => {
  const PrimaryButton = ({ ...props }) => html`
    <${Button} size=small ...${props} style=${{ fontWeight: 700 }} color=primary variant=contained />
  `;

  const SecondaryButton = ({ ...props }) => html`
    <${Button} size=small ...${props} color=primary variant=outlined />
  `;

  const PrimaryTextField = ({ ...props }) => html`
    <${TextField} ...${props} variant=outlined margin=dense />
  `;

  const ObjectListItem = ({ name = '', value = {} }) => {
    const [open, setOpen] = useState(false);

    if (typeof value === 'object') {
      return html`
        <${ListItem} button onClick=${() => setOpen(!open)} >
          <${ListItemText} primary=${name} />
          ${ open ? html`<${ExpandLess} />` : html`<${ExpandMore} />`}
        <//>
        <${Collapse} in=${open} timeout=auto unmountOnExit >
          <${ObjectList} value=${value} className="nested" />
        <//>
      `;
    }

    if (typeof value === 'function') {
      return html`
        <${ListItem} button onclick=${value}>
          <${ListItemText} primary=${`${name}`} />
        <//>
      `;
    }

    if (name) {
      name += ': ';
    }

    return html`
      <${ListItem}>
        <${ListItemText} primary=${`${name}${value}`} />
      <//>
    `;
  };

  const ObjectList = ({ value = {}, ...props }) => {
    const listChildren = Array.isArray(value) ?
      value.map(val => html`
        <${ObjectListItem} value=${val} />
      `) :
      Object.keys(value).map(key => html`
        <${ObjectListItem} name=${key} value=${value[key]} />
      `);

    return html`<${List} ...${props}>${listChildren}<//>`;
  };

  const Toggle = ({ value, values = [], onChange = () => {} }) => {
    const _value = value || values[0];

    const click = (val) => () => {
      if (val !== _value) {
        onChange(val);
      }
    };

    return html`<${ButtonGroup} color=primary>
      ${values.map(val => html`<${val === _value ? PrimaryButton : Button} onClick=${click(val)}>${val}<//>`)}
    <//>`;
  };

  return {
    ...components,
    PrimaryButton, SecondaryButton,
    PrimaryTextField, ObjectList,
    Toggle
  };
};

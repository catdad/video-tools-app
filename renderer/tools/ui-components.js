const components = require('@material-ui/core');

//const { compose, palette, spacing, typography } = require('@material-ui/system');
//const Box = components.styled('div')(compose(spacing, palette, typography));

const { Collapse, List, ListItem, ListItemText } = components;

const ExpandLess = require('@material-ui/icons/ExpandLess').default;
const ExpandMore = require('@material-ui/icons/ExpandMore').default;

module.exports = ({ html, hooks }) => {
  const { useState } = hooks;

  const PrimaryButton = ({ ...props }) => html`
    <${components.Button} size=small ...${props} style=${{ fontWeight: 700 }} color=primary variant=contained />
  `;

  const SecondaryButton = ({ ...props }) => html`
    <${components.Button} size=small ...${props} color=primary variant=outlined />
  `;

  const PrimaryTextField = ({ ...props }) => html`
    <${components.TextField} ...${props} variant=outlined margin=dense />
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

  return {
    ...components,
    PrimaryButton, SecondaryButton,
    PrimaryTextField, ObjectList
  };
};

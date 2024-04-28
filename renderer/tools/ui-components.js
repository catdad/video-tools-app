const M = ((cache) => {
  return name => {
    if (cache[name]) {
      return cache[name];
    }

    // this is a silly naming convention
    cache[name] = require(`@material-ui/core/${name}/${name}.js`).default;
    return cache[name];
  };
})({});

const MI = ((cache) => {
  return name => {
    if (cache[name]) {
      return cache[name];
    }

    cache[name] = require(`@material-ui/icons/${name}.js`).default;
    return cache[name];
  };
})({});

module.exports = ({ html, hooks: { useState } }) => {
  const PrimaryButton = ({ ...props }) => html`
    <${M`Button`} size=small ...${props} style=${{ fontWeight: 700 }} color=primary variant=contained />
  `;

  const SecondaryButton = ({ ...props }) => html`
    <${M`Button`} size=small ...${props} color=primary variant=outlined />
  `;

  const PrimaryTextField = ({ ...props }) => html`
    <${M`TextField`} ...${props} variant=outlined margin=dense />
  `;

  const ObjectListItem = ({ name = '', value = {} }) => {
    const [open, setOpen] = useState(false);

    if (typeof value === 'object') {
      return html`
        <${M`ListItem`} button onClick=${() => setOpen(!open)} >
          <${M`ListItemText`} primary=${name} />
          ${ open ? html`<${MI`ExpandLess`} />` : html`<${MI`ExpandMore`} />`}
        <//>
        <${M`Collapse`} in=${open} timeout=auto unmountOnExit >
          <${ObjectList} value=${value} className="nested" />
        <//>
      `;
    }

    if (typeof value === 'function') {
      return html`
        <${M`ListItem`} button onclick=${value}>
          <${M`ListItemText`} primary=${`${name}`} />
        <//>
      `;
    }

    if (name) {
      name += ': ';
    }

    return html`
      <${M`ListItem`}>
        <${M`ListItemText`} primary=${`${name}${value}`} />
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

    return html`<${M`List`} ...${props}>${listChildren}<//>`;
  };

  const Toggle = ({ value, values = [], onChange = () => {} }) => {
    const _value = value || values[0];

    const click = (val) => () => {
      if (val !== _value) {
        onChange(val);
      }
    };

    return html`<${M`ButtonGroup`} color=primary>
      ${values.map(val => html`<${val === _value ? PrimaryButton : M`Button`} onClick=${click(val)}>${val}<//>`)}
    <//>`;
  };

  return {
    PrimaryButton, SecondaryButton, PrimaryTextField, ObjectList, Toggle,
    Material: M, MaterialIcon: MI
  };
};

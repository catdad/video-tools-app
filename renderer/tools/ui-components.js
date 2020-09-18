const components = require('@material-ui/core');

//const { compose, palette, spacing, typography } = require('@material-ui/system');
//const Box = components.styled('div')(compose(spacing, palette, typography));

module.exports = ({ html }) => {

  const PrimaryButton = ({ ...props }) => html`
    <${components.Button} size=small ...${props} style=${{ fontWeight: 700 }} color=primary variant=contained />
  `;

  const SecondaryButton = ({ ...props }) => html`
    <${components.Button} size=small ...${props} color=primary variant=outlined />
  `;

  const PrimaryTextField = ({ ...props }) => html`
    <${components.TextField} ...${props} variant=outlined margin=dense />
  `;

  return {
    ...components,
    PrimaryButton, SecondaryButton,
    PrimaryTextField
  };
};

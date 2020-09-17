const components = require('@material-ui/core');

module.exports = html => {

  const PrimaryButton = ({ ...props }) => html`
    <${components.Button} ...${props} color=primary variant=contained />
  `;

  const SecondaryButton = ({ ...props }) => html`
    <${components.Button} ...${props} color=primary variant=outlined />
  `;

  return {
    ...components,
    PrimaryButton, SecondaryButton
  };
};

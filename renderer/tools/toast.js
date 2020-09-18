const { html, render } = require('./ui.js');
const { SnackbarProvider, useSnackbar } = require('notistack');

let enqueueSnackbar;

const SnackbarComponent = () => {
  ({ enqueueSnackbar  } = useSnackbar());

  return null;
};

const SnackbarConainer = () => {
  return html`
    <${SnackbarProvider} maxSnack=5><${SnackbarComponent} /><//>
  `;
};

(() => {
  const container = document.createElement('div');
  container.className = 'toast';

  document.body.appendChild(container);

  render(html`<${SnackbarConainer} />`, container);
})();

const toast = variant => str => enqueueSnackbar(str, { variant, className: 'multiline' });

module.exports = {
  success: toast('success'),
  error: toast('error'),
  warning: toast('warning'),
  info: toast('info'),
};

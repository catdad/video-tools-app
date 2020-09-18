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

const toast = opts => str => enqueueSnackbar(str, { ...opts, className: 'multiline' });

module.exports = {
  success: toast({ variant: 'success' }),
  error: toast({ variant: 'error' }),
  warning: toast({ variant: 'warning' }),
  info: toast({ variant: 'info' }),
};

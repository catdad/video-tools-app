// require this before first so that it sets up
// preact for use with react components
require('./tools/require-alias.js');

const { render, html, css } = require('./tools/ui.js');
const App = require('./App/App.js');

// this base style must be embedded before anything else happens
css('./base.css', null, true);
css('../fonts/fonts.css');

render(html`<${App} />`, document.querySelector('#app'));

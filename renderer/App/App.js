const { Button, html, css, useContext, useState } = require('../tools/ui.js');
const { withConfig, Config } = require('../tools/config.js');

css('./App.css');

function App() {
  const config = useContext(Config);
  const [value, setValue] = useState(config.get('counter') || 0);

  const count = () => {
    config.set('counter', value + 1);
    setValue(value + 1);
  };

  return html`
    <div class=app>
      <p>This is your app</p>
      <div>
        <${Button} ripple raised onclick=${count}>I count how many times you click me, ever<//> : <span>${value}</span>
      </div>
    </div>
  `;
}

module.exports = withConfig(App);

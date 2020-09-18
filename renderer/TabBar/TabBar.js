const { AppBar, Tabs, html, forwardRef } = require('../tools/ui.js');

module.exports = forwardRef(({ children, selected, onChange }, ref) => {
  return html`
    <div ref=${ref}>
      <${AppBar} position=static>
        <${Tabs} value=${selected} onChange=${onChange}>
          ${children}
        <//>
      <//>
    </div>
  `;
});

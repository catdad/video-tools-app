const { html, forwardRef, Material: M } = require('../tools/ui.js');

module.exports = forwardRef(({ children, selected, onChange }, ref) => {
  return html`
    <div ref=${ref}>
      <${M`AppBar`} position=static>
        <${M`Tabs`} value=${selected} onChange=${onChange} variant=scrollable scrollButtons=auto>
          ${children}
        <//>
      <//>
    </div>
  `;
});

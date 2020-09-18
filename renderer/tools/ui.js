const path = require('path');
const cs = require('callsites');

const { h, render, createContext, createRef } = require('preact');
const hooks = require('preact/hooks');
const { forwardRef } = require('preact/compat');

const htm = require('htm');
const html = htm.bind(h);

const getVar = (elem, name) => getComputedStyle(elem).getPropertyValue(`--${name}`);
const setVar = (elem, name, value) => elem.style.setProperty(`--${name}`, value);
const getRootVar = (name) => getVar(document.documentElement, name);
const setRootVar = (name, value) => setVar(document.documentElement, name, value);

const css = (cache => (csspath, dirname) => {
  const callerFile = cs()[1].getFileName();
  const callerDir = path.dirname(callerFile);
  const href = path.resolve(dirname || callerDir, csspath);

  if (cache[href]) {
    return;
  }

  cache[href] = true;

  const link = document.createElement('link');

  Object.assign(link, {
    type: 'text/css',
    rel: 'stylesheet',
    href
  });

  document.head.appendChild(link);
})({});

const components = require('./ui-components.js')({ html });

module.exports = {
  getVar, getRootVar, setVar, setRootVar,
  html, render, css, createContext, createRef,
  forwardRef,
  ...hooks,
  ...components
};

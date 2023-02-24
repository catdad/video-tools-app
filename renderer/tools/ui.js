const path = require('path');
const fs = require('fs');
const cs = require('callsites');

const { h, render, createContext, createRef } = require('preact');
const {
  forwardRef,
  useState, useReducer, useRef, useEffect, useImperativeHandle, useLayoutEffect, useCallback, useMemo, useContext, useDebugValue, useErrorBoundary, useId
} = require('preact/compat');

const hooks = { useState, useReducer, useRef, useEffect, useImperativeHandle, useLayoutEffect, useCallback, useMemo, useContext, useDebugValue, useErrorBoundary, useId };

const htm = require('htm');
const html = htm.bind(h);

const signals = require('@preact/signals');

const getVar = (elem, name) => getComputedStyle(elem).getPropertyValue(`--${name}`);
const setVar = (elem, name, value) => elem.style.setProperty(`--${name}`, value);
const getRootVar = (name) => getVar(document.documentElement, name);
const setRootVar = (name, value) => setVar(document.documentElement, name, value);

const embedCss = (filepath) => {
  const file = fs.readFileSync(filepath, 'utf8');
  const sheet = document.createElement('style');
  sheet.innerHTML = file;
  document.head.appendChild(sheet);
};

const css = (cache => (csspath, dirname, synchronous = false) => {
  const callerFile = cs()[1].getFileName();
  const callerDir = path.dirname(callerFile);
  const href = path.resolve(dirname || callerDir, csspath);

  if (cache[href]) {
    return;
  }

  cache[href] = true;

  if (synchronous) {
    return void embedCss(href);
  }

  document.head.appendChild(Object.assign(document.createElement('link'), {
    type: 'text/css',
    rel: 'stylesheet',
    href
  }));
})({});

const components = require('./ui-components.js')({ html, hooks });

module.exports = {
  getVar, getRootVar, setVar, setRootVar,
  html, render, css, createContext, createRef,
  forwardRef,
  ...hooks,
  ...signals,
  ...components
};

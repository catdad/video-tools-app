const path = require('path');
const fs = require('fs-extra');
const _ = require('lodash');
const { default: PQueue } = require('p-queue');

const is = require('./is.js');
const root = require('./root.js');
const name = 'config';
const { info, error } = require('./log.js')(name);
const isomorphic = require('./isomorphic.js');
const pkg = require('../package.json');

const location = process.env[`${pkg.name.toUpperCase().replace(/-/g, '_')}_CONFIG_PATH`] || path.resolve(is.prod ? is.appData : root, `.${pkg.name}-config.json`);

let configObj = {
  version: '1.0.0'
};

if (is.main) {
  try {
    const file = fs.readFileSync(location, 'utf8');
    Object.assign(configObj, JSON.parse(file));
  } catch (e) {
    error('could not read config file, a new one will be created');
    fs.writeFileSync(location, JSON.stringify(configObj, null, 2));
  }
}

const perform = ((queue) => func => queue.add(() => func()))(new PQueue({ concurrency: 1 }));

const autoSave = _.debounce(() => {
  info('auto saving');

  implementation.write().then(() => {
    info('auto save done');
  }).catch((err) => {
    error('auto save error', err);
  });
}, 1000);

const read = async () => {
  const file = await fs.readFile(location, 'utf8');
  const json = JSON.parse(file);
  return json;
};

const implementation = {
  read: () => perform(async () => {
    try {
      const json = await read();
      configObj = Object.assign(json, configObj);
      return configObj;
    } catch (e) {
      if (e.code === 'ENOENT') {
        return configObj;
      }

      throw e;
    }
  }),
  write: () => perform(async () => {
    const config = await read();
    await fs.writeFile(location, JSON.stringify(config, null, 2));
  }),
  getProp: (name) => {
    if (Array.isArray(name)) {
      return name.map((prop) => {
        return _.get(configObj, prop);
      });
    }

    return _.get(configObj, name);
  },
  setProp: (name, value) => {
    _.set(configObj, name, value);
    autoSave();
  }
};

module.exports = isomorphic({ name, implementation });

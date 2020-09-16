const Module = require('module');

const aliases = {
  'react': 'preact/compat',
  'react-dom': 'preact/compat'
};

// this is a hack and I don't like it
// if you know a better way to collect all required modules
// please file an issue, I'd appreciate it very much
// https://github.com/catdad/electronmon/issues/new
const originalLoad = Module._load;

Module._load = function (request, parent) {
  request = aliases[request] || request;

  return originalLoad.apply(this, [request, parent]);
};

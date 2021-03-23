const tempy = require('tempy');
const fs = require('fs-extra');

const usingFile = async (opts, func) => {
  if (typeof opts === 'function') {
    func = opts;
    opts = {};
  }

  if (!Array.isArray(opts)) {
    opts = [opts];
  }

  const files = opts.map(opt => tempy.file(opt));

  try {
    return await func(...files);
  } finally {
    await Promise.all(files.map(f => fs.remove(f)));
  }
};

module.exports = { usingFile };

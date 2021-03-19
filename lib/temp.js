const tempy = require('tempy');
const fs = require('fs-extra');

const usingFile = async (opts, func) => {
  if (typeof opts === 'function') {
    func = opts;
    opts = {};
  }

  const file = tempy.file(opts);

  try {
    return await func(file);
  } finally {
    await fs.remove(file);
  }
};

module.exports = { usingFile };

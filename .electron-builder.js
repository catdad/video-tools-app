const path = require('path');
const { name, productName, appId, version } = require('./package.json');
const icon = require('./lib/icon.js')('build');

const fileName = productName.replace(/\s/g, '');

module.exports = {
  appId,
  productName,
  buildVersion: version,
  files: [
    '!assets/*',
    '!scripts/*',
    '!.*'
  ],
  mac: {
    icon,
    target: [
      'dmg'
    ],
    darkModeSupport: true
  },
  dmg: {
    icon,
    artifactName: `${fileName}-v\${version}-MacOS.\${ext}`
  },
  win: {
    icon,
    target: [
      'nsis',
      'portable'
    ]
  },
  nsis: {
    artifactName: `${fileName}-v\${version}-Windows-setup.\${ext}`
  },
  portable: {
    artifactName: `${fileName}-v\${version}-Windows-portable.\${ext}`,
    splashImage: path.resolve(__dirname, 'icons/splash.bmp')
  },
  linux: {
    icon,
    target: [
      'AppImage'
    ],
    executableName: productName,
    category: 'Network',
    asarUnpack: [
      'icons/*.png'
    ]
  },
  appImage: {
    artifactName: `${fileName}-v\${version}-Linux.\${ext}`
  }
};

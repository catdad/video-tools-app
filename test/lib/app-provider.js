const path = require('path');

const { expect } = require('chai');
const chalk = require('chalk');
const waitForThrowable = require('wait-for-throwable');
const { launch } = require('puptron');

const pkg = require('../../package.json');
const configVar = `${pkg.name.toUpperCase().replace(/-/g, '_')}_CONFIG_PATH`;

function isInView(containerBB, elBB) {
  return (!(
    elBB.top >= containerBB.bottom ||
    elBB.left >= containerBB.right ||
    elBB.bottom <= containerBB.top ||
    elBB.right <= containerBB.left
  ));
}

const utils = page => ({
  exists: async selector => await page.evaluate(s => !!document.querySelector(s), selector),
  click: async selector => await page.click(selector),
  getRect: async selector => await page.evaluate(s => document.querySelector(s).getBoundingClientRect(), selector),
  getText: async selector => await page.evaluate(s => document.querySelector(s).innerText, selector),
  waitForVisible: async selector => {
    const { exists, getRect } = utils(page);

    await waitForThrowable(async () => {
      expect(await exists(selector))
        .to.equal(true, `"${selector}" does not exist`);

      const pageRect = await getRect('body');
      const elemRect = await getRect(selector);

      expect(isInView(pageRect, elemRect))
        .to.equal(true, `element "${selector}" is still not visible`);
    });
  },
  waitForElementCount: async (selector, count = 1) => {
    await waitForThrowable(async () => {
      const elements = await page.$$(selector);
      const errStr = `expected ${count} of element "${selector}" but found ${elements.length}`;

      expect(elements.length, errStr).to.equal(count);
    });
  }
});

let _browser;

module.exports = {
  start: async (configPath = '') => {
    // we get this error in github actions:
    // [2328:1128/060006.361552:FATAL:sandbox/linux/suid/client/setuid_sandbox_host.cc:166] The SUID sandbox helper binary was found, but is not configured correctly. Rather than run without sandboxing I'm aborting now.
    // You need to make sure that /home/runner/work/video-tools-app/video-tools-app/node_modules/electron/dist/chrome-sandbox is owned by root and has mode 4755.
    // /home/runner/work/video-tools-app/video-tools-app/node_modules/electron/dist/electron exited with signal SIGTRAP
    const noSandbox = process.env.CI && process.platform === 'linux';

    const args = [];

    if (noSandbox) {
      args.push('--no-sandbox');
    }

    args.push('.');

    _browser = await launch(args, {
      cwd: path.resolve(__dirname, '../..'),
      env: {
        [configVar]: configPath
      }
    });

    const [page] = await _browser.pages();

    return {
      page,
      browser: _browser,
      utils: utils(page)
    };
  },
  stop: async (printLogs) => {
    if (!_browser) {
      return;
    }

    if (printLogs) {
      const logs = _browser.getLogs().map(str => {
        const clean = str.replace(/^\[[0-9:/.]+INFO:CONSOLE\([0-9]+\)\]\s{0,}/, '');

        return clean === str ? chalk.yellow(str) : chalk.cyan(clean);
      }).join('');

      /* eslint-disable-next-line no-console */
      console.log(logs);
    }

    await _browser.close();
  }
};

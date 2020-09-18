const { expect } = require('chai');
const waitForThrowable = require('wait-for-throwable');

const { start, stop } = require('./lib/app-provider.js');
const config = require('./lib/config-provider.js');

describe('[smoke tests]', () => {
  const all = async (...promises) => {
    let err;

    await Promise.all(promises.map(p => p.catch(e => {
      err = e;
    })));

    if (err) {
      throw err;
    }
  };

  async function cleanup() {
    const includeLogs = this.currentTest.state === 'failed' || process.env.VERBOSE;

    await all(
      stop(includeLogs),
      config.cleanAll()
    );
  }

  beforeEach(cleanup);
  afterEach(cleanup);

  it('opens the application', async () => {
    const configPath = await config.create({});
    const app = await start(configPath);

    await app.utils.waitForVisible('#app');

    await waitForThrowable(async () => {
      const buttons = await app.page.$$('p');
      expect(buttons).to.have.length.above(0);

      expect(await app.utils.getText('p')).to.equal('Drag files here to change the video container');
    });
  });
});

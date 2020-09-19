const { expect } = require('chai');
const { getDocument, queries: { findByText } } = require('pptr-testing-library');

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
  });

  it('is on the container tab by default', async () => {
    const configPath = await config.create({});
    const app = await start(configPath);

    await app.utils.waitForVisible('#app');

    const $document = await getDocument(app.page);

    await findByText($document, 'video container');
    const title = await findByText($document, 'Drag files here to change the video container');

    expect(await title.evaluate(e => e.tagName)).to.equal('H2');
  });

  it('can switch to the x264 tab', async () => {
    const configPath = await config.create({});
    const app = await start(configPath);

    await app.utils.waitForVisible('#app');

    const $document = await getDocument(app.page);

    const tab = await findByText($document, 'transcode to x264');
    await tab.click();

    const title = await findByText($document, 'Drag files here to encode to x264');
    expect(await title.evaluate(e => e.tagName)).to.equal('H2');
  });

  it('opens the defined tab if one is present in config', async () => {
    const configPath = await config.create({ 'default-tab': 'transcode to x264' });
    const app = await start(configPath);

    await app.utils.waitForVisible('#app');

    const $document = await getDocument(app.page);

    const title = await findByText($document, 'Drag files here to encode to x264');
    expect(await title.evaluate(e => e.tagName)).to.equal('H2');
  });
});

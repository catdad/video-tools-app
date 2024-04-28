const { expect } = require('chai');
const { getDocument, queries: { findByText: findByTextQuery } } = require('pptr-testing-library');
const findByText = (text, queryOptions) => findByTextQuery(text, queryOptions, { timeout: 10000 });

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

  it('is on the transcode tab by default', async () => {
    const configPath = await config.create({});
    const app = await start(configPath);

    await app.utils.waitForVisible('#app');

    const $document = await getDocument(app.page);

    await findByText($document, 'transcode');
    const title = await findByText($document, 'Drag files to convert here');

    expect(await title.evaluate(e => e.tagName)).to.equal('H2');
  });

  it('can switch to the info tab', async () => {
    const configPath = await config.create({});
    const app = await start(configPath);

    await app.utils.waitForVisible('#app');

    const $document = await getDocument(app.page);

    const tab = await findByText($document, 'info');
    await tab.click();

    const title = await findByText($document, 'Drag files here to see metadata');
    expect(await title.evaluate(e => e.tagName)).to.equal('H2');
  });

  it('can switch to the luts tab', async () => {
    const configPath = await config.create({});
    const app = await start(configPath);

    await app.utils.waitForVisible('#app');

    const $document = await getDocument(app.page);

    const tab = await findByText($document, 'LUTs');
    await tab.click();

    const title = await findByText($document, 'Drag a LUTs folder');
    expect(await title.evaluate(e => e.tagName)).to.equal('H2');
  });

  it('opens the defined tab if one is present in config', async () => {
    const configPath = await config.create({ 'default-tab': 'info' });
    const app = await start(configPath);

    await app.utils.waitForVisible('#app');

    const $document = await getDocument(app.page);

    const title = await findByText($document, 'Drag files here to see metadata');
    expect(await title.evaluate(e => e.tagName)).to.equal('H2');
  });
});

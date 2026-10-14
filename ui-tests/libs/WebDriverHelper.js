/**
 * Helper class that encapsulates webdriverio
 * and sets up mocha hooks for easier test writing.
 */
function WebDriverHelper() {
  this.browser = null;
}

WebDriverHelper.prototype.getBrowser = function () {
  return this.browser;
};

const makeChromeOptions = (headless, width, height) => ({
  args: [
    ...(headless ? ['--headless', '--disable-gpu', '--no-sandbox'] : []),
    '--lang=en',
    '--disable-extensions',
    `--window-size=${width},${height}`,
  ],
});

/**
 * Sets up a before and after mocha hook
 * that initialize and terminate the webdriverio session.
 *
 * The session is deleted by an `after` hook added to the suite from inside `before`, at run time.
 * Mocha runs a suite's `after` hooks in the order they were added, and the spec's own `after` -
 * the one that cleans up via the API, through the browser - is added at collection time, after
 * this function was called: an `after` registered here would run before it and leave it with a
 * dead session (ECONNREFUSED on every request). A hook added at run time comes last.
 */
WebDriverHelper.prototype.setupBrowser = function setupBrowser(w, h) {
  let _this = this;
  let ww = w;
  let hh = h;
  before(async function () {
    let propertiesReaderModule = require('properties-reader');
    let propertiesReader =
      propertiesReaderModule.propertiesReader ||
      propertiesReaderModule.default ||
      propertiesReaderModule;
    let path = require('path');
    let webdriverio = require('webdriverio');
    let file = path.join(__dirname, '/../browser.properties');
    let properties = propertiesReader({ sourceFile: file });
    let browser_name = properties.get('browser.name');
    let browser_version = properties.get('browser.version');
    let baseUrl = properties.get('base.url');
    let isHeadless = properties.get('is.headless');
    let width = ww === undefined ? properties.get('browser.width') : w;
    let height = hh === undefined ? properties.get('browser.height') : h;
    let options = {
      logLevel: 'error',
      automationProtocol: 'webdriver',
      capabilities: {
        browserName: browser_name,
        browserVersion: browser_version,
        'goog:chromeOptions': makeChromeOptions(isHeadless, width, height),
      },
    };
    _this.browser = await webdriverio.remote(options);
    await _this.browser.url(baseUrl);
    console.log('BiDi ##################### ' + _this.browser.isBidi);
    const browser = _this.browser;
    this.test.parent.afterAll(async function () {
      await browser.deleteSession();
    });
    return _this.browser;
  });
};
module.exports = new WebDriverHelper();

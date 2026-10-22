const path = require('path');
const { propertiesReader } = require('properties-reader');
const file = path.join(__dirname, './browser.properties');
const properties = propertiesReader({ sourceFile: file });
const browser_version = properties.get('browser.version');
const width = properties.get('browser.width');
const height = properties.get('browser.height');
const baseURL = properties.get('base.url');
// Generating a public key hands the private half over as a file download (an <a download> of a
// blob). Chrome's 'Ask where to save each file' would answer it with the OS save dialog, which no
// WebDriver command can reach, so the prompt is switched off and the keys land in a throwaway
// directory of their own rather than in the machine's Downloads.
const downloadDir = path.join(__dirname, './build/downloads');

exports.config = {
  // The specs of an editor live in a folder of their own (specs/user-editor, specs/role-editor).
  specs: [path.join(__dirname, './specs/**/*.spec.js')],

  maxInstances: 1,

  strictSelectors: false,

  capabilities: [
    {
      browserName: 'chrome',
      browserVersion: browser_version,
      'wdio:enforceWebDriverClassic': true,
      'goog:chromeOptions': {
        args: [
          '--headless',
          '--disable-gpu',
          '--no-sandbox',
          '--lang=en',
          'guest',
          '--disable-extensions',
          `--window-size=${width},${height}`,
        ],
        prefs: {
          'download.default_directory': downloadDir,
          'download.prompt_for_download': false,
          'download.directory_upgrade': true,
          'savefile.default_directory': downloadDir,
        },
      },
    },
  ],
  logLevel: 'info',
  //
  // Enables colors for log output.
  coloredLogs: true,

  baseUrl: baseURL,
  //
  // Default timeout for all waitForXXX commands.
  waitforTimeout: 3000,
  //
  // Default timeout in milliseconds for request
  // if Selenium Grid doesn't send response
  connectionRetryTimeout: 160000,
  //
  // Default request retries count
  connectionRetryCount: 3,

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
  },
  // Set directory to store all logs into
  outputDir: './build/reports/logs/',

  reporters: [
    'concise',
    [
      'allure',
      {
        outputDir: './build/reports/allure',
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: true,
      },
    ],
  ],

  // Hook that gets executed before the suite starts
  beforeSuite: async function (suite) {
    await browser.url(this.baseUrl);
  },
};

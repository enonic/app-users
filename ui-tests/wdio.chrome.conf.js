const path = require('path');
const { propertiesReader } = require('properties-reader');
const file = path.join(__dirname, './browser.properties');
const properties = propertiesReader({ sourceFile: file });
// Left unset in browser.properties, and then not sent at all: WebdriverIO reads the version off the
// installed Chrome and pairs a driver with it, with no version lookup and no download. Any value
// here - an exact version, but a channel ('stable') or a milestone just as much - makes it fetch a
// Chrome for Testing of its own into the browser cache under %TEMP%, which Windows is free to clean
// out from under it: a half-emptied cache leaves a browser that starts and hangs, and the run dies
// on 'session not created: DevToolsActivePort file doesn't exist'. Pin one only to reproduce a
// version-specific failure.
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
      ...(browser_version ? { browserVersion: String(browser_version) } : {}),
      'wdio:enforceWebDriverClassic': true,
      'goog:chromeOptions': {
        args: [
          '--headless',
          '--disable-gpu',
          '--no-sandbox',
          '--lang=en',
          // ! Nothing without a '--' belongs in this list. Chrome reads a bare word as a target to
          // ! open, Chromedriver passes one of its own, and 'Multiple targets are not supported in
          // ! headless mode' kills the browser before it writes its port file - which reaches the
          // ! run as 'session not created: DevToolsActivePort file doesn't exist'. The profile is
          // ! Chromedriver's own throwaway one anyway, so there is nothing here for '--guest' to do.
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
  // Set directory to store all logs into.
  //
  // ! Absolute, and it has to stay that way: Chromedriver puts Chrome's --user-data-dir under this
  // ! directory and passes it on as it reads here. Chrome 155 quits on the spot on a relative one
  // ! (exit code 21, no output), which reaches the run as 'session not created: DevToolsActivePort
  // ! file doesn't exist' - the browser is gone before it can write the port file.
  outputDir: path.join(__dirname, './build/reports/logs'),

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

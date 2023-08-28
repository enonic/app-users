const {TimelineService} = require('wdio-timeline-reporter/timeline-service');
const path = require('path');

exports.config = {

    specs: [
        path.join(__dirname, './tests/*.spec.js')
    ],
    maxInstances: 1,
    //
    // ============
    // Capabilities
    // ============
    capabilities: [{
        browserName: 'firefox',
        'moz:firefoxOptions': {
            "args": [
                "--headless", "--disable-gpu", "--no-sandbox",
                "--lang=en",
                '--disable-extensions',
                'window-size=1970,1000'
            ]
        }
    }],
    //
    // ===================
    // Test Configurations
    // ===================
    // Define all options that are relevant for the WebdriverIO instance here
    //
    // Level of logging verbosity: silent | verbose | command | data | result | error
    logLevel: 'info',
    //
    // Enables colors for log output.
    coloredLogs: true,

    //
    // Set a base URL in order to shorten url command calls. If your `url` parameter starts
    // with `/`, the base url gets prepended, not including the path portion of your baseUrl.
    // If your `url` parameter starts without a scheme or `/` (like `some/path`), the base url
    // gets prepended directly.
    baseUrl: 'http://localhost:8080/admin/tool',
    //
    // Default timeout for all waitForXXX commands.
    waitforTimeout: 2000,
    //
    // Default timeout in milliseconds for request
    // if Selenium Grid doesn't send response
    connectionRetryTimeout: 160000,
    //
    // Default request retries count
    connectionRetryCount: 3,
    services: [[TimelineService]],
    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd',
        timeout: 80000
    },
    //
    // Test reporter for stdout.
    // Set directory to store all logs into
    outputDir: "./build/reports/logs/",

    reporters: ['spec', 'concise',
        ['timeline', {outputDir: './build/reports/timeline'}]
    ],

    // Hook that gets executed before the suite starts
    beforeSuite: function (suite) {
        browser.url(this.baseUrl);
    },
};
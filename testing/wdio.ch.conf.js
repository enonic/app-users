const {ReportAggregator, HtmlReporter} = require('wdio-html-nice-reporter');
exports.config = {

    specs: [
        __dirname + '/tests/edit.user.spec.js'
    ],
    maxInstances: 1,

    capabilities: [{
        browserName: 'chrome',
        'goog:chromeOptions': {
            "args": [
                "--headless", "--disable-gpu", "--no-sandbox",
                "--lang=en",
                '--disable-extensions',
                'window-size=1920,1100'
            ]
        }

    }],

    logLevel: 'info',

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
    connectionRetryTimeout: 90000,
    //
    // Default request retries count
    connectionRetryCount: 3,

    // Make sure you have the wdio adapter package for the specific framework installed
    // before running any tests.
    services: ['chromedriver'],

    framework: 'mocha',
    mochaOpts: {
        timeout: 70000
    },
    // Set directory to store all logs into
    outputDir: __dirname+"/build/mochawesome-report/",
    //
    // Test reporter for stdout.
    // The only one supported by default is 'dot'
    // see also: http://webdriver.io/guide/testrunner/reporters.html

    reporters: ['spec',
        ["html-nice", {
            outputDir: './build/mochawesome-report/',
            filename: 'report.html',
            reportTitle: 'Suite Report Title',
            linkScreenshots: true,
            //to show the report in a browser when done
            showInBrowser: true,
            collapseTests: false,
            //to turn on screenshots after every test
            useOnAfterCommandForScreenshot: false,
        }
        ]
    ],

    //
    // Options to be passed to Mocha.
    // See the full list at http://mochajs.org/
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },

    // Hook that gets executed before the suite starts
    beforeSuite: function (suite) {
        browser.url(this.baseUrl);
    },

    onPrepare: function (config, capabilities) {

        reportAggregator = new ReportAggregator({
            outputDir: './build/mochawesome-report/',
            filename: 'report.html',
            reportTitle: 'App Applications Report',
            browserName: capabilities.browserName,
            collapseTests: true
        });
        reportAggregator.clean();
    },

    onComplete: function (exitCode, config, capabilities, results) {
        (async () => {
            await reportAggregator.createReport();
        })();
    },

};
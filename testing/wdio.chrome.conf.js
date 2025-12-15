const path = require('path');
let PropertiesReader = require('properties-reader');
const file = path.join(__dirname, '/browser.properties');
const properties = PropertiesReader(file);
const browser_version = properties.get('browser.version');
exports.config = {

    specs: [
        path.join(__dirname, './tests/*.spec.js')
    ],

    maxInstances: 5,

    capabilities: [{
        browserName: 'chrome',
        browserVersion: browser_version,
        "wdio:enforceWebDriverClassic": true,
        'goog:chromeOptions': {
            "args": [
                "--headless", "--disable-gpu", "--no-sandbox",
                "--lang=en",
                '--disable-extensions',
                // Performance optimizations for headless Chrome:
                '--disable-dev-shm-usage',  // Overcome limited resource problems in containers
                '--disable-software-rasterizer',  // Disable software rasterizer for better performance
                '--disable-background-timer-throttling',  // Prevent background tab throttling
                '--disable-backgrounding-occluded-windows',  // Keep windows active when occluded
                '--disable-renderer-backgrounding',  // Prevent renderer process backgrounding
                'window-size=1970,1000'
            ]
        }
    }],
    logLevel: 'info',
    //
    // Enables colors for log output.
    coloredLogs: true,

    baseUrl: 'http://localhost:8080/admin',
    //
    // Default timeout for all waitForXXX commands.
    waitforTimeout: 5000,
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
        timeout: 60000
    },
    // Set directory to store all logs into
    outputDir: "./build/reports/logs/",

    reporters: ['concise',
        ['allure', {outputDir: './build/reports/allure', disableWebdriverStepsReporting: true, disableWebdriverScreenshotsReporting: true,}],
    ],

    // Hook that gets executed before the suite starts
    beforeSuite: function (suite) {
        browser.url(this.baseUrl);
    },
};

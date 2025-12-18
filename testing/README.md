Users JavaScript UI Testing
===

### Building

Before trying to run tests, you need to verify that the following software are installed:

* Java 11 for building and running;
* node.js installed on system;
* Git installed on system;

### Performance Monitoring

Timing logs for wait and pause operations are **enabled by default** to help identify slow operations:

```
[TIMING] waitForRowByNameVisible [testuser]: 1250ms
[TIMING] pause [after typeSearchText]: 200ms
[TIMING] waitForSpinnerNotVisible [after typeSearchText]: 340ms
```

To disable timing logs, set the `LOG_TIMING` environment variable to `false`:

```bash
export LOG_TIMING=false
```

Run tests for app-users:


here are 2 modes for running tests.

`Standalone` mode is convenient for running one suite(file) with tests
1. Start your local XP
2. Go to `/app-users/testing/` folder and install required libs
   ``` npm install ```
3. make sure that your local configuration files do not differ from the files located in the folder `/app-contentstudio/testing/test-applications/common-config/`
4. copy all test-applications (`app-users/testing/test-data/test-applications/`) from  into your local `deploy` folder, these applications will import test data
5. Open a `*.spec` file in `Idea` and press 'Run' button in `Idea` toolbar
6. Specify the path to `Mocha package` in Idea-Run modal dialog: `app-users\testing\node_modules\mocha`

After these steps special `Browser for testing` will be installed and started on your local environment
While the tests are running, you should not perform any actions in you local Content Studio, as this may affect the test results


`WDIO` mode is suitable for testing on big scale.(on GitHub)
Start ui-tests on your local environment:
1. Start your local XP
2. make sure that your local configuration files do not differ from the files located in the folder `/app-users/testing/test-data/common-config/`
3. copy all test-applications (`app-contentstudio/testing/test-applications/`) from  into your local `deploy` folder, these applications will import test data
4. open `app-users/testing/wdio.users.chrome.conf.js` in Idea and check the specifications that will be run.
   You can specify a single test or folder with files

    ``` specs: [
        path.join(__dirname, './tests/*.spec.js')
    ],```

5. go to `app-users` and run the command:
   ```gradlew w_testUsersAppLocal```  run ui-tests for Users

6. If you want to see how tests are executed in the browser, then remove ``headless`` option in `wdio.users.chrome.conf.js`

```
 'goog:chromeOptions': {
            "args": [
                "--headless", "--disable-gpu", "--no-sandbox",
                "--lang=en",
                '--disable-extensions',
                `window-size=${width},${height}`
            ]
```
Start ui-tests on GitHub environment,  go to `app-users`:
All these commands downloads XP distro, unpacks and starts the server(test apps will be copied to the `deploy` folder before the starting)
```gradlew w_testUsersApp```


Test reports and screenshot you can find in the folder: ```app-users\testing\build\reports\```




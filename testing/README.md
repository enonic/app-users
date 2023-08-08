Users JavaScript UI Testing
===

### Building

Before trying to run tests, you need to verify that the following software are installed:

* Java 11 for building and running;
* node.js installed on system;
* Git installed on system;
* Chrome browser installed on system.

Run tests for app-admin-home.
go to '/testing' folder and run:
  1. gradlew testUsersApp run tests in standalone mode with selenium-server
  2. gradlew testUsersAppLocally  --project-cache-dir d:/cache
  3. gradlew w_testUsersApp run tests with wdio runner



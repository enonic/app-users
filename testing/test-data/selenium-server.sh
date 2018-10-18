#!/bin/sh


run() {
    exec java -Dwebdriver.chrome.driver=./test-data/chromedriver -jar ./test-data/selenium-server-standalone-3.4.0.jar

}

main() {

    run
}

main

@echo off



:execute
java -Dwebdriver.chrome.driver=./test-data/chromedriver.exe -jar ./test-data/selenium-server-standalone-3.4.0.jar

endlocal

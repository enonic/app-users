const webDriverHelper = require('../libs/WebDriverHelper');
const appConst = require('../libs/app_const');
const lib = require('../libs/elements');
const path = require('path');
const fs = require('fs');

class Page {

    constructor() {
        if (typeof browser !== 'undefined') {
            this.browser = browser;
        } else {
            this.browser = webDriverHelper.browser;
        }
    }

    getBrowser() {
        return this.browser;
    }

    findElement(selector) {
        return this.browser.$(selector);
    }

    findElements(selector) {
        return this.browser.$$(selector);
    }

    // value: string | string[]
    keys(value) {
        return this.browser.keys(value);
    }

    pause(ms) {
        return this.browser.pause(ms);
    }

    async clickOnElement(selector) {
        let element = await this.findElement(selector);
        await element.waitForDisplayed({timeout: 1000});
        return await element.click();
    }

    async getText(selector) {
        let element = await this.findElement(selector);
        return await element.getText();
    }

    async getDisplayedElements(selector) {
        let elements = await this.findElements(selector);
        if (elements.length === 0) {
            return [];
        }
        return await this.doFilterDisplayedElements(elements);
    }

    async doFilterDisplayedElements(elements) {
        let pr = await elements.map(async (el) => await el.isDisplayed());
        let result = await Promise.all(pr);
        return elements.filter((el, i) => result[i]);
    }

    async getTextInElements(selector) {
        let strings = [];
        let elements = await this.findElements(selector);
        if (elements.length === 0) {
            return [];
        }
        await elements.forEach(el => {
            strings.push(el.getText());
        });
        return Promise.all(strings);
    }

    async getTextInDisplayedElements(selector) {
        let results = [];
        let elements = await this.getDisplayedElements(selector);
        if (elements.length === 0) {
            return [];
        }
        for (const item of elements) {
            results.push(await item.getText());
        }
        return results;
    }

    async typeTextInInput(selector, text) {
        let inputElement = await this.findElement(selector);
        await inputElement.setValue(text);
        let value = await inputElement.getValue();
        //workaround for issue in WebdriverIO
        if (value === "") {
            await inputElement.setValue(text);
        }
        return await this.pause(200);
    }

    async getTextInInput(selector) {
        let inputElement = await this.findElement(selector);
        return await inputElement.getValue();
    }

    async clearInputText(selector) {
        let inputElement = await this.findElement(selector);
        await inputElement.waitForDisplayed({timeout: 1000});
        await inputElement.clearValue();
        return await this.pause(200);
    }

    saveScreenshot(name) {
        let screenshotsDir = path.join(__dirname, '/../build/reports/screenshots/');
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir, {recursive: true});
        }
        return this.getBrowser().saveScreenshot(screenshotsDir + name + '.png').then(() => {
            console.log('screenshot is saved ' + name);
        }).catch(err => {
            console.log('screenshot was not saved ' + screenshotsDir + ' ' + err);
        })
    }

    async saveScreenshotUniqueName(namePart) {
        let screenshotName = appConst.generateRandomName(namePart);
        await this.saveScreenshot(screenshotName);
        return screenshotName;
    }

    async isElementDisplayed(selector) {
        let element = await this.findElement(selector);
        return await element.isDisplayed();
    }

    waitUntilDisplayed(selector, ms) {
        return this.getBrowser().waitUntil(() => {
            return this.getDisplayedElements(selector).then(result => {
                return result.length > 0;
            })
        }, {timeout: ms, timeoutMsg: 'Timeout exception. Element ' + selector + ' still not visible in: ' + ms});
    }

    async isElementEnabled(selector) {
        let element = await this.findElement(selector);
        return await element.isEnabled();
    }

    async waitForElementEnabled(selector, ms) {
        let element = await this.findElement(selector);
        return await element.waitForEnabled(ms);
    }

    async waitForElementDisabled(selector, ms) {
        let element = await this.findElement(selector);
        return await element.waitForEnabled({timeout: ms, reverse: true});
    }

    async waitForElementNotDisplayed(selector, ms) {
        let element = await this.findElement(selector);
        return await element.waitForDisplayed({timeout: ms, reverse: true});
    }

    waitUntilElementNotDisplayed(selector, ms) {
        return this.getBrowser().waitUntil(() => {
            return this.getDisplayedElements(selector).then(result => {
                return result.length === 0;
            })
        }, {timeout: ms, timeoutMsg: "Timeout exception. Element " + selector + " still visible in: " + ms});
    }


    async waitForElementDisplayed(selector, ms) {
        let element = await this.findElement(selector);
        return await element.waitForDisplayed({timeout: ms});
    }

    waitForSpinnerNotVisible() {
        let message = "Spinner still displayed! timeout is " + appConst.TIMEOUT_7;
        return this.browser.waitUntil(() => {
            return this.isElementNotDisplayed("//div[@class='spinner']");
        }, {timeout: appConst.TIMEOUT_7, timeoutMsg: message});
    }

    waitUntilElementNotVisible(selector, timeout) {
        let message = "Element still displayed! timeout is " + appConst.TIMEOUT_7 + "  " + selector;
        return this.browser.waitUntil(() => {
            return this.isElementNotDisplayed(selector);
        }, {timeout: timeout, timeoutMsg: message});
    }

    async isElementNotDisplayed(selector) {
        let result = await this.getDisplayedElements(selector);
        return result.length === 0;
    }

    async getAttribute(selector, attributeName) {
        let element = await this.findElement(selector);
        return await element.getAttribute(attributeName);
    }

    async waitForNotificationMessage() {
        try {
            let notificationXpath = lib.NOTIFICATION_TEXT;
            await this.getBrowser().waitUntil(async () => {
                return await this.isElementDisplayed(notificationXpath);
            }, {timeout: appConst.mediumTimeout});
            await this.pause(400);
            return await this.getText(notificationXpath);
        } catch (err) {
            let screenshot = appConst.generateRandomName('err_notification');
            throw new Error(`Error occurred - notification message:screenshot:${screenshot} ` + err);
        }
    }

    async waitForExpectedNotificationMessage(expectedMessage) {
        try {
            let selector = `//div[contains(@id,'NotificationMessage')]//div[contains(@class,'notification-text') and contains(.,'${expectedMessage}')]`;
            await this.waitForElementDisplayed(selector, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = appConst.generateRandomName('err_notification');
            await this.saveScreenshot(screenshot);
            throw new Error('expected notification message was not shown, screenshot ' + screenshot + "  " + err);
        }
    }

    async waitForErrorNotificationMessage() {
        try {
            let selector = `//div[contains(@id,'NotificationMessage') and @class='notification error']` + lib.NOTIFICATION_TEXT;
            await this.waitForElementDisplayed(selector, appConst.mediumTimeout);
            return await this.getText(selector);
        } catch (err) {
            let screenshot = appConst.generateRandomName('err_notification');
            await this.saveScreenshot(screenshot);
            throw new Error("Error notification message is not shown, screenshot: " + screenshot + "  " + err);
        }
    }

    //returns array of messages
    async waitForNotificationMessages() {
        try {
            await this.waitForElementDisplayed(lib.NOTIFICATION_TEXT, appConst.mediumTimeout);
            await this.pause(300);
            return await this.getTextInDisplayedElements(lib.NOTIFICATION_TEXT);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_notification');
            throw new Error('Error when wait for notification message, screenshot: ' + screenshot + "  " + err);
        }
    }

    async doRightClick(selector) {
        let el = await this.findElement(selector);
        await el.moveTo();
        let xValue = await el.getLocation('x');
        let yValue = await el.getLocation('y');
        let y = parseInt(yValue);
        let x = parseInt(xValue);
        return await this.browser.performActions([{
            type: 'pointer',
            id: 'pointer1',
            parameters: {
                pointerType: 'mouse'
            },
            actions: [
                {type: "pointerMove", origin: "pointer", "x": x, "y": y},
                {
                    type: 'pointerDown',
                    button: 2
                }, {
                    type: 'pointerUp',
                    button: 2
                }]
        }]);
    }

    //is checkbox selected...
    async isSelected(selector) {
        let elem = await this.findElement(selector);
        return await elem.isSelected();
    }

    async pressEscKey() {
        await this.keys('Escape');
        return await this.pause(300);
    }

    async getBrowserStatus() {
        return await this.getBrowser().status();
    }

    async handleError(errorMessage, screenshotName, error) {
        let screenshot = await this.saveScreenshotUniqueName(screenshotName);
        throw new Error(`${errorMessage}, screenshot: ${screenshot} ` + error);
    }
}

module.exports = Page;

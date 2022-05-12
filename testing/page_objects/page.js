const webDriverHelper = require('../libs/WebDriverHelper');
const appConst = require('../libs/app_const');
const lib = require('../libs/elements');
const path = require('path');
const fs = require('fs');

class Page {

    constructor() {
        if (typeof browser !== "undefined") {
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

    async getDisplayedElements(selector) {
        let elements = await this.findElements(selector);
        let pr = elements.map(el => el.isDisplayed());
        return Promise.all(pr).then(result => {
            return elements.filter((el, i) => result[i]);
        });
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

    async getTextInElements(selector) {
        let strings = [];
        let elements = await this.findElements(selector);
        elements.forEach(el => {
            strings.push(el.getText());
        });
        return Promise.all(strings);
    }

    async typeTextInInput(selector, text) {
        let inputElement = await this.findElement(selector);
        await inputElement.setValue(text);
        let value = await inputElement.getValue();
        //workaround for issue in WebdriverIO
        if (value === "") {
            await inputElement.setValue(text);
        }
        return await inputElement.pause(300);
    }

    async getTextInInput(selector) {
        let inputElement = await this.findElement(selector);
        return await inputElement.getValue(selector);
    }

    async clearInputText(selector) {
        let inputElement = await this.findElement(selector);
        await inputElement.waitForDisplayed({timeout: 1000});
        await inputElement.clearValue();
        return await inputElement.pause(300);
    }

    saveScreenshot(name) {
        let screenshotsDir = path.join(__dirname, '/../build/mochawesome-report/screenshots/');
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir, {recursive: true});
        }
        return this.getBrowser().saveScreenshot(screenshotsDir + name + '.png').then(() => {
            console.log('screenshot is saved ' + name);
        }).catch(err => {
            console.log('screenshot was not saved ' + screenshotsDir + ' ' + err);
        })
    }

    async isElementDisplayed(selector) {
        let element = await this.findElement(selector);
        return element.isDisplayed();
    }

    async isElementEnabled(selector) {
        let element = await this.findElement(selector);
        return element.isEnabled();
    }

    async waitForElementEnabled(selector, ms) {
        let element = await this.findElement(selector);
        return element.waitForEnabled(ms);
    }

    async waitForElementDisabled(selector, ms) {
        let element = await this.findElement(selector);
        return await element.waitForEnabled({timeout: ms, reverse: true});
    }

    async waitForElementNotDisplayed(selector, ms) {
        let element = await this.findElement(selector);
        return element.waitForDisplayed({timeout: ms, reverse: true});
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
        return element.waitForDisplayed({timeout: ms});
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

    isElementNotDisplayed(selector) {
        return this.getDisplayedElements(selector).then(result => {
            return result.length === 0;
        })
    }

    async getAttribute(selector, attributeName) {
        let element = await this.findElement(selector);
        return element.getAttribute(attributeName);
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
            throw new Error('Error when wait for the notification message: ' + err);
        }
    }

    waitForExpectedNotificationMessage(expectedMessage) {
        let selector = `//div[contains(@id,'NotificationMessage')]//div[contains(@class,'notification-text') and contains(.,'${expectedMessage}')]`;
        return this.waitForElementDisplayed(selector, appConst.mediumTimeout).catch(err => {
            this.saveScreenshot('err_notification_mess');
            throw new Error('expected notification message was not shown! ' + err);
        })
    }

    waitForErrorNotificationMessage() {
        let selector = `//div[contains(@id,'NotificationMessage') and @class='notification error']` + lib.NOTIFICATION_TEXT;
        return this.waitForElementDisplayed(selector, appConst.mediumTimeout).then(() => {
            return this.getText(selector);
        })
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
}

module.exports = Page;

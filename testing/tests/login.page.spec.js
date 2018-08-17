const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
chai.Should();
const loginPage = require('../page_objects/login.page');
const appConst = require('../libs/app_const');
const testUtils = require('../libs/test.utils');

describe('Login Page specification', function () {

    this.timeout(17000);
    webDriverHelper.setupBrowser();

    it('check login page', () => {
        return loginPage.getTitle().then(function (title) {
            testUtils.saveScreenshot('login_page');
            assert.strictEqual(title, "Enonic XP - Login");
        })
    });

    it('check inputs on the login page', () => {
        return loginPage.isUserNameInputVisible(1000).then(function (result) {
            assert.isTrue(result, '"user name" input should be present');
        }).waitForExist(loginPage.passwordInput).then(function (result) {
            assert.isTrue(result, '"password" input should be present');
        }).isVisible(loginPage.loginButton).then(function (result) {
            assert.isFalse(result, 'login button should be not visible');
        });
    });

    it('when "user name" and "password" have typed then "login button" should be visible', () => {
        loginPage.typeUserName('su');
        loginPage.typePassword('password');
        return loginPage.waitForLoginButtonVisible(appConst.TIMEOUT_3).then(function (result) {
            assert.isTrue(result, 'login button should be not visible');
        });
    });
    before(()=> {
        return console.log('specification starting: ' + this.title);
    });
});

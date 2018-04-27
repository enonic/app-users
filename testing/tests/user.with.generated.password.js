/**
 * Created on 13.04.2018.*
 */

const chai = require('chai');
chai.use(require('chai-as-promised'));
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const userWizard = require('../page_objects/wizardpanel/user.wizard');
const userBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const loginPage = require('../page_objects/login.page');
const launcherPanel = require('../page_objects/launcher.panel');

describe('Create an user with generated password and log in the user', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();
    let testUser;
    let userName;
    let password;
    it('WHEN `User`with roles has been added THEN the user should be searchable',
        () => {
            let permissions = ['Administration Console Login', 'Content Manager App'];
            userName = userItemsBuilder.generateRandomName('user');
            testUser = userItemsBuilder.buildUser(userName, null, userItemsBuilder.generateEmail(userName), permissions);
            return testUtils.navigateToUsersApp().then(()=> {
                return testUtils.clickOnSystemOpenUserWizard();
            }).then(()=> {
                return userWizard.typeDataAndGeneratePassword(testUser);
            }).then(()=> {
                return userWizard.getTextInPasswordInput();
            }).then((result)=> {
                password = result;
            }).then(()=> {
                return userWizard.waitAndClickOnSave();
            }).then(()=> {
                return userBrowsePanel.doClickOnCloseTabAndWaitGrid(userName);
            }).then(()=> {
                return testUtils.typeNameInFilterPanel(userName);
            }).then(()=> {
                return assert.eventually.isTrue(userBrowsePanel.isItemDisplayed(userName), 'user should be present in the grid');
            })
        });

    it('WHEN user name and `generated` password have been typed AND `login-button` pressed THEN user should be `logged in`',
        () => {
            return testUtils.doCloseUsersApp().then(()=> {
                return launcherPanel.clickOnLogoutLink();
            }).then(()=> {
                return loginPage.doLogin(userName, password);
            }).then(()=> {
                return launcherPanel.waitForPanelVisible();
            })
        });

    before(()=> {
        return console.log('specification starting: ' + this.title);
    });
});

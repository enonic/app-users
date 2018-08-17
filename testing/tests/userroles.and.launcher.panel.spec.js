/**
 * Created on 20.03.2018.
 * Verifies the  https://github.com/enonic/xp-apps/issues/690
 * Applications and Users links should not be present on the LauncherPanel, when an user has no Administrator role
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

describe('Checks links on Launcher Panel when an user has various roles', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();
    let testUser;
    let userName;
    let password = '1q2w3e';
    it('WHEN `User`with roles has been added THEN the user should be searchable',
        () => {
            let permissions = ['Administration Console Login', 'Content Manager App'];
            userName = userItemsBuilder.generateRandomName('user');
            testUser = userItemsBuilder.buildUser(userName, password, userItemsBuilder.generateEmail(userName), permissions);
            return testUtils.navigateToUsersApp().then(() => {
                return testUtils.clickOnSystemOpenUserWizard();
            }).then(() => {
                return userWizard.typeData(testUser);
            }).then(() => {
                return userWizard.waitAndClickOnSave();
            }).then(() => {
                return userBrowsePanel.doClickOnCloseTabAndWaitGrid(userName);
            }).then(() => {
                return testUtils.typeNameInFilterPanel(userName);
            }).then(() => {
                return assert.eventually.isTrue(userBrowsePanel.isItemDisplayed(userName), 'user should be present in the grid');
            })
        });
    //Verifies the  https://github.com/enonic/xp-apps/issues/690
    it('WHEN the user is logged in AND the user has no Administrator-role THEN `Applications` and `Users` links must not be present on the launcher panel',
        () => {
            return testUtils.doCloseUsersApp().then(() => {
                return launcherPanel.clickOnLogoutLink();
            }).then(() => {
                return loginPage.doLogin(userName, password);
            }).then(() => {
                return launcherPanel.waitForPanelVisible();
            }).then(() => {
                testUtils.saveScreenshot("user_has_no_admin");
                return assert.eventually.isFalse(launcherPanel.isApplicationsLinkDisplayed(),
                    'Applications link should not be displayed, because the user has no Admin-role');
            }).then(result => {
                return assert.eventually.isFalse(launcherPanel.isUsersLinkDisplayed(),
                    'Users link should not be displayed, because the user has no Admin-role');
            })
        });

    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});

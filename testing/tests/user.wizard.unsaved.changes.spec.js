/**
 * Created on 06.11.2017.
 */

const chai = require('chai');
chai.use(require('chai-as-promised'));
const assert = chai.assert;
const expect = chai.expect;
const webDriverHelper = require('../libs/WebDriverHelper');
const userWizard = require('../page_objects/wizardpanel/user.wizard');
const saveBeforeClose = require('../page_objects/save.before.close.dialog');
const userBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');

describe('User Wizard and `Save Before Close dialog`', function () {
    this.timeout(70000);
    webDriverHelper.setupBrowser();
    let testUser;

    it('GIVEN user-wizard is opened AND display name has been typed WHEN close button pressed THEN Save Before Close dialog should appear',
        () => {
            return testUtils.clickOnSystemOpenUserWizard().then(()=> {
                return userWizard.typeDisplayName('test-user');
            }).then(()=> {
                return userBrowsePanel.doClickOnCloseTabButton('test-user');
            }).then(()=> {
                return saveBeforeClose.waitForDialogVisible(appConst.TIMEOUT_3);
            });
        });

    it('WHEN the user has been saved THEN the user should be present in the grid',
        () => {
            //this.bail(true);
            let userName = userItemsBuilder.generateRandomName('user');
            let roles = [appConst.roles.CM_ADMIN, appConst.roles.USERS_ADMINISTRATOR];
            testUser = userItemsBuilder.buildUser(userName, '1q2w3e', userItemsBuilder.generateEmail(userName), roles);
            return testUtils.addSystemUser(testUser).then(()=> {
                return testUtils.typeNameInFilterPanel(userName);
            }).then(()=> {
                return expect(userBrowsePanel.isItemDisplayed(userName)).to.eventually.be.true;
            })
        });

    it('GIVEN existing user is opened WHEN display name has been changed AND `Close` button pressed THEN Save Before Close dialog should appear',
        () => {
            return testUtils.selectUserAndOpenWizard(testUser.displayName).then(()=> {
                return userWizard.typeDisplayName('new-name');
            }).pause(500).then(()=> {
                return userBrowsePanel.doClickOnCloseTabButton('new-name');
            }).then(()=> {
                return saveBeforeClose.waitForDialogVisible(appConst.TIMEOUT_3);
            });
        });

    it('GIVEN existing user is opened WHEN e-mail name has been changed AND `Close` button pressed THEN Save Before Close dialog should appear',
        () => {
            return testUtils.selectUserAndOpenWizard(testUser.displayName).then(()=> {
                return userWizard.typeEmail('new@gmail.com');
            }).pause(500).then(()=> {
                return userBrowsePanel.doClickOnCloseTabButton(testUser.displayName);
            }).then(()=> {
                return saveBeforeClose.waitForDialogVisible(2000);
            });
        });

    it('GIVEN existing user is opened WHEN one role has been removed AND `Close` button pressed THEN Save Before Close dialog should appear',
        () => {
            return testUtils.selectUserAndOpenWizard(testUser.displayName).then(()=> {
                return userWizard.removeRole(appConst.roles.USERS_ADMINISTRATOR);
            }).pause(500).then(()=> {
                return userBrowsePanel.doClickOnCloseTabButton(testUser.displayName);
            }).then(()=> {
                return saveBeforeClose.waitForDialogVisible(appConst.TIMEOUT_3);
            });
        });
    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(()=> {
        return console.log('specification starting: ' + this.title);
    });
});


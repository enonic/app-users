/**
 * Created on 06.11.2017.
 */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const assert = chai.assert;
const expect = chai.expect;
const webDriverHelper = require('../libs/WebDriverHelper');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const SaveBeforeClose = require('../page_objects/save.before.close.dialog');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');

describe('User Wizard and `Save Before Close dialog`', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();
    let testUser;

    it('GIVEN user-wizard is opened AND display name has been typed WHEN close button pressed THEN Save Before Close dialog should appear',
        () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let saveBeforeClose = new SaveBeforeClose();
            return testUtils.clickOnSystemOpenUserWizard().then(() => {
                return userWizard.typeDisplayName('test-user');
            }).then(() => {
                return userBrowsePanel.doClickOnCloseTabButton('test-user');
            }).then(() => {
                return saveBeforeClose.waitForDialogOpened();
            });
        });

    it('WHEN the user has been saved THEN the user should be present in the grid',
        () => {
            let userBrowsePanel = new UserBrowsePanel();
            let userName = userItemsBuilder.generateRandomName('user');
            let roles = [appConst.roles.CM_ADMIN, appConst.roles.USERS_ADMINISTRATOR];
            testUser = userItemsBuilder.buildUser(userName, '1q2w3e', userItemsBuilder.generateEmail(userName), roles);
            return testUtils.addSystemUser(testUser).then(() => {
                return testUtils.typeNameInFilterPanel(userName);
            }).then(() => {
                return expect(userBrowsePanel.isItemDisplayed(userName)).to.eventually.be.true;
            })
        });

    it('GIVEN existing user is opened WHEN display name has been changed AND `Close` button pressed THEN Save Before Close dialog should appear',
        () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let saveBeforeClose = new SaveBeforeClose();
            return testUtils.selectUserAndOpenWizard(testUser.displayName).then(() => {
                return userWizard.typeDisplayName('new-name');
            }).then(() => {
                return userBrowsePanel.doClickOnCloseTabButton('new-name');
            }).then(() => {
                return saveBeforeClose.waitForDialogOpened();
            });
        });

    it('GIVEN existing user is opened WHEN e-mail name has been changed AND `Close` button pressed THEN Save Before Close dialog should appear',
        () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let saveBeforeClose = new SaveBeforeClose();
            return testUtils.selectUserAndOpenWizard(testUser.displayName).then(() => {
                return userWizard.typeEmail('new@gmail.com');
            }).then(() => {
                return userBrowsePanel.doClickOnCloseTabButton(testUser.displayName);
            }).then(() => {
                return saveBeforeClose.waitForDialogOpened();
            });
        });

    it('GIVEN existing user is opened WHEN one role has been removed AND `Close` button pressed THEN Save Before Close dialog should appear',
        () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let saveBeforeClose = new SaveBeforeClose();
            return testUtils.selectUserAndOpenWizard(testUser.displayName).then(() => {
                return userWizard.removeRole(appConst.roles.USERS_ADMINISTRATOR);
            }).then(() => {
                return userBrowsePanel.doClickOnCloseTabButton(testUser.displayName);
            }).then(() => {
                return saveBeforeClose.waitForDialogOpened();
            });
        });
    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});


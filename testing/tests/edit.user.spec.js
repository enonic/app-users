/**
 * Created on 04.10.2017.
 */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const assert = chai.assert;
const expect = chai.expect;
const webDriverHelper = require('../libs/WebDriverHelper');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const UserStatisticsPanel = require('../page_objects/browsepanel/user.statistics.panel');

describe('`edit.user.spec`: Edit an user - change e-mail, name and roles', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();
    let testUser;

    it('GIVEN `User` with a role has been saved WHEN the user has been clicked THEN correct role should be displayed on the statistic panel',
        () => {
            this.bail(1);
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let userStatisticsPanel = new UserStatisticsPanel();
            let userName = userItemsBuilder.generateRandomName('user');
            let roles = [appConst.roles.CM_ADMIN, appConst.roles.USERS_ADMINISTRATOR];
            testUser = userItemsBuilder.buildUser(userName, '1q2w3e', userItemsBuilder.generateEmail(userName), roles);
            return testUtils.clickOnSystemOpenUserWizard().then(()=> {
                testUtils.saveScreenshot('edit_user_wizard1');
                return userWizard.typeData(testUser);
            }).then(()=> {
                testUtils.saveScreenshot('edit_user_wizard2');
                return userWizard.waitAndClickOnSave();
            }).then(()=> {
                return userBrowsePanel.clickOnAppHomeButton();
            }).then(()=> {
                return testUtils.typeNameInFilterPanel(userName);
            }).then(()=> {
                testUtils.saveScreenshot('edit_user_wizard3');
                return userBrowsePanel.clickOnRowByName(userName);
            }).then(()=> {
                testUtils.saveScreenshot('edit_user_wizard4');
                return userStatisticsPanel.getDisplayNameOfRoles();
            }).then(roles => {
                assert.equal(roles[0], appConst.roles.CM_ADMIN, '`Content Manager Administrator` role should be present on the panel');
                assert.equal(roles[1], appConst.roles.USERS_ADMINISTRATOR,
                    '`Content Manager Administrator` role should be present on the panel');
            }).then(()=> {
                return expect(userStatisticsPanel.getItemName()).to.eventually.be.equal(userName);
            })
        });

    it('GIVEN existing user is opened WHEN display name has been changed THEN user should be searchable with the new display name',
        () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            return testUtils.selectUserAndOpenWizard(testUser.displayName).then(()=> {
                return userWizard.typeDisplayName('new-name');
            }).then(()=> {
                return testUtils.saveAndCloseWizard('new-name');
            }).then(()=> {
                return testUtils.typeNameInFilterPanel('new-name');
            }).then(()=> {
                return expect(userBrowsePanel.isItemDisplayed(testUser.displayName)).to.eventually.be.true;
            })
        });

    it('GIVEN existing user is opened WHEN one role has been removed THEN the role should not be present on the statistics panel',
        () => {
            let userWizard = new UserWizard();
            let userStatisticsPanel = new UserStatisticsPanel();
            return testUtils.selectUserAndOpenWizard(testUser.displayName).then(()=> {
                return userWizard.removeRole(appConst.roles.USERS_ADMINISTRATOR);
            }).then(()=> {
                return testUtils.saveAndCloseWizard('new-name');
            }).then(()=> {
                return userStatisticsPanel.getDisplayNameOfRoles();
            }).then(roles => {
                assert.equal(roles.length, 1, 'one role should be present on the statistics panel');
                assert.equal(roles[0], appConst.roles.CM_ADMIN, '`Content Manager Administrator` role should be present on the panel');
            })
        });

    it('GIVEN existing user is opened WHEN e-mail has been changed and saved THEN updated e-mail should be present on the statistics panel',
        () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let userStatisticsPanel = new UserStatisticsPanel();
            let newEmail = userItemsBuilder.generateEmail(testUser.displayName);
            return testUtils.selectUserAndOpenWizard(testUser.displayName).then(()=> {
                return userWizard.clearEmailInput();
            }).then(()=> {
                return userWizard.typeEmail(newEmail);
            }).then(()=> {
                return userWizard.waitAndClickOnSave();
            }).then(()=> {
                return userBrowsePanel.clickOnAppHomeButton();
            }).then(()=> {
                return userStatisticsPanel.getEmail();
            }).then(email => {
                assert.equal(email[0], newEmail, 'email should be updated on the statistics panel as well');
            })
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(()=> {
        return console.log('specification starting: ' + this.title);
    });
});

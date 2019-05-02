/**
 * Created on 09.11.2017.
 */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const assert = chai.assert;
const expect = chai.expect;
const webDriverHelper = require('../libs/WebDriverHelper');
const RoleWizard = require('../page_objects/wizardpanel/role.wizard');
const SaveBeforeClose = require('../page_objects/save.before.close.dialog');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');

describe('Role Wizard and `Save Before Close dialog`', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();
    let testrole;

    it('GIVEN role-wizard is opened AND display name has been typed WHEN close button pressed THEN Save Before Close dialog should appear',
        () => {
            let roleWizard = new RoleWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let saveBeforeClose = new SaveBeforeClose();
            return testUtils.clickOnRolesFolderAndOpenWizard().then(() => {
                return roleWizard.typeDisplayName('test-role');
            }).then(() => {
                return userBrowsePanel.doClickOnCloseTabButton('test-role');
            }).then(() => {
                return saveBeforeClose.waitForDialogOpened();
            });
        });

    it('WHEN new role has been added THEN the group should be present in the grid',
        () => {
            let userBrowsePanel = new UserBrowsePanel();
            let roleName = userItemsBuilder.generateRandomName('role');
            testrole = userItemsBuilder.buildRole(roleName, 'description', null);
            return testUtils.openWizardAndSaveRole(testrole).then(() => {
                return testUtils.typeNameInFilterPanel(roleName);
            }).then(() => {
                return expect(userBrowsePanel.isItemDisplayed(roleName)).to.eventually.be.true;
            })
        });

    it('GIVEN existing role is opened WHEN display name has been changed AND `Close` button pressed THEN Save Before Close dialog should appear',
        () => {
            let userBrowsePanel = new UserBrowsePanel();
            let roleWizard = new RoleWizard();
            let saveBeforeClose = new SaveBeforeClose();
            return testUtils.selectRoleAndOpenWizard(testrole.displayName).then(() => {
                return roleWizard.typeDisplayName('new-name');
            }).then(() => {
                return userBrowsePanel.doClickOnCloseTabButton('new-name');
            }).then(() => {
                //the modal dialog should appear
                return saveBeforeClose.waitForDialogOpened();
            });
        });

    it('GIVEN existing role is opened WHEN description has been changed AND `Close` button pressed THEN Save Before Close dialog should appear',
        () => {
            let userBrowsePanel = new UserBrowsePanel();
            let roleWizard = new RoleWizard();
            let saveBeforeClose = new SaveBeforeClose();
            return testUtils.selectRoleAndOpenWizard(testrole.displayName).then(() => {
                return roleWizard.typeDescription('new-description');
            }).then(() => {
                return userBrowsePanel.doClickOnCloseTabButton(testrole.displayName);
            }).then(() => {
                return saveBeforeClose.waitForDialogOpened();
            });
        });

    it('GIVEN existing role is opened WHEN member has been added AND `Close` button pressed THEN Save Before Close dialog should appear',
        () => {
            let userBrowsePanel = new UserBrowsePanel();
            let roleWizard = new RoleWizard();
            let saveBeforeClose = new SaveBeforeClose();
            return testUtils.selectRoleAndOpenWizard(testrole.displayName).then(() => {
                return roleWizard.filterOptionsAndAddMember('Super User');
            }).then(() => {
                return userBrowsePanel.doClickOnCloseTabButton(testrole.displayName);
            }).then(() => {
                return saveBeforeClose.waitForDialogOpened(appConst.TIMEOUT_3);
            });
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});


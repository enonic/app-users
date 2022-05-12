/**
 * Created on 12/08/2019.
 */
const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const appConst = require('../libs/app_const');
const userItemsBuilder = require('../libs/userItems.builder.js');
const testUtils = require('../libs/test.utils');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const GroupWizard = require('../page_objects/wizardpanel/group.wizard');
const RoleWizard = require('../page_objects/wizardpanel/role.wizard');
const IdProviderWizard = require('../page_objects/wizardpanel/idprovider.wizard');
const ConfirmationDialog = require('../page_objects/confirmation.dialog');

describe(`wizard.toolbar.shortcut.spec, wizard's toolbar shortcut specification`, function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === "undefined") {
        webDriverHelper.setupBrowser();
    }

    let TEST_USER;
    let TEST_GROUP;
    let TEST_ROLE;
    let TEST_PROVIDER;
    let PASSWORD = appConst.PASSWORD.MEDIUM;

    it(`GIVEN new user-wizard is opened AND data has been typed WHEN 'Ctrl+s' has been pressed THEN the user should be saved`,
        async () => {
            let userWizard = new UserWizard();
            let userName = userItemsBuilder.generateRandomName('user');
            TEST_USER = userItemsBuilder.buildUser(userName, PASSWORD, userItemsBuilder.generateEmail(userName), null);
            //User-wizard is opened:
            await testUtils.clickOnSystemOpenUserWizard();
            //User's data has been typed:
            await userWizard.typeDisplayName(TEST_USER.displayName);
            await userWizard.typeEmail(TEST_USER.email);
            await userWizard.typePassword(PASSWORD);
            await userWizard.waitForSaveButtonEnabled();
            //keyboard shortcut to Save button has been pressed:
            await userWizard.hotKeySave();
            testUtils.saveScreenshot("user_shortcut_save");

            let message = await userWizard.waitForNotificationMessage();
            assert.equal(message, appConst.USER_WAS_CREATED_MESSAGE, "User was created - message should appear");
        });
    it(`GIVEN existing user is opened WHEN 'Ctrl+del' has been pressed THEN confirmation modal dialog should appear`,
        async () => {
            let userWizard = new UserWizard();
            let confirmationDialog = new ConfirmationDialog();
            //User-wizard is opened:
            await testUtils.selectUserAndOpenWizard(TEST_USER.displayName);
            //keyboard shortcut to Delete button has been pressed:
            await userWizard.hotKeyDelete();
            testUtils.saveScreenshot("user_shortcut_delete");
            //Confirmation dialog should be loaded:
            await confirmationDialog.waitForDialogLoaded();
        });

    it(`GIVEN new group-wizard is opened AND data has been typed WHEN 'Ctrl+s' has been pressed THEN the group should be saved`,
        async () => {
            let name = userItemsBuilder.generateRandomName('group');
            let roles = ['Users App'];
            let description = 'test group1';
            let groupWizard = new GroupWizard();
            TEST_GROUP = userItemsBuilder.buildGroup(name, description, null, roles);
            //Group-wizard is opened:
            await testUtils.clickOnSystemAndOpenGroupWizard();
            //Group's data has been typed:
            await groupWizard.typeDisplayName(TEST_GROUP.displayName);

            await groupWizard.waitForSaveButtonEnabled();
            //keyboard shortcut to save button has been pressed:
            await groupWizard.hotKeySave();
            testUtils.saveScreenshot("group_shortcut_save");

            let message = await groupWizard.waitForNotificationMessage();
            assert.equal(message, appConst.GROUP_WAS_CREATED, "Group was created - message should appear");
        });

    it(`GIVEN existing group is opened WHEN 'Ctrl+del' has been pressed THEN confirmation modal dialog should appear`,
        async () => {
            let groupWizard = new GroupWizard();
            let confirmationDialog = new ConfirmationDialog();
            //User-wizard is opened:
            await testUtils.selectGroupAndOpenWizard(TEST_GROUP.displayName);
            //keyboard shortcut to Delete button has been pressed:
            await groupWizard.hotKeyDelete();
            testUtils.saveScreenshot("group_shortcut_delete");
            //Confirmation dialog should be loaded:
            await confirmationDialog.waitForDialogLoaded();
        });

    it(`GIVEN new role-wizard is opened AND data has been typed WHEN 'Ctrl+s' has been pressed THEN the role should be saved`,
        async () => {
            let roleWizard = new RoleWizard();
            let roleName = userItemsBuilder.generateRandomName('role');
            TEST_ROLE = userItemsBuilder.buildRole(roleName, 'description', null);
            //Role-wizard is opened:
            await testUtils.clickOnRolesFolderAndOpenWizard();
            //Role's data has been typed:
            await roleWizard.typeDisplayName(TEST_ROLE.displayName);
            await roleWizard.waitForSaveButtonEnabled();

            //keyboard shortcut to Save button has been pressed:
            await roleWizard.hotKeySave();
            testUtils.saveScreenshot("role_shortcut_save");

            let message = await roleWizard.waitForNotificationMessage();
            assert.equal(message, appConst.ROLE_WAS_CREATED_MESSAGE, "Role was created - message should appear");
        });

    it(`GIVEN existing role is opened WHEN 'Ctrl+del' has been pressed THEN confirmation modal dialog should appear`,
        async () => {
            let roleWizard = new RoleWizard();
            let confirmationDialog = new ConfirmationDialog();
            //Role-wizard is opened:
            await testUtils.selectRoleAndOpenWizard(TEST_ROLE.displayName);
            //keyboard shortcut to Delete button has been pressed:
            await roleWizard.hotKeyDelete();
            testUtils.saveScreenshot("group_shortcut_delete");
            //Confirmation dialog should be loaded:
            await confirmationDialog.waitForDialogLoaded();
        });

    it(`GIVEN new 'id provider'-wizard is opened AND data has been typed WHEN 'Ctrl+s' has been pressed THEN the provider should be saved`,
        async () => {
            let name = userItemsBuilder.generateRandomName('provider');
            TEST_PROVIDER = userItemsBuilder.buildIdProvider(name, 'test Id provider', null, null);
            let idProviderWizard = new IdProviderWizard();
            //new ID provider-wizard is opened:
            await testUtils.openIdProviderWizard();
            // data has been typed:
            await idProviderWizard.typeDisplayName(TEST_PROVIDER.displayName);
            await idProviderWizard.waitForSaveButtonEnabled();
            //keyboard shortcut to Save button has been pressed:
            await idProviderWizard.hotKeySave();
            testUtils.saveScreenshot("provider_shortcut_save");

            let message = await idProviderWizard.waitForNotificationMessage();
            assert.equal(message, appConst.PROVIDER_CREATED_NOTIFICATION, "Id provider was created - message should appear");
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(async () => {
        await testUtils.getBrowser().maximizeWindow();
        return console.log('specification starting: ' + this.title);
    });
});

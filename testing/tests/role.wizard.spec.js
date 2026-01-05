/**
 * Created on 12.09.2017.
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const RoleWizard = require('../page_objects/wizardpanel/role.wizard');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const RoleStatisticsPanel = require('../page_objects/browsepanel/role.statistics.panel');

describe('Role Wizard and Statistics Panel spec', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    let TEST_ROLE;

    // Verifies It shouldn't be possible to unassign system.administrator role from su user
    // https://github.com/enonic/app-users/issues/1227
    it(`WHEN Administrator role is opened THEN remove icon should not be displayed for SU in Members form`,
        async () => {
            let roleWizard = new RoleWizard();
            // 1. Open 'Administrator' role:
            await testUtils.selectRoleAndOpenWizard(appConst.ROLES_NAME.ADMINISTRATOR);
            // 2. ADMINISTRATOR role  should be with members:
            let members = await roleWizard.getMembers();
            assert.ok(members.length > 0, "Admin role should have members");
            assert.ok(members.includes("Super User"), 'Super User should be present in members form');
            // 3. Remove icon should not be displayed for Super User in members form:
            await roleWizard.waitForRemoveMemberIconNotDisplayed("Super User");
        });

    it('GIVEN `Roles` wizard is opened WHEN name and description has been typed AND `Save` button pressed THEN `Role was created` message should appear',
        async () => {
            let roleWizard = new RoleWizard();
            let userBrowsePanel = new UserBrowsePanel();
            TEST_ROLE = userItemsBuilder.buildRole(userItemsBuilder.generateRandomName('role'), 'description', null);
            // 1. Select Roles folder and save new role:
            await userBrowsePanel.clickOnRowByName('roles');
            await userBrowsePanel.clickOnNewButton();
            await roleWizard.waitForLoaded();
            await roleWizard.typeData(TEST_ROLE);
            await roleWizard.waitAndClickOnSave();
            // Verify the notification message:
            let actualMessage = await roleWizard.waitForNotificationMessage();
            assert.equal(actualMessage, 'Role was created', "'Role was created' message should appear");
        });

    // verifies: xp-apps#93 Incorrect message appears when try to create a role with name that already in use #93
    it(`GIVEN new 'role' wizard is opened WHEN the name that already in use has been typed THEN expected notification message should appear`,
        async () => {
            let roleWizard = new RoleWizard();
            // 1. Select Roles and open new wizard:
            await testUtils.clickOnRolesFolderAndOpenWizard();
            // 2. Type existing name:
            await roleWizard.typeDisplayName(TEST_ROLE.displayName);
            await roleWizard.pause(500);
            await roleWizard.waitAndClickOnSave();
            await roleWizard.waitForNotificationMessage();
            await testUtils.saveScreenshot('role_already_exists_notification');
            let errorMessages = await roleWizard.waitForErrorNotificationMessage();
            // 3. Error message should appear:
            let expectedMsg = `Principal [role:` + TEST_ROLE.displayName +
                              `] could not be created. A principal with that name already exists`;
            assert.ok(errorMessages.includes(expectedMsg), 'expected notification message should appear');
        });

    it(`GIVEN existing 'Role' is opened WHEN 'Super User' has been added in members THEN 'Super User' selected option should appear in the members form in the wizard`,
        async () => {
            let roleWizard = new RoleWizard();
            let userBrowsePanel = new UserBrowsePanel();
            // 1. Open the existing role:
            await testUtils.findAndSelectItem(TEST_ROLE.displayName);
            await userBrowsePanel.clickOnEditButton();
            await roleWizard.waitForLoaded();
            // 2. Add SU in members:
            await roleWizard.filterOptionsAndAddMember(appConst.SUPER_USER_DISPLAY_NAME);
            await roleWizard.pause(300);
            // 3.click on Save:
            await roleWizard.waitAndClickOnSave();
            await roleWizard.waitForNotificationMessage();
            // 4. Get selected options in members:
            let selectedOptions = await roleWizard.getMembers();
            assert.equal(selectedOptions[0], appConst.SUPER_USER_DISPLAY_NAME, "Super User should be in selected options");
        });

    it(`WHEN existing 'role' is opened THEN expected description should be displayed`,
        async () => {
            let roleWizard = new RoleWizard();
            let userBrowsePanel = new UserBrowsePanel();
            // 1. Type the name in the filter panel:
            await testUtils.findAndSelectItem(TEST_ROLE.displayName);
            // 2. Click on 'Edit' button:
            await userBrowsePanel.clickOnEditButton();
            await roleWizard.waitForLoaded();
            let actualDescription = await roleWizard.getDescription();
            assert.equal(actualDescription, TEST_ROLE.description, "Actual and expected descriptions should be equal");
        });

    it(`WHEN a system 'role' is opened THEN 'Delete' button should be disabled in the wizard toolbar`,
        async () => {
            let roleWizard = new RoleWizard();
            let userBrowsePanel = new UserBrowsePanel();
            // 1. Type 'system.auditlog' in the filter panel:
            await testUtils.findAndSelectItem('system.auditlog');
            // 2. Click on 'Edit' button:
            await userBrowsePanel.clickOnEditButton();
            await roleWizard.waitForLoaded();
            // 3. Verify that 'Delete' button is disabled:
            await roleWizard.waitForDeleteButtonDisabled();
        });

    it(`GIVEN existing 'Role' with a member WHEN the role has been selected THEN expected role-info should be present in the 'statistics panel'`,
        async () => {
            let roleStatisticsPanel = new RoleStatisticsPanel();
            // 1.Type the name and select the role in browse panel:
            await testUtils.findAndSelectItem(TEST_ROLE.displayName);
            await roleStatisticsPanel.waitForPanelLoaded();
            // 2. Verify the data in Statistics Panel
            let actualName = await roleStatisticsPanel.getItemName();
            assert.equal(actualName, TEST_ROLE.displayName, "Expected and actual names should be equal");
            let actualItemPath = await roleStatisticsPanel.getItemPath();
            assert.equal(actualItemPath, '/roles/' + TEST_ROLE.displayName, "Expected and actual path should be equal");
        });

    it(`GIVEN existing 'role' with a member is opened WHEN the only one member has been removed in wizard THEN Members should be cleared in the Statistics Panel`,
        async () => {
            let roleWizard = new RoleWizard();
            let roleStatisticsPanel = new RoleStatisticsPanel();
            // 1. Open the existing role and remove the member:
            await testUtils.selectRoleAndOpenWizard(TEST_ROLE.displayName);
            await roleWizard.removeMember(appConst.SUPER_USER_DISPLAY_NAME);
            // 2. role has been saved and the wizard closed
            await testUtils.saveAndCloseWizard(TEST_ROLE.displayName);
            // 3. Members should be cleared in Statistics Panel
            let members = await roleStatisticsPanel.getDisplayNameOfMembers();
            assert.ok(members.length === 0, 'Members should be cleared in the Statistics Panel');
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(async () => {
        if (typeof browser !== 'undefined') {
            await testUtils.getBrowser().setWindowSize(appConst.BROWSER_WIDTH, appConst.BROWSER_HEIGHT);
        }
        return console.log('specification starting: ' + this.title);
    });
});

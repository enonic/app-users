/**
 * Created on 12.09.2017.
 *
 */
const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const RoleWizard = require('../page_objects/wizardpanel/role.wizard');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const RoleStatisticsPanel = require('../page_objects/browsepanel/role.statistics.panel');

describe('Role Wizard and Statistics Panel spec', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();
    let TEST_ROLE;

    it('GIVEN `Roles` wizard is opened WHEN name and description has been typed AND `Save` button pressed THEN `Role was created` message should appear',
        async () => {
            let roleWizard = new RoleWizard();
            let userBrowsePanel = new UserBrowsePanel();
            TEST_ROLE = userItemsBuilder.buildRole(userItemsBuilder.generateRandomName('role'), 'test role', null);
            //1.Select Roles folder and save new role:
            await userBrowsePanel.clickOnRowByName('roles');
            await userBrowsePanel.clickOnNewButton();
            await roleWizard.waitForLoaded();
            await roleWizard.typeData(TEST_ROLE);
            await roleWizard.waitAndClickOnSave();

            let actualMessage = await roleWizard.waitForNotificationMessage();
            assert.equal(actualMessage, 'Role was created', "Expected and actual messages are equal");
        });

    //verifies: xp-apps#93 Incorrect message appears when try to create a role with name that already in use #93
    it(`GIVEN new 'role' wizard is opened WHEN the name that already in use has been typed THEN expected notification message should appear`,
        async () => {
            let roleWizard = new RoleWizard();
            //1. Select Roles and open new wizard:
            await testUtils.clickOnRolesFolderAndOpenWizard();
            //2. Type existing name:
            await roleWizard.typeDisplayName(TEST_ROLE.displayName);
            await roleWizard.waitAndClickOnSave();
            let errorMessage = await roleWizard.waitForErrorNotificationMessage();
            //3. Error message should appear:
            let expectedMsg = `Principal [` + TEST_ROLE.displayName + `] could not be created. A principal with that name already exists`;
            assert.strictEqual(errorMessage, expectedMsg, 'expected notification message should appear');
        });

    it(`GIVEN existing 'Role' WHEN 'Super User' has been added in members THEN expected selected option should appear in members form`,
        async () => {
            let roleWizard = new RoleWizard();
            let userBrowsePanel = new UserBrowsePanel();
            //1. Open the existing role:
            await testUtils.findAndSelectItem(TEST_ROLE.displayName);
            await userBrowsePanel.clickOnEditButton();
            await roleWizard.waitForLoaded();
            //2. Add SU in members:
            await roleWizard.filterOptionsAndAddMember(appConst.SUPER_USER_DISPLAY_NAME);
            //3.click on Save:
            await roleWizard.waitAndClickOnSave();
            //4. Get selected options in members:
            let selectedOptions = await roleWizard.getMembers();
            assert.equal(selectedOptions[0], appConst.SUPER_USER_DISPLAY_NAME, "SU should be in selected options");
        });

    it(`WHEN existing 'role' is opened THEN expected description should be present`,
        async () => {
            let roleWizard = new RoleWizard();
            let userBrowsePanel = new UserBrowsePanel();
            //1. Type the name in the filter panel:
            await testUtils.findAndSelectItem(TEST_ROLE.displayName);
            //2. Click on Edit button:
            await userBrowsePanel.clickOnEditButton();
            await roleWizard.waitForLoaded();
            let actualDescription = await roleWizard.getDescription();
            assert.equal(actualDescription, TEST_ROLE.description, "Actual and expected descriptions should be equal");
        });

    it(`GIVEN existing 'Role' with a member WHEN it has been selected THEN expected info should be present in the 'statistics panel'`,
        async () => {
            let roleStatisticsPanel = new RoleStatisticsPanel();
            //1.Type the name and select the role in browse panel:
            await testUtils.findAndSelectItem(TEST_ROLE.displayName);
            await roleStatisticsPanel.waitForPanelLoaded();

            let actualName = await roleStatisticsPanel.getItemName();
            assert.equal(actualName, TEST_ROLE.displayName, "Expected and actual names should be equal");
            let actualItemPath = await roleStatisticsPanel.getItemPath();
            assert.equal(actualItemPath, '/roles/' + TEST_ROLE.displayName, "Expected and actual path should be equal");
        });

    it(`GIVEN existing 'role' with a member is opened WHEN member has been removed THEN Members should be updated in the Statistics Panel`,
        async () => {
            let roleWizard = new RoleWizard();
            let roleStatisticsPanel = new RoleStatisticsPanel();
            //1. Open existing role and remove the member:
            await testUtils.selectRoleAndOpenWizard(TEST_ROLE.displayName);
            await roleWizard.removeMember(appConst.SUPER_USER_DISPLAY_NAME)
            //2. role has been saved and the wizard closed
            await testUtils.saveAndCloseWizard(TEST_ROLE.displayName);
            //3. Members should be updated in the Statistics Panel
            let members = await roleStatisticsPanel.getDisplayNameOfMembers();
            assert.isTrue(members.length === 0);
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});

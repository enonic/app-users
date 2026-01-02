/**
 * Created on 22.01.2018.
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const GroupWizard = require('../page_objects/wizardpanel/group.wizard');
const ConfirmationDialog = require('../page_objects/confirmation.dialog');
const NewPrincipalDialog = require('../page_objects/browsepanel/new.principal.dialog');
const appConst = require('../libs/app_const');

describe('group.create.with.role Create a Group with a just created new Role', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    let TEST_ROLE;

    it("WHEN 'Role' with a description has been saved THEN the role should be searchable",
        async () => {
            TEST_ROLE = userItemsBuilder.buildRole(appConst.generateRandomName('role'), 'description');
            let userBrowsePanel = new UserBrowsePanel();
            // 1. Create new Role
            await testUtils.openWizardAndSaveRole(TEST_ROLE);
            // 2. Type the name in the filter panel:
            await testUtils.typeNameInFilterPanel(TEST_ROLE.displayName);
            let isDisplayed = await userBrowsePanel.isItemDisplayed(TEST_ROLE.displayName);
            assert.ok(isDisplayed, "New role should be present in the grid");
        });

    //verifies: xp-apps#371 GroupWizard - SaveBeforeClose dialog appears in saved group
    it("GIVEN new group-wizard is opened AND name has been typed and new created role selected WHEN `Save` button then `Close tab` have been clicked THEN `Save before close` dialog should not appear",
        async () => {
            let testGroup = userItemsBuilder.buildGroup(appConst.generateRandomName('group'), 'description', null, [TEST_ROLE.displayName]);
            let groupWizard = new GroupWizard();
            let userBrowsePanel = new UserBrowsePanel();
            // 1. Open Group Wizard:
            await testUtils.clickOnSystemAndOpenGroupWizard();
            await groupWizard.typeData(testGroup);
            // 2. Save new group:
            await groupWizard.waitAndClickOnSave();
            // 3. Click on close-tab icon:
            await userBrowsePanel.doClickOnCloseTabButton(testGroup.displayName);
            let confirmationDialog = new ConfirmationDialog();
            // Confirmation dialog should not be displayed:
            let result = await confirmationDialog.isDialogLoaded();
            assert.ok(result === false, "Confirmation dialog should not be loaded");
        });

    it("GIVEN new group is saved AND System ID Provider is selected WHEN New button has been clicked THEN 'New principal' dialog should be loaded",
        async () => {
            let testGroup = userItemsBuilder.buildGroup(appConst.generateRandomName('group'), 'description');
            let newPrincipalDialog = new NewPrincipalDialog();
            let userBrowsePanel = new UserBrowsePanel();
            // 1. Select System ID Provider, open Group Wizard, type the data, save it and close the wizard:
            await testUtils.openWizardAndSaveGroup(testGroup);
            // 2. Click on New button(System ID Provider is selected in browse-panel):
            await userBrowsePanel.clickOnNewButton();
            await testUtils.saveScreenshot('new_principal_dialog_should_be_loaded');
            // 3. 'New Principal' dialog should be loaded:
            await newPrincipalDialog.waitForDialogLoaded()
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

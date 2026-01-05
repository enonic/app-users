/**
 * Created on 10.10.2017.
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const GroupWizard = require('../page_objects/wizardpanel/group.wizard');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const ConfirmationDialog = require('../page_objects/confirmation.dialog');

describe("group.wizard.spec - validation and check inputs", function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    let TEST_GROUP;

    it("WHEN 'Group' wizard is opened  THEN red circle should be present, because required input is empty",
        async () => {
            let groupWizard = new GroupWizard();
            await testUtils.clickOnSystemAndOpenGroupWizard();
            let isRedIconPresent = await groupWizard.waitUntilInvalidIconDisplayed('<Unnamed Group>');
            assert.ok(isRedIconPresent, "red circle should be present in the tab, because required input(name) is empty");
        });

    it("GIVEN 'Group' wizard is opened AND a name has been and saved WHEN 'Ctrl/Command+Delete' pressed THEN confirmation dialog should be loaded",
        async () => {
            let groupWizard = new GroupWizard();
            // 1. Open group-wizard:
            await testUtils.clickOnSystemAndOpenGroupWizard();
            // 2. Type a name:
            await groupWizard.typeDisplayName(appConst.generateRandomName('group'));
            // 3. Save the group:
            await groupWizard.waitAndClickOnSave();
            await groupWizard.waitForNotificationMessage();
            // 4. Press Ctrl/Command+Delete:
            await groupWizard.hotKeyDelete();
            // 5.`Confirmation dialog` should appear:
            let confirmationDialog = new ConfirmationDialog();
            await confirmationDialog.waitForDialogLoaded();
        });

    it("GIVEN 'Group' wizard is opened WHEN name has been typed THEN red circle gets not visible",
        async () => {
            let groupWizard = new GroupWizard();
            // 1. Open group-wizard:
            await testUtils.clickOnSystemAndOpenGroupWizard();
            // 2. Type a name:
            await groupWizard.typeDisplayName(appConst.generateRandomName('test-group'));
            await groupWizard.pause(400);
            // 3. red circle gets not visible:
            let isRedIconPresent = await groupWizard.waitUntilInvalidIconDisappears("test-group");
            assert.ok(isRedIconPresent, "red circle should not be visible in the tab, because required input is filled");
        });

    it("WHEN 'Group' wizard is opened THEN all required inputs should be present in the page",
        async () => {
            let groupWizard = new GroupWizard();
            // 1. Group wizard is opened:
            await testUtils.clickOnSystemAndOpenGroupWizard();
            let result = await groupWizard.isRoleOptionFilterInputDisplayed();
            assert.ok(result, "Role Options Filter input should be present");
            result = await groupWizard.isMemberOptionFilterInputDisplayed();
            assert.ok(result, "Member Options Filter input should be present");
        });

    it("GIVEN 'Group' wizard is opened WHEN name and description have been typed THEN red circle should not be present in the tab",
        async () => {
            TEST_GROUP =
                userItemsBuilder.buildGroup(appConst.generateRandomName('group'), 'test group', null, null);
            let groupWizard = new GroupWizard();
            // 1. Group wizard is opened:
            await testUtils.clickOnSystemAndOpenGroupWizard();
            // 2. Type a name and description:
            await groupWizard.typeData(TEST_GROUP);
            let isRedIconNotPresent = await groupWizard.waitUntilInvalidIconDisappears(TEST_GROUP.displayName);
            assert.ok(isRedIconNotPresent, "red circle gets not visible, because required input(name) is filled");
            // Save button gets enabled:
            await groupWizard.waitForSaveButtonEnabled();
        });

    it("GIVEN 'Group' wizard is opened WHEN name input has been cleared THEN red circle gets visible",
        async () => {
            TEST_GROUP =
                userItemsBuilder.buildGroup(appConst.generateRandomName('group'), "test group", null, null);
            let groupWizard = new GroupWizard();
            // 1. Open new wizard and type all data:
            await testUtils.clickOnSystemAndOpenGroupWizard();
            await groupWizard.typeData(TEST_GROUP);
            // 2. Clear the displayName input:
            await groupWizard.clearDisplayNameInput();
            let isRedIconPresent = await groupWizard.waitUntilInvalidIconDisplayed("<Unnamed Group>");
            assert.ok(isRedIconPresent, "red circle gets visible, because the name input has been cleared");
            // 3. Save button gets disabled:
            await groupWizard.waitForSaveButtonDisabled();
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

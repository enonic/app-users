/**
 * Created on 10.10.2017.
 */
const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const GroupWizard = require('../page_objects/wizardpanel/group.wizard');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');

describe("group.wizard.spec - validation and check inputs", function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === "undefined") {
        webDriverHelper.setupBrowser();
    }
    let testGroup;
    it("WHEN 'Group' wizard is opened  THEN red circle should be present, because required input is empty",
        async () => {
            let groupWizard = new GroupWizard();
            await testUtils.clickOnSystemAndOpenGroupWizard();
            let isRedIconPresent = await groupWizard.waitUntilInvalidIconAppears('<Unnamed Group>');
            assert.isTrue(isRedIconPresent, "red circle should be present in the tab, because required input(name) is empty");
        });

    it("GIVEN 'Group' wizard is opened WHEN name has been typed THEN red circle gets not visible",
        async () => {
            let groupWizard = new GroupWizard();
            //1. Open group-wizard:
            await testUtils.clickOnSystemAndOpenGroupWizard();
            //2. Type a name:
            await groupWizard.typeDisplayName("test-group999");
            await groupWizard.pause(400);
            //3. red circle gets not visible:
            let isRedIconPresent = await groupWizard.waitUntilInvalidIconDisappears("test-group");
            assert.isTrue(isRedIconPresent, "red circle should not be visible in the tab, because required input is filled");
        });

    it("WHEN 'Group' wizard is opened THEN all required inputs should be present in the page",
        async () => {
            let groupWizard = new GroupWizard();
            //1. Group wizard is opened:
            await testUtils.clickOnSystemAndOpenGroupWizard();
            let result = await groupWizard.isRoleOptionFilterInputDisplayed();
            assert.isTrue(result, "Role Options Filter input should be present");
            result = await groupWizard.isMemberOptionFilterInputDisplayed();
            assert.isTrue(result, "Member Options Filter input should be present");
        });

    it("GIVEN 'Group' wizard is opened WHEN name and description have been typed THEN red circle should not be present in the tab",
        async () => {
            testGroup =
                userItemsBuilder.buildGroup(userItemsBuilder.generateRandomName('group'), 'test group', null, null);
            let groupWizard = new GroupWizard();
            //1. Group wizard is opened:
            await testUtils.clickOnSystemAndOpenGroupWizard();
            //2. Type a name and description:
            await groupWizard.typeData(testGroup);
            let isRedIconNotPresent = await groupWizard.waitUntilInvalidIconDisappears(testGroup.displayName);
            assert.isTrue(isRedIconNotPresent, "red circle gets not visible, because required input(name) is filled");
            //Save button gets enabled:
            await groupWizard.waitForSaveButtonEnabled();
        });

    it("GIVEN 'Group' wizard is opened WHEN name input has been cleared THEN red circle gets visible",
        async () => {
            testGroup =
                userItemsBuilder.buildGroup(userItemsBuilder.generateRandomName('group'), "test group", null, null);
            let groupWizard = new GroupWizard();
            //1. Open new wizard and type all data:
            await testUtils.clickOnSystemAndOpenGroupWizard();
            await groupWizard.typeData(testGroup);
            //2. Clear the displayName input:
            await groupWizard.clearDisplayNameInput();
            let isRedIconPresent = await groupWizard.waitUntilInvalidIconAppears("<Unnamed Group>");
            assert.isTrue(isRedIconPresent, "red circle gets visible, because the name input has been cleared");
            //3. Save button gets disabled:
            await groupWizard.waitForSaveButtonDisabled();
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(async () => {
        await testUtils.getBrowser().maximizeWindow();
        return console.log('specification starting: ' + this.title);
    });
});

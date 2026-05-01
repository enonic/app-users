/**
 * Regression test for #2524 - Description field is not required in principal wizards.
 * The Description form item is rendered by PrincipalDescriptionWizardStepForm and is shared
 * across Group and Role wizards. Validators.required would add the 'required' class to the
 * label, so this spec asserts that no such marker is present and that the wizard can be saved
 * with a blank description.
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const GroupWizard = require('../page_objects/wizardpanel/group.wizard');
const RoleWizard = require('../page_objects/wizardpanel/role.wizard');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');

describe('Description field on principal wizards is not required', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    it("GIVEN 'Group' wizard is opened THEN Description label should not be marked as required",
        async () => {
            let groupWizard = new GroupWizard();
            // 1. Open new Group wizard:
            await testUtils.clickOnSystemAndOpenGroupWizard();
            // 2. Description label must not carry the 'required' class:
            let isRequired = await groupWizard.isDescriptionLabelMarkedAsRequired();
            assert.ok(!isRequired, "Description label in Group wizard should not be marked as required");
        });

    it("GIVEN 'Role' wizard is opened THEN Description label should not be marked as required",
        async () => {
            let roleWizard = new RoleWizard();
            // 1. Open new Role wizard:
            await testUtils.clickOnRolesFolderAndOpenWizard();
            // 2. Description label must not carry the 'required' class:
            let isRequired = await roleWizard.isDescriptionLabelMarkedAsRequired();
            assert.ok(!isRequired, "Description label in Role wizard should not be marked as required");
        });

    it("GIVEN 'Group' wizard is opened WHEN only the name has been typed THEN Save button gets enabled with a blank Description",
        async () => {
            let groupWizard = new GroupWizard();
            // 1. Open new Group wizard:
            await testUtils.clickOnSystemAndOpenGroupWizard();
            // 2. Type the display name only, leave description blank:
            await groupWizard.typeDisplayName(userItemsBuilder.generateRandomName('group'));
            // 3. Save button must be enabled with a blank description (description is not required):
            await groupWizard.waitForSaveButtonEnabled();
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

/**
 * Created on 15.03.2019.
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const RoleWizard = require('../page_objects/wizardpanel/role.wizard');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const FilterPanel = require('../page_objects/browsepanel/principal.filter.panel');

describe('Role - save a role and check the number in aggregations', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    //verifies https://github.com/enonic/app-users/issues/214
    //Filter panel is not updated when the grid is filtered by role  and a new role is added
    it(`GIVEN Filter Panel Is opened AND 'Roles' checkbox is checked WHEN new role has been created THEN number of roles on the Filter panel should be increased`,
        async () => {
            let roleName = userItemsBuilder.generateRandomName('role');
            let initialNumber;
            let filterPanel = new FilterPanel();
            let roleWizard = new RoleWizard();
            let userBrowsePanel = new UserBrowsePanel();
            await testUtils.openFilterPanel();
            // 1. Click on Role-checkbox:
            await filterPanel.clickOnRoleAggregation();
            // 2. Get the initial number of roles:
            initialNumber = await filterPanel.getNumberInRoleAggregationCheckbox();
            // 3. Open new wizard and save new role:
            await testUtils.clickOnRolesFolderAndOpenWizard();
            await roleWizard.typeDisplayName(roleName);
            await roleWizard.waitAndClickOnSave();
            await roleWizard.waitForNotificationMessage();
            // 4. Go to browse panel:
            await userBrowsePanel.clickOnAppHomeButton();
            await filterPanel.waitForOpened();
            let result = await filterPanel.getNumberInRoleAggregationCheckbox();
            assert.ok(result - initialNumber === 1, "Number of roles in Filter panel should be increased ");
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(async () => {
        await testUtils.getBrowser().maximizeWindow();
        return console.log('specification starting: ' + this.title);
    });
});

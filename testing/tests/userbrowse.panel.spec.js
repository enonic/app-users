const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');

describe('User Browse Panel specification', function () {
    this.timeout(0);
    webDriverHelper.setupBrowser();

    it("WHEN Browse panel is opened THEN 'roles' and '/system' folders should be present",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let result = await userBrowsePanel.isItemDisplayed('roles');
            assert.isTrue(result, 'roles folder should be present in the root directory');
            result = await userBrowsePanel.isItemDisplayed('/system');
            assert.isTrue(result, '`/system` folder should be present in the root directory');
            result = await userBrowsePanel.isSelectionTogglerVisible();
            assert.isFalse(result, "'Selection toggler' should not be displayed");
        });

    it("GIVEN Browse panel is opened WHEN 'Roles' folder has been expanded THEN required system roles should be listed",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            await userBrowsePanel.clickOnExpanderIcon('roles');
            let isDisplayed = await userBrowsePanel.isItemDisplayed('system.user.admin');
            assert.isTrue(isDisplayed, "`User Administrator` role should be displayed");
            isDisplayed = await userBrowsePanel.isItemDisplayed('system.admin');
            assert.isTrue(isDisplayed, "'Administrator' role should be displayed");
            isDisplayed = await userBrowsePanel.isItemDisplayed('cms.admin');
            assert.isTrue(isDisplayed, "'Content Manager Administrator' role should be displayed");

            isDisplayed = await userBrowsePanel.isItemDisplayed('system.admin.login');
            assert.isTrue(isDisplayed, "'Administration Console Login' role should be displayed");
            isDisplayed = await userBrowsePanel.isItemDisplayed('system.everyone');
            assert.isTrue(isDisplayed, "'Everyone' role should be displayed");
            isDisplayed = await userBrowsePanel.isItemDisplayed('cms.expert');
            assert.isTrue(isDisplayed, "'Content Manager Expert' role should be displayed");
            isDisplayed = await userBrowsePanel.isItemDisplayed('system.authenticated');
            assert.isTrue(isDisplayed, "'Authenticated' role should be displayed");
        });

    it("GIVEN Browse panel is opened WHEN '/system' folder has been expanded THEN 'Groups' and 'Users' get visible",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            await userBrowsePanel.clickOnExpanderIcon('/system');
            let isDisplayed = await userBrowsePanel.isItemDisplayed('groups');
            assert.isTrue(isDisplayed, "'Groups' folder should be present beneath the 'system'");
            isDisplayed = await userBrowsePanel.isItemDisplayed('users');
            assert.isTrue(isDisplayed, "'Users' folder should be present beneath the 'system'");
        });

    it("WHEN checkbox 'Roles' has been checked THEN SelectionPanelToggler gets visible",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            //1. Click on the checkbox:
            await userBrowsePanel.clickCheckboxAndSelectRowByDisplayName('Roles');
            await userBrowsePanel.waitForSelectionTogglerVisible();
            let result = await userBrowsePanel.getNumberInSelectionToggler();
            testUtils.saveScreenshot('number_in_selection');
            assert.equal(result, 1, '1 should be displayed in the selection-toggler button');
        });

    it('GIVEN checkbox `Roles` is checked WHEN SelectionPanelToggler has been clicked THEN grid gets filtered - one item should be in the grid',
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            //1. Click on the checkbox:
            await userBrowsePanel.clickCheckboxAndSelectRowByDisplayName('Roles');
            await userBrowsePanel.waitForSelectionTogglerVisible();
            //2. Click on Show Selection:
            await userBrowsePanel.clickOnSelectionToggler();
            //3. The grid should be filtered:
            let names = await userBrowsePanel.getGridItemDisplayNames();
            testUtils.saveScreenshot('selection_toggler_clicked');
            assert.equal(names.length, 1, 'one folder should be listed in the grid');
            assert.equal(names[0], 'Roles', 'The name of the folder should be Roles');
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});

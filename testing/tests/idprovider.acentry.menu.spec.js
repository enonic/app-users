/**
 * Created on 13/02/2018
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const userItemsBuilder = require('../libs/userItems.builder.js');
const IdProviderWizard = require('../page_objects/wizardpanel/idprovider.wizard');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');

describe('Id Provider wizard, Access Control Entry - expand and collapse menu-operations', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    it(`GIVEN Access Control Entry is added WHEN 'Entry-operations' has been clicked THEN menu with operations gets visible`,
        async () => {
            let permissions = ['Everyone', 'Users App'];
            let idProviderWizard = new IdProviderWizard();
            let name = userItemsBuilder.generateRandomName('provider');
            let testProvider = userItemsBuilder.buildIdProvider(name, 'test Id provider', null, permissions);
            // 1. Open new wizard:
            await testUtils.openIdProviderWizard(testProvider);
            await idProviderWizard.typeData(testProvider);
            // 2. Click on 'Everyone' acl-entry and expand the menu:
            await idProviderWizard.clickOnSelectedACEAndShowMenuOperations('Everyone');
            await testUtils.saveScreenshot('store_ace_menu_expanded');
            // 3. Verify that ECE-menu is expanded:
            let isExpanded = await idProviderWizard.isAceMenuOptionsExpanded('Everyone');
            assert.ok(isExpanded, 'menu with operations gets visible');
            // 4. Verify all operations in the expanded menu:
            let actualOperations = await idProviderWizard.getAceMenuOperations();
            assert.equal(actualOperations[0], 'Read');
            assert.equal(actualOperations[1], 'Create Users');
            assert.equal(actualOperations[2], 'Write Users');
            assert.equal(actualOperations[3], 'Id Provider Manager');
            assert.equal(actualOperations[4], 'Administrator');
            assert.equal(actualOperations.length, 5, "Five operations should be in the expanded menu");
        });

    it(`GIVEN 'System Id Provider' is opened AND menu for Everyone-ACE is expanded WHEN click outside the menu THEN the menu gets collapsed`,
        async () => {
            let idProviderWizard = new IdProviderWizard();
            // 1. Open system ID provider:
            await testUtils.selectSystemIdProviderAndOpenWizard();
            await idProviderWizard.clickOnPermissionsTabItem();
            // 2. Add new ACE:
            await idProviderWizard.addPrincipals(['Everyone']);
            // 3. Click on 'Everyone' ACE and open the menu:
            await idProviderWizard.clickOnSelectedACEAndShowMenuOperations('Everyone');
            let isExpanded = await idProviderWizard.isAceMenuOptionsExpanded('Everyone');
            assert.ok(isExpanded, 'the menu should be expanded');
            // 4. Click outside the expanded menu:
            await idProviderWizard.clickOnPermissionsTabItem();
            isExpanded = await idProviderWizard.isAceMenuOptionsExpanded('Everyone');
            assert.ok(isExpanded === false, 'the menu should be collapsed, after clicking outside the expanded menu');
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

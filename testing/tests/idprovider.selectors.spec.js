/**
 * Created on 06.11.2017.
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const IdProviderWizard = require('../page_objects/wizardpanel/idprovider.wizard');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');

describe('Id Provider Permissions spec', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    // verifies the lib-admin-ui#147  Contents of a dropdown will not reset to original list after being filtered #147
    // https://github.com/enonic/lib-admin-ui/issues/147
    // https://github.com/enonic/app-contentstudio/issues/7919
    // Duplicated items in ListBox #7919
    it(`GIVEN 'Id Provider' wizard is opened AND Acl-entry has been added WHEN filter input has been cleared AND drop-down handle clicked THEN number of options should be more than 10`,
        async () => {
            let idProviderWizard = new IdProviderWizard();
            // 1. Open new ID Provider wizard:
            await testUtils.openIdProviderWizard();
            // 2. Add new Acl-entry:
            await idProviderWizard.filterOptionsAndSelectPermission('Everyone');
            // 3. Clear the Permissions options filter input:
            await idProviderWizard.clearPrincipalOptionsFilterInput();
            await testUtils.saveScreenshot('id_privider_options');
            // 4. The dropdown should be expanded after clearing  the options filter input
            let options = await idProviderWizard.getPrincipalOptionDisplayNames();
            console.log("ID PROVIDER PERMISSIONS OPTIONS  #####################:   " + options);
            assert.ok(options.length > 9, 'More than 9 options should be in the list');
            let countItem = duplicates(options, 'Administrator');
            //assert.ok(countItem === 1, 'Options should not be duplicated in the ListBox');
        });

    it(`GIVEN wizard for new 'Id Provider' is opened WHEN provider's drop-down handle has been clicked THEN 'Standard ID provider' item should be present in the list`,
        async () => {
            let idProviderWizard = new IdProviderWizard();
            // 1. Open new ID Provider wizard:
            await testUtils.openIdProviderWizard();
            // 2. Provider dropdown has been expanded
            await idProviderWizard.clickOnProviderComboBoxDropDownHandle();
            let displayNames = await idProviderWizard.getProviderOptionDisplayNames();
            assert.ok(displayNames.includes(appConst.STANDARD_ID_PROVIDER),
                'Standard ID provider item should be present in the options list');
        });

    function duplicates(arr, value) {
        let cnt = 0;
        for (let i = arr.length - 1; i > 0; i--) {
            if (arr[i] === value) {
                cnt++;
            }
        }
        return cnt;
    }

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(async () => {
        if (typeof browser !== 'undefined') {
            await testUtils.getBrowser().setWindowSize(appConst.BROWSER_WIDTH, appConst.BROWSER_HEIGHT);
        }
        return console.log('specification starting: ' + this.title);
    });
});

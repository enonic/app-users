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

    if (typeof browser === "undefined") {
        webDriverHelper.setupBrowser();
    }

    //verifies the lib-admin-ui#147
    it(`GIVEN 'Id Provider' wizard is opened AND Acl-entry has been added WHEN filter input has been cleared AND drop-down handle clicked THEN number of options should be more than 1`,
        async () => {
            let idProviderWizard = new IdProviderWizard();
            // 1. Open new ID Provider wizard:
            await testUtils.openIdProviderWizard();
            // 2. Add new Acl-entry:
            await idProviderWizard.filterOptionsAndSelectPermission('Everyone');
            // 3. Clear the options filter input:
            await idProviderWizard.clearPrincipalOptionsFilterInput();
            // 4.Expand the combobox:
            await idProviderWizard.clickOnPrincipalComboBoxDropDownHandle();
            let result = await idProviderWizard.getPrincipalOptionDisplayNames();
            assert.ok(result.length > 1, 'number of options should be more than 1');
        });

    it(`GIVEN wizard for new 'Id Provider' is opened WHEN provider's drop-down handle has been clicked THEN 'Standard ID provider' item should be present in the list`,
        async () => {
            let idProviderWizard = new IdProviderWizard();
            await testUtils.openIdProviderWizard();
            await idProviderWizard.clickOnProviderComboBoxDropDownHandle();
            let displayNames = await idProviderWizard.getProviderOptionDisplayNames();
            assert.ok(displayNames.includes(appConst.STANDARD_ID_PROVIDER),
                'Standard ID provider item should be present in the options list');
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(async () => {
        await testUtils.getBrowser().maximizeWindow();
        return console.log('specification starting: ' + this.title);
    });
});
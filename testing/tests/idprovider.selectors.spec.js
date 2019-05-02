/**
 * Created on 06.11.2017.
 * verifies the lib-admin-ui#147
 * https://github.com/enonic/lib-admin-ui/issues/147
 */
const chai = require('chai');
const should = require('chai').should;
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const userItemsBuilder = require('../libs/userItems.builder.js');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const IdProviderWizard = require('../page_objects/wizardpanel/idprovider.wizard');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');


describe('Id Provider Permissions spec', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();

    //verifies the lib-admin-ui#147
    it(`GIVEN 'Id Provider' wizard is opened AND Acl-entry has been added WHEN filter input has been cleared AND drop-down handle clicked THEN number of options should be more than 1`,
        () => {
        let idProviderWizard  =new IdProviderWizard();
            return testUtils.openIdProviderWizard().then(() => {
                return idProviderWizard.filterOptionsAndSelectPermission('Everyone');
            }).then(() => {
                return idProviderWizard.clearPrincipalOptionsFilterInput();
            }).then(() => {
                return idProviderWizard.clickOnPrincipalComboBoxDropDownHandle();
            }).then(() => {
                return idProviderWizard.getPrincipalOptionDisplayNames()
            }).then(displayNames => {
                assert.isTrue(displayNames.length > 1, 'number of options should be more than 1');
            })
        });

    it(`GIVEN wizard for new 'Id Provider' is opened WHEN provider's drop-down handle has been clicked THEN 'Standard ID provider' item should be present in the list`,
        () => {
            let idProviderWizard  =new IdProviderWizard();
            return testUtils.openIdProviderWizard().then(() => {
                return idProviderWizard.clickOnProviderComboBoxDropDownHandle();
            }).then(() => {
                return idProviderWizard.getProviderOptionDisplayNames();
            }).then(displayNames => {
                assert.equal(displayNames[0], appConst.STANDARD_ID_PROVIDER, '`Standard ID provider` item should be present in the list');
            })
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});

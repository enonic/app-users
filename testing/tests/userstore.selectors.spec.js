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
const userBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const userStoreWizard = require('../page_objects/wizardpanel/userstore.wizard');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');


describe('User Store Permissions spec', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();

    //verifies the lib-admin-ui#147
    it(`GIVEN 'User Store' wizard is opened AND Acl-entry has been added WHEN filter input has been cleared AND drop-down handle clicked THEN number of options should be more than 1`,
        () => {
            return testUtils.clickOnNewOpenUserStoreWizard().then(() => {
                return userStoreWizard.filterOptionsAndSelectPermission('Everyone');
            }).then(() => {
                return userStoreWizard.clearPrincipalOptionsFilterInput();
            }).then(() => {
                return userStoreWizard.clickOnPrincipalComboBoxDropDownHandle();
            }).then(() => {
                return userStoreWizard.getPrincipalOptionDisplayNames()
            }).then(displayNames => {
                assert.isTrue(displayNames.length > 1, 'number of options should be more than 1');
            })
        });

    it(`GIVEN 'User Store' wizard is opened WHEN provider's drop-down handle has been clicked THEN 'Standard ID provider' item should be present in the list`,
        () => {
            return testUtils.clickOnNewOpenUserStoreWizard().then(() => {
                return userStoreWizard.clickOnProviderComboBoxDropDownHandle();
            }).then(() => {
                return userStoreWizard.getProviderOptionDisplayNames();
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

/**
 * Created on 13/02/2018
 * verifies the xp-apps#320 (Id provider wizard - Context menu)

 */
const chai = require('chai');
const should = require('chai').should;
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const userItemsBuilder = require('../libs/userItems.builder.js');
const idProviderWizard = require('../page_objects/wizardpanel/idprovider.wizard');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');

describe('Id Provider, Access Control Entry - expand and collapse menu-operations', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();
    it(`GIVEN Access Control Entry is added WHEN 'Entry-operations' has been clicked THEN menu with operations should be expanded`,
        () => {
            let permissions = ['Everyone', 'Users App'];
            let testStore =
                userItemsBuilder.buildIdProvider(userItemsBuilder.generateRandomName('store'), 'test Id provider', null, permissions);
    return testUtils.clickOnNewOpenIdProviderWizard(testStore).then(() = > {
        return idProviderWizard.typeData(testStore);
            }).then(() => {
        return idProviderWizard.clickOnSelectedACEAndShowMenuOperations('Everyone');
            }).then(() => {
                testUtils.saveScreenshot('store_ace_menu_expanded');
    return idProviderWizard.isAceMenuOptionsExpanded('Everyone');
            }).then(result => {
                assert.isTrue(result, 'menu with operations should be expanded');
            })
        });
    //verifies the https://github.com/enonic/xp-apps/issues/320
    it(`GIVEN 'System Store' is opened AND 'Entry-operations' is expanded WHEN click outside the menu THEN the menu should be collapsed`,
        () => {
        return testUtils.selectSystemIdProviderAndOpenWizard().then(() = > {
            return idProviderWizard.clickOnPermissionsTabItem();
            }).pause(500).then(() => {
        return idProviderWizard.addPrincipals(['Everyone']);
            }).then(() => {
        return idProviderWizard.clickOnSelectedACEAndShowMenuOperations('Everyone');
            }).then(() => {
        return idProviderWizard.isAceMenuOptionsExpanded('Everyone');
            }).then(result => {
                assert.isTrue(result, 'the menu should be expanded');
            }).then(() => {
        return idProviderWizard.clickOnPermissionsTabItem();
            }).then(() => {
        return idProviderWizard.isAceMenuOptionsExpanded('Everyone');
            }).then(result => {
                assert.isFalse(result, 'the menu should be collapsed, because was clicked outside the expanded menu');
            })
        });
    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});
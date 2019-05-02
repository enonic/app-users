/**
 * Created on 13/02/2018
 */
const chai = require('chai');
const should = require('chai').should;
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const userItemsBuilder = require('../libs/userItems.builder.js');
const IdProviderWizard = require('../page_objects/wizardpanel/idprovider.wizard');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');

describe('Id Provider wizard, Access Control Entry - expand and collapse menu-operations', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();

    it(`GIVEN Access Control Entry is added WHEN 'Entry-operations' has been clicked THEN menu with operations should be expanded`,
        () => {
            let permissions = ['Everyone', 'Users App'];
            let idProviderWizard = new IdProviderWizard();
            let name = userItemsBuilder.generateRandomName('provider');
            let testProvider = userItemsBuilder.buildIdProvider(name, 'test Id provider', null, permissions);
            return testUtils.openIdProviderWizard(testProvider).then(() => {
                return idProviderWizard.typeData(testProvider);
            }).then(() => {
                return idProviderWizard.clickOnSelectedACEAndShowMenuOperations('Everyone');
            }).then(() => {
                testUtils.saveScreenshot('store_ace_menu_expanded');
                return idProviderWizard.isAceMenuOptionsExpanded('Everyone');
            }).then(result => {
                assert.isTrue(result, 'menu with operations should be expanded');
            })
        });

    it(`GIVEN 'System Id Provider' is opened AND 'Entry-operations' is expanded WHEN click outside the menu THEN the menu should be collapsed`,
        () => {
            let idProviderWizard = new IdProviderWizard();
            return testUtils.selectSystemIdProviderAndOpenWizard().then(() => {
                return idProviderWizard.clickOnPermissionsTabItem();
            }).then(() => {
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
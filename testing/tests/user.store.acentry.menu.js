/**
 * Created on 13/02/2018
 * verifies the xp-apps#320 (User store wizard - Context menu)

 */
const chai = require('chai');
const should = require('chai').should;
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const userItemsBuilder = require('../libs/userItems.builder.js');
const userStoreWizard = require('../page_objects/wizardpanel/userstore.wizard');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');

describe('User Store, Access Control Entry - expand and collapse menu-operations', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();
    it(`GIVEN Access Control Entry is added WHEN 'Entry-operations' has been clicked THEN menu with operations should be expanded`,
        () => {
            let permissions = ['Everyone', 'Users App'];
            let testStore =
                userItemsBuilder.buildUserStore(userItemsBuilder.generateRandomName('store'), 'test user store', null, permissions);
            return testUtils.clickOnNewOpenUserStoreWizard(testStore).then(() => {
                return userStoreWizard.typeData(testStore);
            }).then(() => {
                return userStoreWizard.clickOnSelectedACEAndShowMenuOperations('Everyone');
            }).then(() => {
                testUtils.saveScreenshot('store_ace_menu_expanded');
                return userStoreWizard.isAceMenuOptionsExpanded('Everyone');
            }).then(result => {
                assert.isTrue(result, 'menu with operations should be expanded');
            })
        });
    //verifies the https://github.com/enonic/xp-apps/issues/320
    it(`GIVEN 'System Store' is opened AND 'Entry-operations' is expanded WHEN click outside the menu THEN the menu should be collapsed`,
        () => {
            return testUtils.selectSystemUserStoreAndOpenWizard().then(() => {
                return userStoreWizard.clickOnPermissionsTabItem();
            }).pause(500).then(() => {
                return userStoreWizard.addPrincipals(['Everyone']);
            }).then(() => {
                return userStoreWizard.clickOnSelectedACEAndShowMenuOperations('Everyone');
            }).then(() => {
                return userStoreWizard.isAceMenuOptionsExpanded('Everyone');
            }).then(result => {
                assert.isTrue(result, 'the menu should be expanded');
            }).then(() => {
                return userStoreWizard.clickOnPermissionsTabItem();
            }).then(() => {
                return userStoreWizard.isAceMenuOptionsExpanded('Everyone');
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
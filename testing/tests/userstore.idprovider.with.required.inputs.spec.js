/**
 * Created on 20/03/2018.
 * verifies the https://github.com/enonic/xp-apps/issues/582
 * User Store Wizard - Impossible to close the wizard when ID Provider is selected
 *
 */
const chai = require('chai');
var should = require('chai').should;
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
var webDriverHelper = require('../libs/WebDriverHelper');
const userItemsBuilder = require('../libs/userItems.builder.js');
const userBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const userStoreWizard = require('../page_objects/wizardpanel/userstore.wizard');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');
const saveBeforeCloseDialog = require('../page_objects/save.before.close.dialog');
const providerDialog = require('../page_objects/wizardpanel/provider.configurator.dialog');

describe('User Store, provider-dialog specification', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();


    it(`GIVEN User Store wizard is opened AND idProvider has been selected WHEN Provider has required inputs THEN 'Save' button should be disabled AND 'Save Before' dialog should appear when 'Close' has been clicked`,
        () => {
            let testStore =
                userItemsBuilder.buildUserStore(userItemsBuilder.generateRandomName('store'), 'test user store', 'First Selenium App',
                    null);
            return testUtils.clickOnNewOpenUserStoreWizard(testStore).then(()=> {
                return userStoreWizard.typeData(testStore);
            }).then(()=> {
                return userStoreWizard.waitForSaveButtonDisabled();
            }).then(()=> {
                return userBrowsePanel.doClickOnCloseTabButton(testStore.displayName);
            }).pause(300).then(()=> {
                testUtils.saveScreenshot('id_provider_save_before_close_present1');
                return assert.eventually.isTrue(saveBeforeCloseDialog.isDialogPresent(),
                    "`Save before close` dialog should appear");
            })
        });

    it(`GIVEN idProvider dialog is opened WHEN required inputs in Provider-dialog are filled THEN the User Store is getting valid`,
        () => {
            let testStore =
                userItemsBuilder.buildUserStore(userItemsBuilder.generateRandomName('store'), 'test user store', 'First Selenium App',
                    null);
            return testUtils.clickOnNewOpenUserStoreWizard(testStore).then(()=> {
                return userStoreWizard.typeData(testStore);
            }).pause(1000).then(()=> {
                return providerDialog.doFillRequiredInputs('domain', 'id', 'secret');
            }).then(()=> {
                return userStoreWizard.isItemInvalid(testStore.displayName);
            }).then((result)=> {
                testUtils.saveScreenshot('user_store_is_getting_valid');
                assert.isFalse(result, 'Red icon should not be present at the wizard');
            })
        });

    //verifies the https://github.com/enonic/xp-apps/issues/582
    it(`GIVEN User Store wizard is opened AND required inputs in provider's dialog are filled WHEN Save and Close buttons have been pressed THEN 'Save Before' dialog should not appear`,
        () => {
            let testStore =
                userItemsBuilder.buildUserStore(userItemsBuilder.generateRandomName('store'), 'test user store', 'First Selenium App',
                    null);
            return testUtils.clickOnNewOpenUserStoreWizard(testStore).then(()=> {
                return userStoreWizard.typeData(testStore);
            }).pause(1000).then(()=> {
                return providerDialog.doFillRequiredInputs('domain', 'id', 'secret');
            }).then(()=> {
                return userStoreWizard.waitAndClickOnSave();
            }).pause(1000).then(()=> {
                return userBrowsePanel.doClickOnCloseTabButton(testStore.displayName);
            }).pause(500).then(()=> {
                return assert.eventually.isFalse(saveBeforeCloseDialog.isDialogPresent(),
                    "`Save before close` dialog should not appear");
            })
        });
    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(()=> {
        return console.log('specification starting: ' + this.title);
    });
});



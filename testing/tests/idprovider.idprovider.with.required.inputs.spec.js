/**
 * Created on 20/03/2018.
 * verifies the https://github.com/enonic/xp-apps/issues/582
 * Id Provider Wizard - Impossible to close the wizard when ID Provider is selected
 *
 */
const chai = require('chai');
const should = require('chai').should;
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const userItemsBuilder = require('../libs/userItems.builder.js');
const userBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const idProviderWizard = require('../page_objects/wizardpanel/idprovider.wizard');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');
const saveBeforeCloseDialog = require('../page_objects/save.before.close.dialog');
const providerDialog = require('../page_objects/wizardpanel/provider.configurator.dialog');

describe('Id Provider, provider-dialog specification', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();


    it(`GIVEN Id Provider wizard is opened AND application has been selected WHEN Provider has required inputs THEN 'Save' button should be disabled AND 'Save Before' dialog should appear when 'Close' has been clicked`,
        () = > {
            let testStore =
                userItemsBuilder.buildIdProvider(userItemsBuilder.generateRandomName('store'), 'test Id provider', 'First Selenium App',
                    null);
    return testUtils.clickOnNewOpenIdProviderWizard(testStore).then(() = > {
        return idProviderWizard.typeData(testStore);
            }).then(() => {
        return idProviderWizard.waitForSaveButtonDisabled();
            }).then(() => {
                return userBrowsePanel.doClickOnCloseTabButton(testStore.displayName);
            }).pause(300).then(() => {
        testUtils.saveScreenshot('application_save_before_close_present1');
                return assert.eventually.isTrue(saveBeforeCloseDialog.isDialogPresent(),
                    "`Save before close` dialog should appear");
            })
        });

    it(`GIVEN application dialog is opened WHEN required inputs in Provider-dialog are filled THEN the Id Provider is getting valid`,
        () = > {
            let testStore =
                userItemsBuilder.buildIdProvider(userItemsBuilder.generateRandomName('store'), 'test Id provider', 'First Selenium App',
                    null);
    return testUtils.clickOnNewOpenIdProviderWizard(testStore).then(() = > {
        return idProviderWizard.typeData(testStore);
            }).pause(1000).then(() => {
                return providerDialog.doFillRequiredInputs('domain', 'id', 'secret');
            }).then(() => {
        return idProviderWizard.isItemInvalid(testStore.displayName);
            }).then(result => {
        testUtils.saveScreenshot('id_provider_is_getting_valid');
                assert.isFalse(result, 'Red icon should not be present at the wizard');
            })
        });

    //verifies the https://github.com/enonic/xp-apps/issues/582
    it(`GIVEN Id Provider wizard is opened AND required inputs in provider's dialog are filled WHEN Save and Close buttons have been pressed THEN 'Save Before' dialog should not appear`,
        () = > {
            let testStore =
                userItemsBuilder.buildIdProvider(userItemsBuilder.generateRandomName('store'), 'test Id provider', 'First Selenium App',
                    null);
    return testUtils.clickOnNewOpenIdProviderWizard(testStore).then(() = > {
        return idProviderWizard.typeData(testStore);
            }).pause(1000).then(() => {
                return providerDialog.doFillRequiredInputs('domain', 'id', 'secret');
            }).then(() => {
        return idProviderWizard.waitAndClickOnSave();
            }).pause(1000).then(() => {
                return userBrowsePanel.doClickOnCloseTabButton(testStore.displayName);
            }).pause(500).then(() => {
        testUtils.saveScreenshot("idprovider_wizard_modal_dialog_should_be_closed");
                return assert.eventually.isFalse(saveBeforeCloseDialog.isDialogPresent(),
                    "`Save before close` dialog should not appear");
            })
        });
    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});



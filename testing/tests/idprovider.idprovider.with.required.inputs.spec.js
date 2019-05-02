/**
 * Created on 20/03/2018.
 *
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
const SaveBeforeCloseDialog = require('../page_objects/save.before.close.dialog');
const ProviderConfigDialog = require('../page_objects/wizardpanel/provider.configurator.dialog');

describe('Id Provider, provider-dialog specification', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();

    it(`GIVEN wizard for new Id Provider is opened AND application has been selected WHEN Provider-configuration has required inputs THEN 'Save' button should be disabled AND 'Save Before' dialog should appear when 'Close' has been clicked`,
        () => {
            let name = userItemsBuilder.generateRandomName('provider');
            let testIdProvider = userItemsBuilder.buildIdProvider(name, 'test Id provider', 'First Selenium App', null);
            let userBrowsePanel = new UserBrowsePanel();
            let idProviderWizard = new IdProviderWizard();
            return testUtils.openIdProviderWizard(testIdProvider).then(() => {
                return idProviderWizard.typeData(testIdProvider);
            }).then(() => {
                return idProviderWizard.waitForSaveButtonDisabled();
            }).then(() => {
                return userBrowsePanel.doClickOnCloseTabButton(testIdProvider.displayName);
            }).then(() => {
                return idProviderWizard.pause(400);
            }).then(() => {
                testUtils.saveScreenshot('application_save_before_close_present1');
                let saveBeforeCloseDialog = new SaveBeforeCloseDialog();
                return assert.eventually.isTrue(saveBeforeCloseDialog.isDialogLoaded(), "`Save before close` dialog should appear");
            })
        });

    it(`GIVEN Provider-configuration dialog is opened WHEN required inputs in Provider-dialog are filled THEN the Id Provider is getting valid`,
        () => {
            let name = userItemsBuilder.generateRandomName('provider');
            let testIdProvider = userItemsBuilder.buildIdProvider(name, 'test Id provider', 'First Selenium App', null);
            let idProviderWizard = new IdProviderWizard();
            let providerConfigDialog = new ProviderConfigDialog();
            return testUtils.openIdProviderWizard(testIdProvider).then(() => {
                return idProviderWizard.typeData(testIdProvider);
            }).then(()=>{
                return idProviderWizard.pause(700);
            }).then(() => {
                return providerConfigDialog.openDialogFillRequiredInputs('domain', 'id', 'secret');
            }).then(() => {
                return idProviderWizard.isItemInvalid(testIdProvider.displayName);
            }).then(result => {
                testUtils.saveScreenshot('id_provider_is_getting_valid');
                assert.isFalse(result, 'Red icon should not be present at the wizard');
            })
        });

    it(`GIVEN wizard for new Id Provider is opened AND required inputs in provider-configuration dialog are filled WHEN Save and Close buttons have been pressed THEN 'Save Before' dialog should not appear`,
        () => {
            let name = userItemsBuilder.generateRandomName('provider');
            let testIdProvider = userItemsBuilder.buildIdProvider(name, 'test Id provider', 'First Selenium App', null);
            let idProviderWizard = new IdProviderWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let providerConfigDialog = new ProviderConfigDialog();
            return testUtils.openIdProviderWizard(testIdProvider).then(() => {
                return idProviderWizard.typeData(testIdProvider);
            }).then(() => {
                return idProviderWizard.pause(700);
            }).then(() => {
                return providerConfigDialog.openDialogFillRequiredInputs('domain', 'id', 'secret');
            }).then(() => {
                return idProviderWizard.waitAndClickOnSave();
            }).then(() => {
                return idProviderWizard.waitForSpinnerNotVisible();
            }).then(() => {
                return userBrowsePanel.doClickOnCloseTabButton(testIdProvider.displayName);
            }).then(() => {
                return idProviderWizard.pause(500);
            }).then(() => {
                testUtils.saveScreenshot("idprovider_wizard_modal_dialog_should_be_closed");
                let saveBeforeCloseDialog = new SaveBeforeCloseDialog();
                return assert.eventually.isFalse(saveBeforeCloseDialog.isDialogLoaded(), "`Save before close` dialog should not appear");
            })
        });
    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});



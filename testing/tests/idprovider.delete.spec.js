/**
 * Created on 21.11.2017.
 */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const idProviderWizard = require('../page_objects/wizardpanel/idprovider.wizard');
const userBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const confirmationDialog = require("../page_objects/confirmation.dialog");

describe('Confirm and delete `Id Provider` in wizard and in browse panel', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();
    let idProvider;

    it('GIVEN `IdProvider` is saved WHEN Delete button on toolbar has been pressed THEN Confirmation dialog should appear',
        () => {
        idProvider = userItemsBuilder.buildIdProvider(userItemsBuilder.generateRandomName('store'), 'test Id provider1');
    return testUtils.clickOnNewOpenIdProviderWizard().then(() = > {
        return idProviderWizard.typeData(idProvider)
            }).then(() => {
        return idProviderWizard.waitAndClickOnSave();
            }).then(() => {
        return idProviderWizard.waitForSpinnerNotVisible();
            }).pause(1200).then(() => {
        return idProviderWizard.clickOnDelete();
            }).then(() => {
        testUtils.saveScreenshot("idprovider_wizard_confirm_delete1");
                return assert.eventually.isTrue(confirmationDialog.waitForDialogLoaded(), "`Confirmation Dialog` should be displayed");
            });
        });

    it('GIVEN IdProvider is opened WHEN the IdProvider has been deleted THEN correct notification message should appear',
        () = > {
        idProvider = userItemsBuilder.buildIdProvider(userItemsBuilder.generateRandomName('store'), 'test Id provider2');
    return testUtils.clickOnNewOpenIdProviderWizard().then(() = > {
        return idProviderWizard.typeData(idProvider)
            }).then(() => {
        return idProviderWizard.waitAndClickOnSave();
            }).then(() => {
        return idProviderWizard.waitForSpinnerNotVisible();
            }).pause(900).then(() => {
        return idProviderWizard.clickOnDelete();
            }).then(() => {
                return testUtils.confirmDelete();
            }).then(result => {
        testUtils.saveScreenshot("idprovider_deleted_confirmation_mess1");
    var expectedMessage = appConst.storeDeletedMessage(idProvider.displayName);
                return assert.eventually.isTrue(userBrowsePanel.waitForExpectedNotificationMessage(expectedMessage),
                    "Correct notification message should appear");
            });
        });

    it('GIVEN `IdProvider` is selected WHEN Delete button on the browse-toolbar has been pressed THEN Confirmation dialog should appear',
        () = > {
        idProvider = userItemsBuilder.buildIdProvider(userItemsBuilder.generateRandomName('store'), 'test Id provider3');
    return testUtils.openWizardAndSaveIdProvider(idProvider).then(() = > {
        return userBrowsePanel.doClickOnCloseTabAndWaitGrid(idProvider.displayName);
            }).then(() => {
        return testUtils.findAndSelectItem(idProvider.displayName);
            }).then(() => {
                return userBrowsePanel.waitForDeleteButtonEnabled();
            }).then(() => {
                return userBrowsePanel.clickOnDeleteButton();
            }).then(() => {
                testUtils.saveScreenshot("store_confirm_delete2");
                return assert.eventually.isTrue(confirmationDialog.waitForDialogLoaded(), "`Confirmation Dialog` should be displayed");
            });
        });

    it('GIVEN existing IdProvider WHEN the store has been deleted in the browse panel THEN correct notification should appear',
        () = > {
        return testUtils.selectAndDeleteItem(idProvider.displayName).then(() = > {
                return userBrowsePanel.waitForNotificationMessage();
            }).then(result => {
                testUtils.saveScreenshot("store_deleted_notification_mes2");
    let msg = appConst.storeDeletedMessage(idProvider.displayName);
                assert.strictEqual(result, msg, 'expected notification message should be displayed');
            });
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});


/**
 * Created on 21.11.2017.
 */
const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const IdProviderWizard = require('../page_objects/wizardpanel/idprovider.wizard');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const ConfirmationDialog = require("../page_objects/confirmation.dialog");

describe("Confirm and delete 'Id Provider' in wizard and in browse panel", function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    let idProvider;

    //Verifies https://github.com/enonic/app-users/issues/281  Delete button does not get enabled after saving of new provider
    it("GIVEN 'IdProvider' has been saved WHEN Delete button in wizard-toolbar has been pressed THEN Confirmation dialog should appear",
        async () => {
            let idProviderWizard = new IdProviderWizard();
            idProvider = userItemsBuilder.buildIdProvider(userItemsBuilder.generateRandomName('provider'), 'test Id provider1');
            //1. Open new wizard and type the data:
            await testUtils.openIdProviderWizard();
            await idProviderWizard.typeData(idProvider);
            //2. Save the provider:
            await idProviderWizard.waitAndClickOnSave();
            await idProviderWizard.waitForSpinnerNotVisible();
            await idProviderWizard.pause(1000);
            //3. Click on Delete button:
            await idProviderWizard.clickOnDelete();
            await testUtils.saveScreenshot("idprovider_wizard_confirm_delete1");
            let confirmationDialog = new ConfirmationDialog();
            //"Confirmation Dialog" should appear:
            await confirmationDialog.waitForDialogLoaded();
        });

    it('GIVEN existing IdProvider is opened and Everyone acl entry is added WHEN the acl-entry has been updated THEN new acl-operation should be saved',
        async () => {
            let idProviderWizard = new IdProviderWizard();
            let userBrowsePanel = new UserBrowsePanel();
            //1. Open existing ID provider:
            await testUtils.findAndSelectItem(idProvider.displayName);
            await userBrowsePanel.waitForEditButtonEnabled();
            await userBrowsePanel.clickOnEditButton();
            await idProviderWizard.waitForOpened();
            //2. Type the principal in 'Options-Filter input' and click on 'Everyone':
            await idProviderWizard.addPrincipals(['Everyone']);
            await idProviderWizard.pause(1000);
            //3. Click on the selected option (Everyone) and show menu options:
            await idProviderWizard.clickOnSelectedACEAndShowMenuOperations('Everyone');
            //4. Click on "Administrator" menu item
            await idProviderWizard.clickOnAceMenuOperation('Administrator');
            //5. save the Id Provider
            await idProviderWizard.waitAndClickOnSave();
            await idProviderWizard.pause(1000);
            // gets selected operation
            let result = await idProviderWizard.getSelectedAceOperation('Everyone');
            await testUtils.saveScreenshot("idprovider_administrator_for_everyone");
            assert.equal(result, "Administrator", "Administrator should be present for Everyone");
        });

    //Verifies https://github.com/enonic/app-users/issues/281  Delete button does not get enabled after saving of new provider
    it('GIVEN new IdProvider has been saved WHEN the provider has been deleted in the wizard THEN expected notification message should appear',
        async () => {
            let idProviderWizard = new IdProviderWizard();
            let userBrowsePanel = new UserBrowsePanel();
            idProvider = userItemsBuilder.buildIdProvider(userItemsBuilder.generateRandomName('provider'), 'test Id provider2');
            //1. Open new wizard and type the data and save it:
            await testUtils.openIdProviderWizard();
            await idProviderWizard.typeData(idProvider);
            await idProviderWizard.waitAndClickOnSave();
            await idProviderWizard.waitForSpinnerNotVisible();
            await idProviderWizard.pause(1000);
            //2. click on Delete in wizard-toolbar:
            await idProviderWizard.clickOnDelete();
            //3. Confirm the deleting:
            await testUtils.confirmDelete();
            await testUtils.saveScreenshot("idprovider_deleted_confirmation_mess1");
            let expectedMessage = appConst.providerDeletedMessage(idProvider.displayName);
            //Expected notification message should appear
            await userBrowsePanel.waitForExpectedNotificationMessage(expectedMessage);
        });

    it('GIVEN existing `IdProvider` is selected WHEN Delete button in browse-toolbar has been pressed THEN Confirmation dialog should appear',
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            idProvider = userItemsBuilder.buildIdProvider(userItemsBuilder.generateRandomName('provider'), 'test Id provider3');
            //1. Save new id provider:
            await testUtils.openWizardAndSaveIdProvider(idProvider);
            await userBrowsePanel.closeTabAndWaitForGrid(idProvider.displayName);
            //2. Go to browse panel and select the provider:
            await testUtils.findAndSelectItem(idProvider.displayName);
            await userBrowsePanel.waitForDeleteButtonEnabled();
            //3. Click on Delete button:
            await userBrowsePanel.clickOnDeleteButton();
            let confirmationDialog = new ConfirmationDialog();
            await testUtils.saveScreenshot("idprovider_confirm_delete2");
            //`Confirmation Dialog` should appear:
            await confirmationDialog.waitForDialogLoaded();
        });

    it('GIVEN existing IdProvider is selected WHEN the provider has been deleted THEN expected notification should appear',
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            // Select the provider and click on Delete button:
            await testUtils.selectAndDeleteItem(idProvider.displayName);
            let actualMessage = await userBrowsePanel.waitForNotificationMessage();
            await testUtils.saveScreenshot("store_deleted_notification_mes2");
            let expectedMessage = appConst.providerDeletedMessage(idProvider.displayName);
            // Expected message: Id Provider "${displayName}" is deleted
            assert.strictEqual(actualMessage, expectedMessage, 'expected notification message should be displayed');
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(async () => {
        await testUtils.getBrowser().maximizeWindow();
        return console.log('specification starting: ' + this.title);
    });
});

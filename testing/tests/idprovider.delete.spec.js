/**
 * Created on 21.11.2017.
 */
const assert = require('node:assert');
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
    let ID_PROVIDER;

    //Verifies https://github.com/enonic/app-users/issues/281  Delete button does not get enabled after saving of new provider
    it("GIVEN 'IdProvider' has been saved WHEN 'Delete' button in wizard-toolbar has been pressed THEN Confirmation dialog should appear",
        async () => {
            let idProviderWizard = new IdProviderWizard();
            ID_PROVIDER = userItemsBuilder.buildIdProvider(userItemsBuilder.generateRandomName('provider'), 'test Id provider1');
            // 1. Open new wizard and type the data:
            await testUtils.openIdProviderWizard();
            await idProviderWizard.typeData(ID_PROVIDER);
            // 2. Save the provider:
            await idProviderWizard.waitAndClickOnSave();
            await idProviderWizard.waitForNotificationMessage();
            await idProviderWizard.waitForSpinnerNotVisible();
            // 3. Click on Delete button:
            await idProviderWizard.clickOnDelete();
            await testUtils.saveScreenshot('id_provider_wizard_confirm_delete1');
            let confirmationDialog = new ConfirmationDialog();
            // 'Confirmation Dialog' should appear:
            await confirmationDialog.waitForDialogLoaded();
        });

    it(`GIVEN existing IdProvider is opened and 'Everyone' acl entry is added WHEN access for 'Everyone' acl-entry has been set to 'Administrator' THEN 'Everyone' should be correctly displayed`,
        async () => {
            let idProviderWizard = new IdProviderWizard();
            let userBrowsePanel = new UserBrowsePanel();
            // 1. Open existing ID provider:
            await testUtils.findAndSelectItem(ID_PROVIDER.displayName);
            await userBrowsePanel.waitForEditButtonEnabled();
            await userBrowsePanel.clickOnEditButton();
            await idProviderWizard.waitForOpened();
            // 2. Type the principal in 'Options-Filter input' and click on 'Everyone':
            await idProviderWizard.addPrincipals(['Everyone']);
            await idProviderWizard.pause(1000);
            // 3. Click on the added 'Everyone-item' and open menu options:
            await idProviderWizard.clickOnSelectedACEAndShowMenuOperations('Everyone');
            // 4. Click on "Administrator" menu item - change the access to 'Administrator'
            await idProviderWizard.clickOnAceMenuOperation('Administrator');
            // 5. save the 'Id Provider' - click on Save button
            await idProviderWizard.waitAndClickOnSave();
            await idProviderWizard.waitForNotificationMessage();
            // check the selected operation:
            let result = await idProviderWizard.getSelectedAceOperation('Everyone');
            await testUtils.saveScreenshot('id_provider_administrator_for_everyone');
            assert.equal(result, 'Administrator', "Administrator access should be displayed for Everyone acl entry");
        });

    // Verifies https://github.com/enonic/app-users/issues/281  Delete button does not get enabled after saving of new provider
    it('GIVEN new IdProvider has been saved WHEN the provider has been deleted in the wizard THEN expected notification message should appear',
        async () => {
            let idProviderWizard = new IdProviderWizard();
            let userBrowsePanel = new UserBrowsePanel();
            ID_PROVIDER = userItemsBuilder.buildIdProvider(userItemsBuilder.generateRandomName('provider'), 'test Id provider2');
            // 1. Open new wizard and type the data and save it:
            await testUtils.openIdProviderWizard();
            await idProviderWizard.typeData(ID_PROVIDER);
            await idProviderWizard.waitAndClickOnSave();
            await idProviderWizard.waitForNotificationMessage();
            await idProviderWizard.waitForSpinnerNotVisible();
            // 2. click on Delete in wizard-toolbar:
            await idProviderWizard.clickOnDelete();
            // 3. Confirm the deleting:
            await testUtils.confirmDelete();
            await testUtils.saveScreenshot('idprovider_deleted_confirmation_mess1');
            let expectedMessage = appConst.providerDeletedMessage(ID_PROVIDER.displayName);
            // Expected notification message should appear
            await userBrowsePanel.waitForExpectedNotificationMessage(expectedMessage);
        });

    it('GIVEN existing `IdProvider` is selected WHEN Delete button in browse-toolbar has been pressed THEN Confirmation dialog should appear',
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            ID_PROVIDER = userItemsBuilder.buildIdProvider(userItemsBuilder.generateRandomName('provider'), 'test Id provider3');
            // 1. Save new id provider:
            await testUtils.openWizardAndSaveIdProvider(ID_PROVIDER);
            await userBrowsePanel.closeTabAndWaitForGrid(ID_PROVIDER.displayName);
            // 2. Go to browse panel and select the provider:
            await testUtils.findAndSelectItem(ID_PROVIDER.displayName);
            await userBrowsePanel.waitForDeleteButtonEnabled();
            // 3. Click on Delete button:
            await userBrowsePanel.clickOnDeleteButton();
            let confirmationDialog = new ConfirmationDialog();
            await testUtils.saveScreenshot('idprovider_confirm_delete2');
            //`Confirmation Dialog` should appear:
            await confirmationDialog.waitForDialogLoaded();
        });

    it('GIVEN existing IdProvider is selected WHEN the provider has been deleted THEN expected notification should appear',
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            // Select the provider and click on Delete button:
            await testUtils.selectAndDeleteItem(ID_PROVIDER.displayName);
            let actualMessage = await userBrowsePanel.waitForNotificationMessage();
            await testUtils.saveScreenshot('idprovider_deleted_notification_mes2');
            let expectedMessage = appConst.providerDeletedMessage(ID_PROVIDER.displayName);
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

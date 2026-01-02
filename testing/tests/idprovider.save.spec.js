/**
 * Created on 29/06/2017.
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const userItemsBuilder = require('../libs/userItems.builder.js');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const IdProviderWizard = require('../page_objects/wizardpanel/idprovider.wizard');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const NewPrincipalDialog = require('../page_objects/browsepanel/new.principal.dialog');

describe('Id Provider specification - save and edit a provider', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    let ID_PROVIDER;
    let ID_PROVIDER_2;
    let TEST_USER;
    const PASSWORD = appConst.PASSWORD.MEDIUM;

    it(`GIVEN wizard for new 'Id Provider' is opened WHEN name has been typed AND 'Save' button pressed THEN expected notification message should appear`,
        async () => {
            let idProviderWizard = new IdProviderWizard();
            ID_PROVIDER = userItemsBuilder.buildIdProvider(userItemsBuilder.generateRandomName('provider'), 'test Id provider');
            await testUtils.openIdProviderWizard();
            await idProviderWizard.typeDisplayName(ID_PROVIDER.displayName);
            await idProviderWizard.waitAndClickOnSave();
            let actualMessage = await idProviderWizard.waitForNotificationMessage();
            assert.strictEqual(actualMessage, appConst.NOTIFICATION_MESSAGE.PROVIDER_CREATED,
                'expected notification message should appear');
        });

    it(`GIVEN existing two providers WHEN New button has been pressed THEN 2 row-expander should be present in the dialog`,
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let newPrincipalDialog = new NewPrincipalDialog();
            //1. Open New Content dialog:
            await userBrowsePanel.clickOnNewButton();
            await newPrincipalDialog.waitForDialogLoaded();
            //2. Verify expander-icons on the dialog:
            let result = await newPrincipalDialog.waitForExpanderIconDisplayed("User Group");
            assert.ok(result, "Expander in User Group menu-item should be displayed");
            result = await newPrincipalDialog.waitForExpanderIconDisplayed('User');
            assert.ok(result, "Expander in User menu-item should be displayed");
        });

    it(`GIVEN existing 2 id-providers AND New button has been pressed WHEN expander has been clicked THEN expected provider's name should be present in expanded menu`,
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let newPrincipalDialog = new NewPrincipalDialog();
            // 1. Open New content dialog:
            await userBrowsePanel.clickOnNewButton();
            await newPrincipalDialog.waitForDialogLoaded();
            // 2. Click on the expander-icon in Users Group menu item:
            await newPrincipalDialog.clickOnExpanderIcon('User Group');
            // 3. 2 id-providers should be present in the expanded menu:
            await testUtils.saveScreenshot('User_Group_row_expanded');
            await newPrincipalDialog.waitForProviderNameDisplayed(ID_PROVIDER.displayName);
        });

    it(`GIVEN 'Id provider' wizard is opened WHEN the name that already in use has been typed THEN Expected notification message should appear`,
        async () => {
            let idProviderWizard = new IdProviderWizard();
            // 1. Open new wizard:
            await testUtils.openIdProviderWizard();
            // 2. Type the name and save:
            await idProviderWizard.typeDisplayName(ID_PROVIDER.displayName);
            await idProviderWizard.waitAndClickOnSave();
            // 3. Expected notification message should appear:
            let actualMessage = await idProviderWizard.waitForErrorNotificationMessage();
            let msg = `Id Provider [` + ID_PROVIDER.displayName + `] could not be created. A Id Provider with that name already exists`;
            assert.strictEqual(actualMessage, msg, 'expected notification message should be displayed');
            // verifies issue#189 - (Endless spinner when saving the Id Provider)
            await idProviderWizard.waitForSpinnerNotVisible();
        });

    it(`WHEN new Id Provider with description has been saved THEN new Id Provider should be present in browse panel`,
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            ID_PROVIDER_2 = userItemsBuilder.buildIdProvider(userItemsBuilder.generateRandomName('provider'), 'test Id provider');
            // 1. Save new ID Provider:
            await testUtils.openWizardAndSaveIdProvider(ID_PROVIDER_2);
            await userBrowsePanel.closeTabAndWaitForGrid(ID_PROVIDER_2.displayName);
            await userBrowsePanel.pause(1000);
            // 2. new Id Provider should be present in browse panel:
            let isDisplayed = await userBrowsePanel.isItemDisplayed(ID_PROVIDER_2.displayName);
            assert.ok(isDisplayed, 'new Id provider should be present in the grid');
        });

    it(`WHEN new ID Provider with permissions has been saved AND the wizard has been closed THEN 'Save Before Close' dialog should not appear`,
        async () => {
            let idProviderWizard = new IdProviderWizard();
            let permissions = ['Everyone', 'Users App'];
            let userBrowsePanel = new UserBrowsePanel();
            let name = userItemsBuilder.generateRandomName('provider');
            let testProvider = userItemsBuilder.buildIdProvider(name, 'test Id provider', null, permissions);
            // 1. Open new wizard and type the data with permissions:
            await testUtils.openIdProviderWizard(testProvider);
            await idProviderWizard.typeData(testProvider);
            // 2. click on Save button:
            await idProviderWizard.waitAndClickOnSave();
            await idProviderWizard.waitForNotificationMessage();
            await idProviderWizard.waitForSpinnerNotVisible();
            // 3. Close the wizard-tab:
            await userBrowsePanel.closeTabAndWaitForGrid(testProvider.displayName);
            let result = await userBrowsePanel.isItemDisplayed(testProvider.displayName);
            assert.ok(result, 'new Id provider should be present in browse panel');
        });

    it(`WHEN existing 'Id Provider' has been opened THEN expected description should be present`,
        async () => {
            let idProviderWizard = new IdProviderWizard();
            let userBrowsePanel = new UserBrowsePanel();
            await userBrowsePanel.clickOnRowByName(ID_PROVIDER_2.displayName);
            await userBrowsePanel.clickOnEditButton();
            await idProviderWizard.waitForOpened();
            let description = await idProviderWizard.getDescription();
            assert.strictEqual(description, ID_PROVIDER_2.description, 'actual and expected descriptions should be equal');
        });

    it(`GIVEN existing 'Id Provider'(no any users) WHEN it has been selected THEN 'Delete' button should be enabled`,
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            await userBrowsePanel.clickOnRowByName(ID_PROVIDER_2.displayName);
            // 'Delete' button should be enabled, because of the provider does not contain users:
            await userBrowsePanel.waitForDeleteButtonEnabled();
            // 'New' button should be enabled
            await userBrowsePanel.waitForNewButtonEnabled();
            // 'Edit' button should be enabled
            await userBrowsePanel.isEditButtonEnabled();
        });

    // Verifies https://github.com/enonic/app-users/issues/461
    // Delete button remains enabled after adding a user in ID provider #461
    it(`GIVEN existing 'Id Provider'(with an user) is selected WHEN new user has been added THEN 'Delete' button(in browse panel) gets disabled`,
        async () => {
            let userName = userItemsBuilder.generateRandomName('user');
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            TEST_USER = userItemsBuilder.buildUser(userName, PASSWORD, userItemsBuilder.generateEmail(userName));
            // 1. Select existing ID Provider and add new user:
            await testUtils.clickOnIdProviderAndOpenUserWizard(ID_PROVIDER_2.displayName);
            await userWizard.typeData(TEST_USER);
            // 2. Close the user-wizard:
            await testUtils.saveAndCloseWizard(TEST_USER.displayName);
            // 3. Delete gets disabled, because of the ID Provider contains an user
            await userBrowsePanel.waitForDeleteButtonDisabled();
            await userBrowsePanel.waitForEditButtonEnabled();
        });

    // Verifies issue#275 : Id Provider wizard - Delete button gets enabled after updating the provider
    it(`GIVEN existing 'Id Provider' (with an user) is opened WHEN description has been updated and the provider saved THEN 'Delete' button should be disabled`,
        async () => {
            let idProviderWizard = new IdProviderWizard();
            // 1. Select and open existing ID Provider:
            await testUtils.selectAndOpenIdProvider(ID_PROVIDER_2.displayName);
            // 2. Update the description and save:
            await idProviderWizard.typeDescription("new description");
            await idProviderWizard.waitAndClickOnSave();
            await idProviderWizard.waitForNotificationMessage();
            // 3. Delete button should be disabled(id provider has users):
            await idProviderWizard.waitForDeleteButtonDisabled();
        });

    it(`GIVEN existing 'Id Provider' with an user WHEN the user has been deleted THEN the ID Provider can be deleted now`,
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            // 1. Select and delete the user:
            await testUtils.selectAndDeleteItem(TEST_USER.displayName);
            // Verify that the user is not present in the grid:
            await userBrowsePanel.waitForItemNotDisplayed(TEST_USER.displayName);
            // 2. User is deleted, so ID Provider can be deleted now:
            await testUtils.selectAndDeleteItem(ID_PROVIDER_2.displayName);
            // Verify: the ID provider is not displayed in browse panel
            await userBrowsePanel.waitForItemNotDisplayed(ID_PROVIDER_2.displayName);
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(async () => {
        await testUtils.getBrowser().maximizeWindow();
        return console.log('specification starting: ' + this.title);
    });
});

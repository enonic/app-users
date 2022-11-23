/**
 * Created on 28.09.2017.
 */
const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const ConfirmationDialog = require('../page_objects/confirmation.dialog');

describe('Save User specification - save an user', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === "undefined") {
        webDriverHelper.setupBrowser();
    }
    let testUser;
    let PASSWORD = appConst.PASSWORD.MEDIUM;

    //verifies  https://github.com/enonic/lib-admin-ui/issues/614
    //User Wizard - confirmation about unsaved changes after changes were saved
    it('GIVEN new user has been saved in wizard AND display name has been changed AND Save button pressed WHEN `close` icon clicked THEN `Confirmation dialog` should not appear',
        async () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let confirmationDialog = new ConfirmationDialog();
            let userName = userItemsBuilder.generateRandomName('user');
            testUser = userItemsBuilder.buildUser(userName, PASSWORD, userItemsBuilder.generateEmail(userName), null);
            //1. Open new user-wizard and type a name, email and password:
            await testUtils.clickOnSystemOpenUserWizard();
            await userWizard.typeData(testUser);
            //2. Save he user:
            await userWizard.waitAndClickOnSave();
            await userWizard.pause(3000);
            //3. update the name:
            await userWizard.typeDisplayName(userName + "123");
            await userWizard.pause(300);
            //4. Click on Save button:
            await userWizard.waitAndClickOnSave();
            //5. Click on 'close tab' icon
            await userBrowsePanel.doClickOnCloseTabButton(userName + "123");
            await userWizard.pause(400);
            //Verify that confirmation dialog is not loaded:
            let isLoaded = await confirmationDialog.isDialogLoaded();
            assert.isFalse(isLoaded, "Confirmation dialog should not be loaded, because all changes were saved");
        });

    it('GIVEN wizard for new User is opened AND valid data is typed WHEN the user has been saved THEN expected notification message should appear AND the user should be searchable',
        async () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let userName = userItemsBuilder.generateRandomName('user');
            testUser = userItemsBuilder.buildUser(userName, PASSWORD, userItemsBuilder.generateEmail(userName), null);
            //1. Open new wizard and save the user:
            await testUtils.clickOnSystemOpenUserWizard();
            await userWizard.typeData(testUser);
            await userWizard.waitAndClickOnSave();
            let actualMessage = await userWizard.waitForNotificationMessage();
            assert.equal(actualMessage, appConst.USER_WAS_CREATED_MESSAGE, "'User was created' - this message should appear");
            //2. Click on App Home button and go to the browse panel:
            await userBrowsePanel.clickOnAppHomeButton();
            //3. Type the name in Filter Panel:
            await testUtils.typeNameInFilterPanel(userName);
            //4. Verify that user is filtered
            let isPresent = await userBrowsePanel.isItemDisplayed(userName);
            assert.isTrue(isPresent, "New user should be added in the grid")
        });

    it('WHEN user has been saved in the wizard AND the wizard closed AND Users folder has been expanded THEN grid should be updated AND the user should be listed',
        async () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let userName = userItemsBuilder.generateRandomName('user');
            testUser = userItemsBuilder.buildUser(userName, PASSWORD, userItemsBuilder.generateEmail(userName), null);
            //1. Open new wizard and type username, password and email:
            await testUtils.clickOnSystemOpenUserWizard();
            await userWizard.typeData(testUser);
            await userWizard.waitAndClickOnSave();
            await userBrowsePanel.closeTabAndWaitForGrid(userName);
            await userBrowsePanel.pause(500);
            //2. Expand System  then Users folders:
            await userBrowsePanel.clickOnExpanderIcon("system");
            await userBrowsePanel.pause(500);
            await userBrowsePanel.clickOnExpanderIcon("users");
            //3. Verify that user is added:
            let isPresent = await userBrowsePanel.isItemDisplayed(userName);
            assert.isTrue(isPresent, "New user should be added beneath the Users folder");
        });

    it('WHEN try to save user with name that already in use THEN correct notification message should appear',
        async () => {
            let userWizard = new UserWizard();
            testUser.email = userItemsBuilder.generateEmail('test');
            //1. Open new wizard and type a name that is already in use:
            await testUtils.clickOnSystemOpenUserWizard();
            await userWizard.typeData(testUser);
            await userWizard.waitAndClickOnSave();
            let actualMessage = await userWizard.waitForErrorNotificationMessage();
            //2. Verify the error message:
            testUtils.saveScreenshot('user-already-exists-message');
            let expectedMessage = appConst.principalExistsMessage(testUser.displayName);
            assert.equal(actualMessage, expectedMessage, "' A principal with that name already exists' - this message should appear");
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(async () => {
        await testUtils.getBrowser().maximizeWindow();
        return console.log('specification starting: ' + this.title);
    });
});

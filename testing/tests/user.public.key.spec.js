/**
 * Created on 06.09.2023
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const NewPublicKeyDialog = require('../page_objects/wizardpanel/public-key/new.public.key.dialog');
const UserKeyDetailsDialog = require('../page_objects/wizardpanel/public-key/user.public.key.details');
const ConfirmationDialog = require("../page_objects/confirmation.dialog")

describe('user.public.key.spec: ui-tests for public key modal dialog', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    let TEST_USER;
    const PASSWORD = appConst.PASSWORD.MEDIUM;
    const KEY_LABEL_1 = appConst.generateRandomName('label');

    it("Preconditions: user should be created",
        async () => {
            let userName = userItemsBuilder.generateRandomName('user');
            TEST_USER = userItemsBuilder.buildUser(userName, PASSWORD, userItemsBuilder.generateEmail(userName), null);
            await testUtils.addSystemUser(TEST_USER);
        });

    it("GIVEN existing user is opened WHEN 'Add' public key button has been pressed THEN 'New public key' modal dialog should be loaded",
        async () => {
            let userWizard = new UserWizard();
            let newPublicKeyDialog = new NewPublicKeyDialog();
            // 1. Select and open the existing user:
            await testUtils.selectUserAndOpenWizard(TEST_USER.displayName);
            // 2. Click on 'Add' public key button:
            await userWizard.clickOnAddPublicKeyButton();
            await newPublicKeyDialog.waitForLoaded();
            // 3. Verify that 'Generate' button is disabled:
            await newPublicKeyDialog.waitForGenerateButtonDisabled();
            // 4. Click on 'Cancel' button in the modal dialog:
            await newPublicKeyDialog.clickOnCancelButton();
            // 5. Verify that the dialog is closed:
            await newPublicKeyDialog.waitForClosed();
        });

    it("GIVEN New PublicKey Dialog is opened WHEN label input has been filled THEN 'Generate' button gets enabled",
        async () => {
            let userWizard = new UserWizard();
            let newPublicKeyDialog = new NewPublicKeyDialog();
            // 1. Select and open the existing user:
            await testUtils.selectUserAndOpenWizard(TEST_USER.displayName);
            // 2. Click on 'Add' public key button:
            await userWizard.clickOnAddPublicKeyButton();
            await newPublicKeyDialog.waitForLoaded();
            await newPublicKeyDialog.typeKeyLabel(KEY_LABEL_1);
            await newPublicKeyDialog.waitForGenerateButtonEnabled();
            await testUtils.saveScreenshot('public_key_dialog_generate_btn');
            // 3. Click on 'Generate' button:
            await newPublicKeyDialog.clickOnGenerateButton();
            // 4. Verify that the modal dialog is closed:
            await newPublicKeyDialog.waitForClosed();
            await testUtils.saveScreenshot('public_key_generated');
            // 5. Verify the notification message:
            let message = await userWizard.waitForNotificationMessage();
            assert.ok(message.includes("A file with the private key was stored on your computer"),
                'Expected notification message should appear');
        });

    it("GIVEN New PublicKey Dialog is opened WHEN label input has been filled AND dropdown button has been pressed THEN 'Upload' menu item gets available",
        async () => {
            let userWizard = new UserWizard();
            let newPublicKeyDialog = new NewPublicKeyDialog();
            // 1. Select and open the existing user:
            await testUtils.selectUserAndOpenWizard(TEST_USER.displayName);
            // 2. Click on 'Add' public key button:
            await userWizard.clickOnAddPublicKeyButton();
            await newPublicKeyDialog.waitForLoaded();
            await newPublicKeyDialog.typeKeyLabel(KEY_LABEL_1);
            // 3. Expand the menu:
            await newPublicKeyDialog.clickOnMenuDropdownHandle();
            await testUtils.saveScreenshot('public_key_dialog_upload_btn');
            // 4. Verify that Upload menu item is available
            await newPublicKeyDialog.waitForMnuItemDisplayed('Upload');
        });

    it("GIVEN existing user is opened WHEN 'Show key details' link has been pressed THEN 'user Key Details Dialog' should be loaded",
        async () => {
            let userWizard = new UserWizard();
            let userKeyDetailsDialog = new UserKeyDetailsDialog();
            // 1. Select and open the existing user:
            await testUtils.selectUserAndOpenWizard(TEST_USER.displayName);
            // 2. Click on 'Show key details' link:
            await userWizard.clickOnShowKeyDetailsLink(KEY_LABEL_1);
            // 3. Verify that Key Details modal dialog is loaded:
            await userKeyDetailsDialog.waitForLoaded();
            await testUtils.saveScreenshot('key_details_dialog');
            // 4. Verify the key-text in the text area:
            let text = await userKeyDetailsDialog.getTextInTextArea();
            assert.ok(text.includes('BEGIN PUBLIC KEY'), "Expected text should be displayed in the modal dialog");
            assert.ok(text.includes('END PUBLIC KEY'), "Expected text should be displayed in the modal dialog");
        });

    it("GIVEN existing user is opened WHEN public key has been removed THEN the row with key should not be present in the table",
        async () => {
            let userWizard = new UserWizard();
            let confirmationDialog = new ConfirmationDialog();
            // 1. Select and open the existing user:
            await testUtils.selectUserAndOpenWizard(TEST_USER.displayName);
            // 2. Click on 'Remove public key' icon
            await testUtils.saveScreenshot('key_row_before_removing');
            let result = await userWizard.getNumberOfKeyRows();
            assert.equal(result,1, "The only one public key is displayed in the table");
            await userWizard.clickOnRemovePublicKeyIcon(0);
            // 3. Click on Yes in the confirmation dialog:
            await confirmationDialog.waitForDialogLoaded();
            await confirmationDialog.clickOnYesButton();
            await confirmationDialog.waitForDialogClosed();
            await userWizard.pause(500);
            await testUtils.saveScreenshot('key_row_removed');
            // 4. Verify that the table gets empty:
            result = await userWizard.getNumberOfKeyRows();
            assert.equal(result, 0, 'empty table should be displayed in the key-form');
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(async () => {
        if (typeof browser !== 'undefined') {
            await testUtils.getBrowser().setWindowSize(appConst.BROWSER_WIDTH, appConst.BROWSER_HEIGHT);
        }
        return console.log('specification starting: ' + this.title);
    });
});

/**
 * Created on 05.09.2017.
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const appConst = require('../libs/app_const');
const testUtils = require('../libs/test.utils');
const RoleWizard = require('../page_objects/wizardpanel/role.wizard');
const NewPrincipalDialog = require('../page_objects/browsepanel/new.principal.dialog');

describe('New Principal dialog specification', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    const ITEMS_NUMBER = 4;

    it('GIVEN `NewPrincipal` dialog is opened WHEN `Cancel` button(top) has been pressed  THEN the dialog should be closed',
        async () => {
            let newPrincipalDialog = new NewPrincipalDialog();
            let userBrowsePanel = new UserBrowsePanel();
            // 1. Open New Principal dialog:
            await userBrowsePanel.clickOnNewButton();
            await newPrincipalDialog.waitForDialogLoaded();
            await testUtils.saveScreenshot('new_principal_dialog_loaded');
            // 2. Click on Cancel button:
            await newPrincipalDialog.clickOnCancelButtonTop();
            // 3. Verify that dialog is closed:
            await newPrincipalDialog.waitForDialogClosed();
        });

    it(`GIVEN users grid is opened WHEN 'New' button has been clicked THEN modal dialog should appear with 4 items`,
        async () => {
            let newPrincipalDialog = new NewPrincipalDialog();
            let userBrowsePanel = new UserBrowsePanel();
            // 1. Open New Principal Dialog:
            await userBrowsePanel.clickOnNewButton();
            await newPrincipalDialog.waitForDialogLoaded();
            let header = await newPrincipalDialog.getHeaderText();
            assert.equal(header, 'Create New', 'Expected header should be displayed');

            let result = await newPrincipalDialog.isCancelButtonDisplayed();
            assert.ok(result, '`Cancel` button should be present');
            // 2. Expected items should be present in the dialog:
            let items = await newPrincipalDialog.getItemNames();
            assert.equal(items[0], appConst.USER, '`User` item should be present on the dialog');
            assert.equal(items[1], appConst.USER_GROUP, '`User Group` item should be present on the dialog');
            assert.equal(items[2], appConst.ID_PROVIDER, '`Id Provider` item should be present on the dialog');
            assert.equal(items[3], appConst.ROLE, '`Role` item should be present');
            assert.equal(items.length, ITEMS_NUMBER, '4 items to select should be present on the dialog');
        });

    it(`GIVEN 'System ID Provider' is selected WHEN 'New' button has been clicked THEN modal dialog should appear with 2 items`,
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let newPrincipalDialog = new NewPrincipalDialog();
            // 1. Select System ID Provider:
            await userBrowsePanel.clickOnRowByName('/system');
            // 2. Click on New button:
            await userBrowsePanel.clickOnNewButton();
            await newPrincipalDialog.waitForDialogLoaded();
            await testUtils.saveScreenshot('new_principal_dialog_2_items');
            // 3. Two items should be present in the modal dialog:
            let items = await newPrincipalDialog.getItemNames();
            assert.equal(items.length, 2, "Two items should be present");
            assert.equal(items[0], appConst.USER, '`User` item should be present on the dialog');
            assert.equal(items[1], appConst.USER_GROUP, '`User Group` item should be present on the dialog');
        });

    it(`GIVEN 'Roles' folder is selected WHEN 'New' button has been clicked THEN Role Wizard should be loaded`,
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            // 1. Roles folder has been selected:
            await userBrowsePanel.clickOnRowByName('roles');
            await userBrowsePanel.clickOnNewButton();
            let roleWizard = new RoleWizard();
            // 2. Role Wizard should be loaded
            await roleWizard.waitForLoaded();
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

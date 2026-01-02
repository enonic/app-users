/**
 * Created on 21/05/2018.
 */
const webDriverHelper = require('../libs/WebDriverHelper');
const appConst = require('../libs/app_const');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const NewPrincipalDialog = require('../page_objects/browsepanel/new.principal.dialog');
const IdProviderWizard = require('../page_objects/wizardpanel/idprovider.wizard');
const ConfirmationDialog = require('../page_objects/confirmation.dialog');

describe('User Browse panel, toolbar shortcut spec', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    it(`GIVEN user browse panel is opened WHEN 'Alt+n' has been pressed THEN New Principal Dialog should appear`,
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let newPrincipalDialog = new NewPrincipalDialog();
            await userBrowsePanel.hotKeyNew();
            //'New Principal Dialog' should be loaded:
            await newPrincipalDialog.waitForDialogLoaded();
        });

    it(`GIVEN system Id provider is selected WHEN 'Ctrl+e' has been pressed THEN System Id Provider wizard should be loaded`,
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let idProviderWizard = new IdProviderWizard();
            await testUtils.findAndSelectItem('/system');
            await userBrowsePanel.hotKeyEdit();
            await testUtils.saveScreenshot('hot_key_edit_system');
            // 'Id Provider' wizard should be loaded'
            await idProviderWizard.waitForOpened();
        });

    it(`GIVEN cms role is selected WHEN 'Ctrl+del' has been pressed THEN Confirmation Dialog should appear`,
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let roleName = 'cms.cm.app';
            await testUtils.findAndSelectItem(roleName);
            await userBrowsePanel.hotKeyDelete();
            await testUtils.saveScreenshot('hot_key_delete_role');
            // Confirmation Dialog should be loaded:
            let confirmationDialog = new ConfirmationDialog();
            await confirmationDialog.waitForDialogLoaded();
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

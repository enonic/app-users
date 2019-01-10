/**
 * Created on 21/05/2018.
 *
 */
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const appConst = require('../libs/app_const');
const userBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const newPrincipalDialog = require('../page_objects/browsepanel/new.principal.dialog');
const idProviderWizard = require('../page_objects/wizardpanel/idprovider.wizard');
const confirmationDialog = require('../page_objects/confirmation.dialog');

describe('User Browse panel, toolbar shortcut spec', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();

    it(`GIVEN user browse panel is opened WHEN 'Ctrl+Alt+n' has been pressed THEN New Principal Dialog should appear`, () => {
        return userBrowsePanel.hotKeyNew().then(() => {
            return newPrincipalDialog.waitForOpened()
        }).then(result => {
            testUtils.saveScreenshot('hot_key_new');
            assert.isTrue(result, 'New Principal Dialog should appear');
        });
    });
    it(`GIVEN system Id provider is selected WHEN 'f4'  has been pressed THEN System Id Provider wizard should be loaded`, () = > {
        return testUtils.findAndSelectItem('/system').then(() => {
            return userBrowsePanel.hotKeyEdit();
        }).then(() => {
        return idProviderWizard.waitForOpened();
        }).then(result => {
            testUtils.saveScreenshot('hot_key_edit_system');
    assert.isTrue(result, 'Id Provider wizard should be loaded');
        });
    });
    it(`GIVEN system role is selected WHEN 'Ctrl+del' has been pressed THEN Confirmation Dialog should appear`, () => {
        return testUtils.findAndSelectItem('system.user.app').then(() => {
            return userBrowsePanel.hotKeyDelete();
        }).then(() => {
            return confirmationDialog.waitForDialogLoaded();
        }).then(result => {
            testUtils.saveScreenshot('hot_key_delete_role');
            assert.isTrue(result, 'Confirmation Dialog should be loaded');
        });
    });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});







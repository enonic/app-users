/**
 * Created on 05.09.2017.
 */
const chai = require('chai');
chai.Should();
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const appConst = require('../libs/app_const');
const testUtils = require('../libs/test.utils');
const RoleWizard = require('../page_objects/wizardpanel/role.wizard');
const NewPrincipalDialog = require('../page_objects/browsepanel/new.principal.dialog');

describe('New Principal dialog specification', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();
    let ITEMS_NUMBER = 4;

    it('GIVEN `NewPrincipal` dialog is opened WHEN `Cancel` button(top) has been pressed  THEN the dialog should be closed',
        () => {
            let newPrincipalDialog = new NewPrincipalDialog();
            let userBrowsePanel = new UserBrowsePanel();
            return userBrowsePanel.clickOnNewButton().then(() => {
                return newPrincipalDialog.waitForDialogLoaded();
            }).then(() => {
                testUtils.saveScreenshot("new_principal_dialog_loaded");
                return newPrincipalDialog.clickOnCancelButtonTop();
            }).then(() => {
                return expect(newPrincipalDialog.waitForDialogClosed()).to.eventually.be.true;
            })
        });

    it(`GIVEN users grid is opened WHEN 'New' button has been clicked THEN modal dialog should appear with 4 items`,
        () => {
            let newPrincipalDialog = new NewPrincipalDialog();
            let userBrowsePanel = new UserBrowsePanel();
            return userBrowsePanel.clickOnNewButton().then(() => {
                return newPrincipalDialog.waitForDialogLoaded();
            }).then(() => {
                return newPrincipalDialog.getHeaderText();
            }).then(result => {
                assert.equal(result, 'Create New', 'Correct header should be displayed');
            }).then(() => {
                return newPrincipalDialog.isCancelButtonDisplayed()
            }).then(result => {
                assert.isTrue(result, '`Cancel` button should be present');
            }).then(() => {
                return newPrincipalDialog.getNumberOfItems();
            }).then(() => {
                return newPrincipalDialog.getItemNames()
            }).then(items => {
                assert.equal(items[0], appConst.USER, '`User` item should be present on the dialog');
                assert.equal(items[1], appConst.USER_GROUP, '`User Group` item should be present on the dialog');
                assert.equal(items[2], appConst.ID_PROVIDER, '`Id Provider` item should be present on the dialog');
                assert.equal(items[3], appConst.ROLE, '`Role` item should be present');
                assert.equal(items.length, ITEMS_NUMBER, '4 items to select should be present on the dialog');
            })
        });

    it(`GIVEN 'System store' is selected WHEN 'New' button has been clicked THEN modal dialog should appear with 2 items`,
        () => {
            let userBrowsePanel = new UserBrowsePanel();
            let newPrincipalDialog = new NewPrincipalDialog();
            return userBrowsePanel.clickOnRowByName('/system').then(() => {
                return userBrowsePanel.clickOnNewButton()
            }).then(() => {
                return newPrincipalDialog.waitForDialogLoaded();
            }).then(() => {
                testUtils.saveScreenshot("new_principal_dialog_2_items");
                return newPrincipalDialog.getItemNames()
            }).then(items => {
                assert.equal(items[0], appConst.USER, '`User` item should be present on the dialog');
                assert.equal(items[1], appConst.USER_GROUP, '`User Group` item should be present on the dialog');
            })
        });

    it(`GIVEN 'Roles' folder is selected WHEN 'New' button has been clicked THEN Role Wizard should be loaded`,
        () => {
            let userBrowsePanel = new UserBrowsePanel();
            return userBrowsePanel.clickOnRowByName('roles').then(() => {
                return userBrowsePanel.clickOnNewButton();
            }).then(() => {
                let roleWizard = new RoleWizard();
                //Role Wizard should be loaded
                return roleWizard.waitForLoaded();
            });
        });

    beforeEach(() => {
        return testUtils.navigateToUsersApp();
    });
    afterEach(() => {
        return testUtils.doCloseUsersApp();
    });
    before(() => {
        return console.log('specification starting: ' + this.title);
    })
});

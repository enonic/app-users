/**
 * Created on 05.09.2017.
 */
const chai = require('chai');
chai.Should();
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const userBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const appConst = require('../libs/app_const');
const testUtils = require('../libs/test.utils');
const roleWizard = require('../page_objects/wizardpanel/role.wizard');
const newPrincipalDialog = require('../page_objects/browsepanel/new.principal.dialog');

describe('New Principal dialog specification', function () {
    this.timeout(70000);
    webDriverHelper.setupBrowser();
    let ITEMS_NUMBER = 4;

    it('GIVEN `NewPrincipal` dialog is opened WHEN `Cancel` button(top) has been pressed  THEN the dialog should be closed',
        () => {
            return userBrowsePanel.clickOnNewButton().then(()=> {
                return newPrincipalDialog.waitForOpened();
            }).then(()=> {
                return newPrincipalDialog.clickOnCancelButtonTop();
            }).then(()=> {
                return expect(newPrincipalDialog.waitForClosed()).to.eventually.be.true;
            })
        });

    it(`GIVEN users grid is opened WHEN 'New' button has been clicked THEN modal dialog should appear with 4 items`,
        () => {
            return userBrowsePanel.clickOnNewButton().then(()=> {
                return newPrincipalDialog.waitForOpened();
            }).then(()=> {
                return newPrincipalDialog.getHeaderText();
            }).then(result=> {
                assert.equal(result, 'Create New', 'Correct header should be displayed');
            }).waitForVisible(newPrincipalDialog.cancelButton).then(result=> {
                assert.isTrue(result, '`Cancel` button should be present');
            }).then(()=> {
                return newPrincipalDialog.getNumberOfItems()
                then(result=> {
                    assert.equal(result, ITEMS_NUMBER, '`User` item should be present on the dialog');
                })
            }).then(()=> {
                return newPrincipalDialog.getItemNames()
            }).then((items)=> {
                assert.equal(items[0], appConst.USER, '`User` item should be present on the dialog');
                assert.equal(items[1], appConst.USER_GROUP, '`User Group` item should be present on the dialog');
                assert.equal(items[2], appConst.USER_STORE, '`User Store` item should be present on the dialog');
                assert.equal(items[3], appConst.ROLE, '`Role` item should be present');
            })
        });

    it(`GIVEN 'System store' is selected WHEN 'New' button has been clicked THEN modal dialog should appear with 2 items`,
        () => {
            return userBrowsePanel.clickOnRowByName('/system').waitForEnabled(userBrowsePanel.newButton).then(()=> {
                return userBrowsePanel.clickOnNewButton()
            }).then(()=> {
                return newPrincipalDialog.waitForOpened();
            }).waitForVisible(newPrincipalDialog.header).then(result=> {
                assert.isTrue(result, 'description input should be present');
            }).then(()=> {
                return newPrincipalDialog.getItemNames()
            }).then((items)=> {
                assert.equal(items[0], appConst.USER, '`User` item should be present on the dialog');
                assert.equal(items[1], appConst.USER_GROUP, '`User Group` item should be present on the dialog');
            })
        });

    it(`GIVEN 'Roles' folder is selected WHEN 'New' button has been clicked THEN Role Wizard should be loaded`,
        () => {
            return userBrowsePanel.clickOnRowByName('roles').waitForEnabled(userBrowsePanel.newButton).then(()=> {
                return userBrowsePanel.clickOnNewButton()
            }).then(()=> {
                return roleWizard.waitForOpened();
            }).waitForVisible(roleWizard.descriptionInput).then(result=> {
                assert.isTrue(result, 'Role Wizard should be loaded');
            })
        });

    beforeEach(() => {
        return testUtils.navigateToUsersApp();
    });
    afterEach(() => {
        return testUtils.doCloseUsersApp();
    });
    before(()=> {
        return console.log('specification starting: ' + this.title);
    })
});

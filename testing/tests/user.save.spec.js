/**
 * Created on 28.09.2017.
 */

const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const userWizard = require('../page_objects/wizardpanel/user.wizard');
const userBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const saveBeforeCloseDialog = require('../page_objects/save.before.close.dialog');

describe('Save User spec - save an user', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();
    let testUser;

    //verifies  https://github.com/enonic/lib-admin-ui/issues/614
    //User Wizard - confirmation about unsaved changes after changes were saved
    it('GIVEN new user has been saved in wizard AND display name has been changed AND Save button pressed WHEN `close` icon clicked THEN `Save before close dialog` should not appear',
        () => {
            let userName = userItemsBuilder.generateRandomName('user');
            testUser = userItemsBuilder.buildUser(userName, '1q2w3e', userItemsBuilder.generateEmail(userName), null);
            return testUtils.clickOnSystemOpenUserWizard().then(() => {
                return userWizard.typeData(testUser);
            }).then(() => {
                return userWizard.waitAndClickOnSave();
            }).then(() => {
                return userWizard.typeDisplayName(userName + "123");
            }).then(()=>{
                return userWizard.waitAndClickOnSave();
            }).then(() => {
                return userBrowsePanel.doClickOnCloseTabButton(userName + "123");
            }).pause(1000).then(() => {
                return saveBeforeCloseDialog.isDialogPresent();
            }).then(result => {
                assert.isFalse(result, "Save before dialog should not be present, because all changes were saved");
            })
        });


    it('GIVEN `User` wizard is opened AND valid data is typed WHEN the user has been saved THEN correct notification message should appear AND the user should be searchable',
        () => {
            let userName = userItemsBuilder.generateRandomName('user');
            testUser = userItemsBuilder.buildUser(userName, '1q2w3e', userItemsBuilder.generateEmail(userName), null);
            return testUtils.clickOnSystemOpenUserWizard().then(() => {
                return userWizard.typeData(testUser);
            }).then(() => {
                return userWizard.waitAndClickOnSave();
            }).then(() => {
                return userWizard.waitForNotificationMessage();
            }).then(message => {
                expect(message).to.equal(appConst.USER_WAS_CREATED_MESSAGE);
            }).then(() => {
                return userBrowsePanel.clickOnAppHomeButton();
            }).then(() => {
                return testUtils.typeNameInFilterPanel(userName);
            }).then(() => {
                return expect(userBrowsePanel.isItemDisplayed(userName)).to.eventually.be.true;
            })
        });

    it('WHEN user has been saved in the wizard AND the wizard closed AND Users folder has been expanded THEN grid should be updated AND the user should be listed',
        () => {
            let userName = userItemsBuilder.generateRandomName('user');
            testUser = userItemsBuilder.buildUser(userName, '1q2w3e', userItemsBuilder.generateEmail(userName), null);
            return testUtils.clickOnSystemOpenUserWizard().then(() => {
                return userWizard.typeData(testUser);
            }).then(() => {
                return userWizard.waitAndClickOnSave();
            }).then(() => {
                return userBrowsePanel.doClickOnCloseTabAndWaitGrid(userName);
            }).then(() => {
                return userBrowsePanel.clickOnExpanderIcon("system");
            }).pause(500).then(() => {
                return userBrowsePanel.clickOnExpanderIcon("users");
            }).then(() => {
                return expect(userBrowsePanel.isItemDisplayed(userName)).to.eventually.be.true;
            })
        });

    it('WHEN try to save user with name that already in use THEN correct notification message should appear',
        () => {
            testUser.email = userItemsBuilder.generateEmail('test');
            return testUtils.clickOnSystemOpenUserWizard().then(() => {
                return userWizard.typeData(testUser);
            }).then(() => {
                return userWizard.waitAndClickOnSave();
            }).then(() => {
                return userWizard.waitForErrorNotificationMessage();
            }).then(actualMessage => {
                testUtils.saveScreenshot('user-already-exists-message');
                let expectedMessage = appConst.principalExistsMessage(testUser.displayName);
                expect(actualMessage).to.be.equal(expectedMessage);
            })
        });
    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});

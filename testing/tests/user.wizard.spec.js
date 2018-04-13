/**
 * Created on 24.10.2017.
 */

const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const userWizard = require('../page_objects/wizardpanel/user.wizard');
const changePasswordDialog = require('../page_objects/wizardpanel/change.password.dialog');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');

describe('User Wizard and Change Password dialog spec', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();
    let testUser;
    it('WHEN `User` wizard is opened  THEN red circle should be present, because required inputs are empty',
        () => {
            return testUtils.clickOnSystemOpenUserWizard().then(()=> {
                return userWizard.waitUntilInvalidIconAppears('<Unnamed User>');
            }).then((isRedIconPresent)=> {
                assert.isTrue(isRedIconPresent, 'red circle should be present on the tab, because required inputs are empty');
            })
        });

    it('WHEN `User` wizard is opened THEN all required inputs should be present on the page',
        () => {
            return testUtils.clickOnSystemOpenUserWizard().then(()=> {
                return assert.eventually.isTrue(userWizard.isDisplayNameInputVisible(), "Display name input should be displayed");
            }).then(()=> {
                return assert.eventually.isTrue(userWizard.isEmailInputDisplayed(), "E-mail name input should be displayed");
            }).then(()=> {
                testUtils.saveScreenshot('change_pass_button_should_not_be_displayed');
                return assert.eventually.isTrue(userWizard.isPasswordInputDisplayed(), "`Password` name input should be displayed");
            }).then(()=> {
                return assert.eventually.isTrue(userWizard.isGroupOptionsFilterInputDisplayed(),
                    "`Groups` selector should be displayed");
            }).then(()=> {
                return assert.eventually.isTrue(userWizard.isRoleOptionsFilterInputDisplayed(),
                    "`Roles` selector should be displayed");
            }).then(()=> {
                return assert.eventually.isFalse(userWizard.isChangePasswordButtonDisplayed(),
                    "`Change Password` button should not be displayed");
            })
        });

    it('GIVEN `User` wizard is opened WHEN name, e-mail, password have been typed THEN red circle should not be present on the tab',
        () => {
            let displayName = userItemsBuilder.generateRandomName('user');
            testUser =
                userItemsBuilder.buildUser(displayName, 'password', userItemsBuilder.generateEmail(displayName), null, null);
            return testUtils.clickOnSystemOpenUserWizard().then(()=> userWizard.typeData(testUser)).then(()=> {
                return userWizard.waitUntilInvalidIconDisappears(testUser.displayName);
            }).then((isRedIconNotPresent)=> {
                assert.isTrue(isRedIconNotPresent, 'red circle should not be present on the tab, because all required inputs are filled');
            }).then(()=> {
                return assert.eventually.isTrue(userWizard.waitForSaveButtonEnabled(), "`Save` button should be enabled");
            });
        });

    it('GIVEN name, e-mail, password have been typed WHEN `Save` button has been pressed THEN `Change Password` button should appear',
        () => {
            let displayName = userItemsBuilder.generateRandomName('user');
            testUser =
                userItemsBuilder.buildUser(displayName, 'password', userItemsBuilder.generateEmail(displayName), null, null);
            return testUtils.clickOnSystemOpenUserWizard().then(()=> userWizard.typeData(testUser)).then(()=> {
                return userWizard.waitAndClickOnSave();
            }).pause(400).then(()=> {
                return assert.eventually.isTrue(userWizard.isChangePasswordButtonDisplayed(), "`Change Password` button should appear");
            });
        });

    it('GIVEN  existing user is opened WHEN name input has been cleared THEN red circle should appears on the tab',
        () => {
            return testUtils.selectUserAndOpenWizard(testUser.displayName).then(()=> {
                return userWizard.clearDisplayNameInput();
            }).then(()=> {
                return userWizard.waitUntilInvalidIconAppears('<Unnamed User>');
            }).then((isRedIconPresent)=> {
                assert.isTrue(isRedIconPresent, 'red circle should appears on the tab, because display-name input has been cleared');
            }).then(()=> {
                return assert.eventually.isTrue(userWizard.waitForSaveButtonDisabled(), 'Save button should be disabled now');
            });
        });

    it('GIVEN existing user is opened WHEN `Change Password` button has been pressed THEN modal dialog should appear',
        () => {
            return testUtils.selectUserAndOpenWizard(testUser.displayName).then(()=> {
                return userWizard.clickOnChangePasswordButton();
            }).then(()=> {
                return changePasswordDialog.waitForDialogVisible(appConst.TIMEOUT_3);
            }).then(()=> {
                return changePasswordDialog.getUserPath();
            }).then(result=> {
                assert.isTrue(result[0].includes(testUser.displayName), 'Display name of the user should be present in the path');
            });
        });

    it('WHEN `Change Password Dialog` is opened THEN required elements should be present',
        () => {
            return testUtils.selectUserAndOpenWizard(testUser.displayName).then(()=> {
                return userWizard.clickOnChangePasswordButton();
            }).then(()=> {
                return changePasswordDialog.waitForDialogVisible(appConst.TIMEOUT_3);
            }).then(result=> {
                return assert.eventually.isTrue(changePasswordDialog.isPasswordInputDisplayed(), 'Password Input should be displayed');
            }).then(()=> {
                return assert.eventually.isTrue(changePasswordDialog.isGenerateLinkDisplayed(), 'Generate Link should be displayed');
            }).then(()=> {
                return assert.eventually.isTrue(changePasswordDialog.isShowLinkDisplayed(), 'Show Password Link should be displayed');
            })
        });

    it('WHEN `Change Password Dialog` is opened THEN `Show password` link has been clicked THEN `Hide` link should appear',
        () => {
            return testUtils.selectUserAndOpenWizard(testUser.displayName).then(()=> {
                return userWizard.clickOnChangePasswordButton();
            }).then(()=> {
                return changePasswordDialog.waitForDialogVisible(appConst.TIMEOUT_3);
            }).then(result=> {
                return changePasswordDialog.clickOnShowPasswordLink();
            }).then(()=> {
                return assert.eventually.isTrue(changePasswordDialog.isHideLinkDisplayed(), '`Hide` text in the link should appear');
            })
        });

    it('WHEN `Change Password Dialog` is opened THEN `Generate password`  link has been clicked THEN `password` string should appear',
        () => {
            return testUtils.selectUserAndOpenWizard(testUser.displayName).then(()=> {
                return userWizard.clickOnChangePasswordButton();
            }).then(()=> {
                return changePasswordDialog.waitForDialogVisible(appConst.TIMEOUT_3);
            }).then(result=> {
                return changePasswordDialog.clickOnGeneratePasswordLink();
            }).then(()=> {
                return changePasswordDialog.getPasswordString();
            }).then((password)=> {
                assert.isTrue(password.length > 0, 'password string should be present ');
            })
        });
    it('GIVEN `Change Password Dialog` is opened WHEN `Cancel` button has been clicked THEN the dialog should be closed',
        () => {
            return testUtils.selectUserAndOpenWizard(testUser.displayName).then(()=> {
                return userWizard.clickOnChangePasswordButton();
            }).then(()=> {
                return changePasswordDialog.waitForDialogVisible(1000);
            }).then(result=> {
                return changePasswordDialog.clickOnCancelButton();
            }).then(()=> {
                return expect(changePasswordDialog.waitForClosed()).to.eventually.be.true;
            })
        });

    it('GIVEN `Change Password Dialog` is opened WHEN `Cancel-top` button has been clicked THEN the dialog should be closed',
        () => {
            return testUtils.selectUserAndOpenWizard(testUser.displayName).then(()=> {
                return userWizard.clickOnChangePasswordButton();
            }).then(()=> {
                return changePasswordDialog.waitForDialogVisible(appConst.TIMEOUT_3);
            }).then(result=> {
                return changePasswordDialog.clickOnCancelButtonTop();
            }).then(()=> {
                return expect(changePasswordDialog.waitForClosed()).to.eventually.be.true;
            })
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(()=> {
        return console.log('specification starting: ' + this.title);
    });
});

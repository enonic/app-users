/**
 * Created on 25.09.2017.
 */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');

describe('User Wizard negative spec ', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();
    let testUser;

    it('GIVEN wizard for new User is opened WHEN name and e-mail has been typed  THEN red circle should be displayed on the wizard page',
        () => {
            let userWizard = new UserWizard();
            let userName = userItemsBuilder.generateRandomName('user');
            testUser = userItemsBuilder.buildUser(userName, '1q2w3e', userItemsBuilder.generateEmail(userName), null);
            return testUtils.clickOnSystemOpenUserWizard().then(() => {
                return userWizard.typeEmail(testUser.email);
            }).then(() => {
                return userWizard.typeDisplayName(testUser.displayName);
            }).then(() => {
                return userWizard.waitUntilInvalidIconAppears(testUser.displayName);
            }).then(isRedIconPresent => {
                assert.isTrue(isRedIconPresent, 'red circle should be present on the tab, because `password` is empty');
            })
        });

    it('GIVEN wizard for new User is opened WHEN all data has been typed THEN red circle should not be displayed on the wizard page',
        () => {
            let userWizard = new UserWizard();
            let userName = userItemsBuilder.generateRandomName('user');
            testUser = userItemsBuilder.buildUser(userName, '1q2w3e', userItemsBuilder.generateEmail(userName), null);
            return testUtils.clickOnSystemOpenUserWizard().then(() => {
                return userWizard.typeData(testUser);
            }).then(() => {
                return userWizard.waitUntilInvalidIconDisappears(testUser.displayName);
            }).then((isRedIconNotPresent) => {
                assert.isTrue(isRedIconNotPresent, 'red circle should not be present on the tab, because all required inputs are filled');
            })
        });

    it('GIVEN wizard for new User is opened AND all data has been typed WHEN password has been cleared THEN red circle should be displayed on the wizard page',
        () => {
            let userWizard = new UserWizard();
            let userName = userItemsBuilder.generateRandomName('user');
            testUser = userItemsBuilder.buildUser(userName, '1q2w3e', userItemsBuilder.generateEmail(userName), null);
            return testUtils.clickOnSystemOpenUserWizard().then(() => {
                return userWizard.typeData(testUser);
            }).then(() => {
                return userWizard.clearPasswordInput();
            }).then(() => {
                return userWizard.waitUntilInvalidIconAppears(testUser.displayName);
            }).then(isRedIconPresent => {
                assert.isTrue(isRedIconPresent, 'red circle should be present on the tab, because `password` input has been cleared');
            })
        });

    it('GIVEN wizard for new User is opened AND all data has been typed WHEN e-mail has been cleared THEN red circle should be displayed on the wizard page',
        () => {
            let userWizard = new UserWizard();
            let userName = userItemsBuilder.generateRandomName('user');
            testUser = userItemsBuilder.buildUser(userName, '1q2w3e', userItemsBuilder.generateEmail(userName), null);
            return testUtils.clickOnSystemOpenUserWizard().then(() => {
                return userWizard.typeData(testUser);
            }).then(() => {
                return userWizard.clearEmailInput();
            }).then(() => {
                return userWizard.waitUntilInvalidIconAppears(testUser.displayName);
            }).then(isRedIconPresent => {
                assert.isTrue(isRedIconPresent, 'red circle should be present on the tab, because `email` input has been cleared');
            })
        });

    it('GIVEN all data in the wizard has been typed WHEN e-mail is invalid THEN red circle should be displayed on the wizard page',
        () => {
            let userWizard = new UserWizard();
            let userName = userItemsBuilder.generateRandomName('user');
            testUser = userItemsBuilder.buildUser(userName, '1q2w3e', 'notvalid@@@mail.com', null);
            return testUtils.clickOnSystemOpenUserWizard().then(() => {
                return userWizard.typeData(testUser);
            }).then(() => {
                return userWizard.waitUntilInvalidIconAppears(testUser.displayName);
            }).then((result) => {
                assert.isTrue(result, 'red circle should be present on the tab, because `e-mail` is invalid');
            });
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});

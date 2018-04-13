/**
 * Created on 11.04.2018.
 * Verifies:
 *  xp-apps#617 Allow empty email for SU and Anonymous
 */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const assert = chai.assert;
const expect = chai.expect;
const webDriverHelper = require('../libs/WebDriverHelper');
const userWizard = require('../page_objects/wizardpanel/user.wizard');
const userBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const userStatisticsPanel = require('../page_objects/browsepanel/user.statistics.panel');

describe('`su and anonymous users spec`: empty email is allowed, validation lets empty email through when saving.', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();

    it('WHEN `su` is opened THEN email input should be hidden',
        () => {
            return testUtils.selectUserAndOpenWizard(appConst.SUPER_USER_NAME).then(()=> {
                return userWizard.isEmailInputDisplayed();
            }).then((result)=> {
                assert.isFalse(result, 'email-input should not be present');
            }).then(()=> {
                return userWizard.isItemInvalid(appConst.SUPER_USER_DISPLAY_NAME);
            }).then((isInvalid)=> {
                assert.isFalse(isInvalid, 'red icon should not be displayed on the wizard');
            }).then(()=> {
                return userWizard.waitForSaveButtonEnabled();
            }).then(isEnabled=> {
                assert.isTrue(isEnabled, 'Save button should be enabled');
            }).then(()=> {
                return userWizard.isDeleteButtonEnabled();
            }).then(isEnabled=> {
                assert.isFalse(isEnabled, 'Delete button should be disabled');
            })
        });

    it('WHEN `anonymous` is opened THEN email input should be hidden',
        () => {
            return testUtils.selectUserAndOpenWizard(appConst.ANONYMOUS_USER_NAME).then(()=> {
                return userWizard.isEmailInputDisplayed();
            }).then((result)=> {
                assert.isFalse(result, 'email-input should not be present');
            }).then(()=> {
                return userWizard.isItemInvalid(appConst.ANONYMOUS_USER_DISPLAY_NAME);
            }).then((isInvalid)=> {
                assert.isFalse(isInvalid, 'red icon should not be displayed on the wizard');
            }).then(()=> {
                return userWizard.waitForSaveButtonEnabled();
            }).then(isEnabled=> {
                assert.isTrue(isEnabled, 'Save button should be enabled');
            }).then(()=> {
                return userWizard.isDeleteButtonEnabled();
            }).then(isEnabled=> {
                assert.isFalse(isEnabled, 'Delete button should be disabled');
            })
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(()=> {
        return console.log('specification starting: ' + this.title);
    });
});

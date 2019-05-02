/**
 * Created on 27/06/2017.
 * verifies xp-apps#547 (Don't allow deleting SU and Anonymous users)
 */
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');

describe('User Browse panel, toolbar spec', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();

    it(`WHEN 'su' user has been selected THEN Delete button should be disabled`, () => {
        let userBrowsePanel = new UserBrowsePanel();
        return testUtils.findAndSelectItem('su').then(() => {
            //`Delete button is getting disabled`
            return userBrowsePanel.waitForDeleteButtonDisabled();
        }).then(result => {
            //'Edit button should be enabled'
            return userBrowsePanel.waitForEditButtonEnabled();
        });
    });

    it(`WHEN 'anonymous' user has been selected THEN Delete button should be disabled`, () => {
        let userBrowsePanel = new UserBrowsePanel();
        return testUtils.findAndSelectItem('anonymous').then(() => {
            return userBrowsePanel.waitForDeleteButtonDisabled();
        }).then(result => {
            //'Edit button should be enabled'
            return userBrowsePanel.waitForEditButtonEnabled();
        });
    });

    it(`GIVEN 'user browse panel' is opened WHEN no any items are selected THEN all buttons should have correct states`, () => {
        let userBrowsePanel = new UserBrowsePanel();
        return userBrowsePanel.waitForNewButtonEnabled().then(() => {
            return userBrowsePanel.waitForDeleteButtonDisabled();
        }).then(() => {
            //Edit button should be disabled
            return userBrowsePanel.waitForEditButtonDisabled();
        });
    });

    it(`GIVEN 'user browse panel' is opened WHEN 'System Id Provider' has been selected THEN all buttons should have correct states`,
        () => {
            let userBrowsePanel = new UserBrowsePanel();
            return userBrowsePanel.clickOnRowByName('/system').then(() => {
                return userBrowsePanel.waitForNewButtonEnabled();
            }).then(() => {
                //'Delete' button should be disabled, because this is the 'System' Id provider!
                return userBrowsePanel.waitForDeleteButtonDisabled();
            }).then(() => {
                return userBrowsePanel.waitForEditButtonEnabled();
            });
        });

    it(`GIVEN 'user browse panel' is opened WHEN 'Roles' has been selected THEN all buttons should have correct states`, () => {
        let userBrowsePanel = new UserBrowsePanel();
        return userBrowsePanel.clickOnRowByName('roles').then(() => {
            return userBrowsePanel.waitForNewButtonEnabled();
        }).then(() => {
            //Delete button should be disabled
            return userBrowsePanel.waitForDeleteButtonDisabled();
        }).then(() => {
            //Edit button should be disabled
            return userBrowsePanel.waitForEditButtonDisabled();
        });
    });

    it(`GIVEN 'System Id Provider' is expanded WHEN 'Users' has been selected THEN all buttons should have correct states`, () => {
        let userBrowsePanel = new UserBrowsePanel();
        return userBrowsePanel.clickOnExpanderIcon('/system').then(() => {
            return userBrowsePanel.waitForFolderUsersVisible();
        }).then(() => {
            return userBrowsePanel.clickOnRowByName('users');
        }).then(() => {
            return userBrowsePanel.waitForNewButtonEnabled();
        }).then(() => {
            //Delete button should be disabled
            return userBrowsePanel.waitForDeleteButtonDisabled();
        }).then(() => {
            //Edit button should be disabled
            return userBrowsePanel.waitForEditButtonDisabled();
        })
    });

    it(`GIVEN 'System Id Provider' is expanded WHEN 'Groups' has been selected THEN all buttons should have correct states`, () => {
        let userBrowsePanel = new UserBrowsePanel();
        return userBrowsePanel.clickOnExpanderIcon('/system').then(() => {
            return userBrowsePanel.waitForFolderUsersVisible();
        }).then(() => {
            return userBrowsePanel.clickOnRowByName('groups');
        }).then(() => {
            return userBrowsePanel.waitForNewButtonEnabled();
        }).then(result => {
            //Delete button should be disabled
            return userBrowsePanel.waitForDeleteButtonDisabled();
        });
    });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});







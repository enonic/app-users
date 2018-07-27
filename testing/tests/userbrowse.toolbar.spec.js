/**
 * Created on 27/06/2017.
 * verifies xp-apps#547 (Don't allow deleting SU and Anonymous users)
 */
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const userBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const filterPanel = require('../page_objects/browsepanel/principal.filter.panel');

describe('User Browse panel, toolbar spec', function () {
    this.timeout(70000);
    webDriverHelper.setupBrowser();

    //verifies xp-apps#547
    it(`WHEN 'su' user is selected THEN Delete button should be disabled`, () => {
        return testUtils.findAndSelectItem('su').then(()=> {
            return userBrowsePanel.waitForDeleteButtonDisabled();
        }).then(result => {
            assert.isTrue(result, `Delete button is getting disabled`);
        }).isEnabled(userBrowsePanel.editButton).then(result => {
            assert.isTrue(result, 'Edit button should be enabled');
        });
    });

    it(`WHEN 'anonymous' user is selected THEN Delete button should be disabled`, () => {
        return testUtils.findAndSelectItem('anonymous').then(()=> {
            return userBrowsePanel.waitForDeleteButtonDisabled();
        }).then(result => {
            assert.isTrue(result, `Delete button is getting disabled`);
        }).isEnabled(userBrowsePanel.editButton).then(result => {
            assert.isTrue(result, 'Edit button should be enabled');
        });
    });

    it(`GIVEN 'user browse panel' is opened WHEN no any items are selected THEN all buttons should have correct states`, () => {
        return userBrowsePanel.waitForNewButtonEnabled().then(result => {
            assert.isTrue(result, `New button should be enabled`);
        }).isEnabled(userBrowsePanel.deleteButton).then(result=> {
            assert.isFalse(result, 'Delete button should be disabled');
        }).isEnabled(userBrowsePanel.editButton).then(result => {
            assert.isFalse(result, 'Edit button should be disabled');
        });
    });

    it(`GIVEN 'user browse panel' is opened WHEN 'System User Store' has been selected THEN all buttons should have correct states`, () => {
        return userBrowsePanel.clickOnRowByName('/system').waitForEnabled(userBrowsePanel.newButton).then(result=> {
            assert.isTrue(result, `'New' button should be enabled`);
        }).pause(1000).isEnabled(userBrowsePanel.deleteButton).then(result => {
            assert.isFalse(result, `'Delete' button should be disabled, because this is the 'System' user store!`);
        }).isEnabled(userBrowsePanel.editButton).then(function (result) {
            assert.isTrue(result, `'Edit' button should be enabled`);
        });
    });

    it(`GIVEN 'user browse panel' is opened WHEN 'Roles' has been selected THEN all buttons should have correct states`, () => {
        return userBrowsePanel.clickOnRowByName('roles').waitForEnabled(userBrowsePanel.newButton).then(result=> {
            assert.isTrue(result, `'New' button should be enabled`);
        }).pause(1000).isEnabled(userBrowsePanel.deleteButton).then(result => {
            assert.isFalse(result, `'Delete' button should be disabled, because 'Roles' folder can not be deleted!`);
        }).isEnabled(userBrowsePanel.editButton).then(function (result) {
            assert.isFalse(result, `'Edit' button should be disabled`);
        });
    });

    it(`GIVEN 'System User Store' is expanded WHEN 'Users' has been selected THEN all buttons should have correct states`, () => {
        return userBrowsePanel.clickOnExpanderIcon('/system').then(()=> {
            return userBrowsePanel.waitForFolderUsersVisible();
        }).then(()=> {
            return userBrowsePanel.clickOnRowByName('users');
        }).waitForEnabled(userBrowsePanel.newButton).then(result=> {
            assert.isTrue(result, `'New' button should be enabled`);
        }).pause(1000).isEnabled(userBrowsePanel.deleteButton).then(result => {
            assert.isFalse(result, `'Delete' button should be disabled, because 'Users' folder can not be deleted!`);
        }).isEnabled(userBrowsePanel.editButton).then(function (result) {
            assert.isFalse(result, `'Edit' button should be disabled`);
        });
    });

    it(`GIVEN 'System User Store' is expanded WHEN 'Groups' has been selected THEN all buttons should have correct states`, () => {
        return userBrowsePanel.clickOnExpanderIcon('/system').then(()=> {
            return userBrowsePanel.waitForFolderUsersVisible();
        }).then(()=> {
            return userBrowsePanel.clickOnRowByName('groups');
        }).waitForEnabled(userBrowsePanel.newButton).then(result=> {
            assert.isTrue(result, `'New' button should be enabled`);
        }).pause(1000).isEnabled(userBrowsePanel.deleteButton).then(result => {
            assert.isFalse(result, `'Delete' button should be disabled, because 'Groups' can not be deleted!`);
        }).isEnabled(userBrowsePanel.editButton).then(function (result) {
            assert.isFalse(result, `'Edit' button should be disabled`);
        });
    });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(()=> {
        return console.log('specification starting: ' + this.title);
    });
});







/**
 * Created on 29/06/2017.
 */
const chai = require('chai');
const should = require('chai').should;
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const userItemsBuilder = require('../libs/userItems.builder.js');
const userBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const userStoreWizard = require('../page_objects/wizardpanel/userstore.wizard');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');
const userWizard = require('../page_objects/wizardpanel/user.wizard');

describe('User Store spec - save and edit', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();
    let userStore;
    let testUser;

    it(`GIVEN 'User Store' wizard is opened WHEN name has been typed AND 'Save' button pressed THEN correct notification message should be displayed`,
        () => {
            userStore = userItemsBuilder.buildUserStore(userItemsBuilder.generateRandomName('store'), 'test user store');
            return testUtils.clickOnNewOpenUserStoreWizard().then(() => {
                return userStoreWizard.typeDisplayName(userStore.displayName);
            }).then(() => {
                return userStoreWizard.waitAndClickOnSave();
            }).then(() => {
                return userStoreWizard.waitForNotificationMessage();
            }).then(result => {
                assert.strictEqual(result, 'User store was created', 'correct notification message should be displayed');
            })
        });

    it(`GIVEN 'user store' wizard is opened WHEN the name that already in use has been typed THEN correct notification message should be present`,
        () => {
            return testUtils.clickOnNewOpenUserStoreWizard().then(() => userStoreWizard.waitForOpened())
                .then(() => userStoreWizard.typeDisplayName(userStore.displayName)).pause(400).then(() => {
                    return userStoreWizard.waitAndClickOnSave();
                }).then(() => {
                    return userStoreWizard.waitForErrorNotificationMessage();
                }).then(result => {
                    var msg = `User Store [` + userStore.displayName + `] could not be created. A User Store with that name already exists`;
                    assert.strictEqual(result, msg, 'expected notification message should be displayed');
                })
        });

    it(`GIVEN User Store wizard is opened WHEN data has been typed and 'Save' button pressed AND the wizard has been closed THEN new User Store should be listed`,
        () => {
            userStore = userItemsBuilder.buildUserStore(userItemsBuilder.generateRandomName('store'), 'test user store');
            return testUtils.openWizardAndSaveUserStore(userStore).then(() => {
                return userBrowsePanel.doClickOnCloseTabAndWaitGrid(userStore.displayName);
            }).pause(1000)
                .then(() => userBrowsePanel.isItemDisplayed(userStore.displayName)).then(result => {
                    assert.isTrue(result, 'new user store should be present in the grid');
                })
        });

    it(`GIVEN User Store wizard is opened WHEN data and permissions have been typed and 'Save' button pressed AND the wizard has been closed THEN 'Save Before' dialog should not be displayed`,
        () => {
            let permissions = ['Everyone', 'Users App'];
            let testStore =
                userItemsBuilder.buildUserStore(userItemsBuilder.generateRandomName('store'), 'test user store', null, permissions);
            return testUtils.clickOnNewOpenUserStoreWizard(testStore).then(() => {
                return userStoreWizard.typeData(testStore);
            }).then(() => {
                return userStoreWizard.waitAndClickOnSave();
            }).then(()=>{
                return userStoreWizard.waitForSpinnerNotVisible();
            }).pause(1000).then(() => {
                return userBrowsePanel.doClickOnCloseTabAndWaitGrid(testStore.displayName);
            }).then(() => userBrowsePanel.isItemDisplayed(testStore.displayName)).then(result => {
                assert.isTrue(result, 'new user store should be present in the grid');
            })
        });

    it(`GIVEN existing 'User Store' WHEN it has been selected and opened THEN correct description should be present`, () => {
        return userBrowsePanel.clickOnRowByName(userStore.displayName).then(() => {
            return userBrowsePanel.clickOnEditButton();
        }).then(() => {
            return userStoreWizard.waitForOpened();
        }).then(() => userStoreWizard.getDescription()).then(result => {
            assert.strictEqual(result, userStore.description, 'actual description and expected should be equals');
        })
    });

    it(`GIVEN existing 'User Store'(no any users) WHEN it has been selected THEN 'Delete' button should be enabled`, () => {
        return userBrowsePanel.clickOnRowByName(userStore.displayName).then(() => {
            return assert.eventually.equal(userBrowsePanel.waitForDeleteButtonEnabled(), true,
                "'Delete' button should be enabled, because of no any users were added in the store");
        }).then(() => {
            return assert.eventually.equal(userBrowsePanel.isNewButtonEnabled(), true, "'New' button should be enabled");
        }).then(() => {
            return assert.eventually.equal(userBrowsePanel.isEditButtonEnabled(), true, "'Edit' button should be enabled");
        });
    });

    it(`GIVEN existing 'User Store' has an user WHEN store has been selected THEN 'Delete' button should be disabled`, () => {
        let userName = userItemsBuilder.generateRandomName('user');
        testUser = userItemsBuilder.buildUser(userName, '1q2w3e', userItemsBuilder.generateEmail(userName));
        return testUtils.clickOnUserStoreAndOpenUserWizard(userStore.displayName).then(() => {
            return userWizard.typeData(testUser);
        }).then(() => {
            return testUtils.saveAndCloseWizard(testUser.displayName);
        }).then(() => {
            //Delete should be disabled, because of the store has an user
            return expect(userBrowsePanel.waitForDeleteButtonDisabled()).to.eventually.be.true;
        }).then(() => {
            return expect(userBrowsePanel.waitForEditButtonEnabled()).to.eventually.be.true;
        });
    });

    it(`GIVEN existing 'User Store' with an user WHEN the user has been deleted THEN the store can be deleted`, () => {
        return testUtils.selectAndDeleteItem(testUser.displayName).then(() => {
            return userBrowsePanel.waitForItemNotDisplayed(testUser.displayName);
        }).then(result => {
            assert.isTrue(result, 'the user should not be present in the grid');
        }).then(() => {
            return testUtils.selectAndDeleteItem(userStore.displayName)
        }).then(() => {
            return userBrowsePanel.waitForItemNotDisplayed(userStore.displayName)
        });
    });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});
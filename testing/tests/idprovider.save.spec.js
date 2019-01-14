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
const idProviderWizard = require('../page_objects/wizardpanel/idprovider.wizard');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');
const userWizard = require('../page_objects/wizardpanel/user.wizard');

describe('Id Provider spec - save and edit', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();
    let idProvider;
    let testUser;

    it(`GIVEN 'Id Provider' wizard is opened WHEN name has been typed AND 'Save' button pressed THEN correct notification message should be displayed`,
        () = > {
        idProvider = userItemsBuilder.buildIdProvider(userItemsBuilder.generateRandomName('store'), 'test Id provider');
    return testUtils.clickOnNewOpenIdProviderWizard().then(() = > {
        return idProviderWizard.typeDisplayName(idProvider.displayName);
            }).then(() => {
        return idProviderWizard.waitAndClickOnSave();
            }).then(() => {
        return idProviderWizard.waitForNotificationMessage();
            }).then(result => {
        assert.strictEqual(result, 'Id provider was created', 'correct notification message should be displayed');
            })
        });

    it(`GIVEN 'Id provider' wizard is opened WHEN the name that already in use has been typed THEN correct notification message should be present`,
        () = > {
        return testUtils.clickOnNewOpenIdProviderWizard().then(() = > idProviderWizard.waitForOpened()
)
.
    then(() = > idProviderWizard.typeDisplayName(idProvider.displayName)
).
    pause(400).then(() = > {
        return idProviderWizard.waitAndClickOnSave();
                }).then(() => {
        return idProviderWizard.waitForErrorNotificationMessage();
                }).then(result => {
        var msg = `Id Provider [` + idProvider.displayName + `] could not be created. A Id Provider with that name already exists`;
                    assert.strictEqual(result, msg, 'expected notification message should be displayed');
                })
        });

    it(`GIVEN Id Provider wizard is opened WHEN data has been typed and 'Save' button pressed AND the wizard has been closed THEN new Id Provider should be listed`,
        () = > {
        idProvider = userItemsBuilder.buildIdProvider(userItemsBuilder.generateRandomName('store'), 'test Id provider');
    return testUtils.openWizardAndSaveIdProvider(idProvider).then(() = > {
        return userBrowsePanel.doClickOnCloseTabAndWaitGrid(idProvider.displayName);
            }).pause(1000)
                   .then(() = > userBrowsePanel.isItemDisplayed(idProvider.displayName)
).
    then(result = > {
        assert.isTrue(result, 'new Id provider should be present in the grid');
                })
        });

    it(`GIVEN Id Provider wizard is opened WHEN data and permissions have been typed and 'Save' button pressed AND the wizard has been closed THEN 'Save Before' dialog should not be displayed`,
        () = > {
            let permissions = ['Everyone', 'Users App'];
            let testStore =
                userItemsBuilder.buildIdProvider(userItemsBuilder.generateRandomName('store'), 'test Id provider', null, permissions);
    return testUtils.clickOnNewOpenIdProviderWizard(testStore).then(() = > {
        return idProviderWizard.typeData(testStore);
            }).then(() => {
        return idProviderWizard.waitAndClickOnSave();
            }).then(()=>{
        return idProviderWizard.waitForSpinnerNotVisible();
            }).pause(1500).then(() => {
                return userBrowsePanel.doClickOnCloseTabAndWaitGrid(testStore.displayName);
            }).then(() => userBrowsePanel.isItemDisplayed(testStore.displayName)).then(result => {
        assert.isTrue(result, 'new Id provider should be present in the grid');
            })
        });

    it(`GIVEN existing 'Id Provider' WHEN it has been selected and opened THEN correct description should be present`, () = > {
        return userBrowsePanel.clickOnRowByName(idProvider.displayName).then(() = > {
            return userBrowsePanel.clickOnEditButton();
        }).then(() => {
        return idProviderWizard.waitForOpened();
}).
    then(() = > idProviderWizard.getDescription()
).
    then(result = > {
        assert.strictEqual(result, idProvider.description, 'actual description and expected should be equals');
        })
    });

    it(`GIVEN existing 'Id Provider'(no any users) WHEN it has been selected THEN 'Delete' button should be enabled`, () = > {
        return userBrowsePanel.clickOnRowByName(idProvider.displayName).then(() = > {
            return assert.eventually.equal(userBrowsePanel.waitForDeleteButtonEnabled(), true,
                "'Delete' button should be enabled, because of no any users were added in the store");
        }).then(() => {
            return assert.eventually.equal(userBrowsePanel.isNewButtonEnabled(), true, "'New' button should be enabled");
        }).then(() => {
            return assert.eventually.equal(userBrowsePanel.isEditButtonEnabled(), true, "'Edit' button should be enabled");
        });
    });

    it(`GIVEN existing 'Id Provider' has an user WHEN store has been selected THEN 'Delete' button should be disabled`, () = > {
        let userName = userItemsBuilder.generateRandomName('user');
        testUser = userItemsBuilder.buildUser(userName, '1q2w3e', userItemsBuilder.generateEmail(userName));
    return testUtils.clickOnIdProviderAndOpenUserWizard(idProvider.displayName).then(() = > {
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

    it(`GIVEN existing 'Id Provider' with an user WHEN the user has been deleted THEN the store can be deleted`, () = > {
        return testUtils.selectAndDeleteItem(testUser.displayName).then(() => {
            return userBrowsePanel.waitForItemNotDisplayed(testUser.displayName);
        }).then(result => {
            assert.isTrue(result, 'the user should not be present in the grid');
        }).then(() => {
        return testUtils.selectAndDeleteItem(idProvider.displayName)
        }).then(() => {
        return userBrowsePanel.waitForItemNotDisplayed(idProvider.displayName)
        });
    });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});
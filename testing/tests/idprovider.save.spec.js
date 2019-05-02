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
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const IdProviderWizard = require('../page_objects/wizardpanel/idprovider.wizard');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const NewPrincipalDialog = require('../page_objects/browsepanel/new.principal.dialog');

describe('Id Provider specification - save and edit a provider', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();
    let idProvider;
    let testUser;

    it(`GIVEN wizard for new 'Id Provider' is opened WHEN name has been typed AND 'Save' button pressed THEN expected notification message should be displayed`,
        () => {
            let idProviderWizard = new IdProviderWizard();
            idProvider = userItemsBuilder.buildIdProvider(userItemsBuilder.generateRandomName('provider'), 'test Id provider');
            return testUtils.openIdProviderWizard().then(() => {
                return idProviderWizard.typeDisplayName(idProvider.displayName);
            }).then(() => {
                return idProviderWizard.waitAndClickOnSave();
            }).then(() => {
                return idProviderWizard.waitForNotificationMessage();
            }).then(result => {
                assert.strictEqual(result, appConst.PROVIDER_CREATED_NOTIFICATION, 'expected notification message should be displayed');
            })
        });

    it(`GIVEN existing several providers WHEN New button has been pressed THEN 2 row-expander should be present in the dialog`,
        () => {
            let userBrowsePanel = new UserBrowsePanel();
            let newPrincipalDialog = new NewPrincipalDialog();
            return userBrowsePanel.clickOnNewButton().then(() => {
                return newPrincipalDialog.waitForDialogLoaded();
            }).then(() => {
                return newPrincipalDialog.waitForExpanderIconDisplayed("User Group");
            }).then(result => {
                assert.isTrue(result, "Expander for User Group should be displayed");
            }).then(() => {
                return newPrincipalDialog.waitForExpanderIconDisplayed("User");
            }).then(result => {
                assert.isTrue(result, "Expander for User should be displayed");
            })
        });

    it(`GIVEN existing several providers AND New button has been pressed WHEN expander has been clicked THEN expected provider's name should appear`,
        () => {
            let userBrowsePanel = new UserBrowsePanel();
            let newPrincipalDialog = new NewPrincipalDialog();
            return userBrowsePanel.clickOnNewButton().then(() => {
                return newPrincipalDialog.waitForDialogLoaded();
            }).then(() => {
                return newPrincipalDialog.clickOnExpanderIcon("User Group");
            }).then(() => {
                testUtils.saveScreenshot('User_Group_row_expanded');
                return newPrincipalDialog.waitForProviderNameDisplayed(idProvider.displayName);
            })
        });

    it(`GIVEN 'Id provider' wizard is opened WHEN the name that already in use has been typed THEN correct notification message should be present`,
        () => {
            let idProviderWizard = new IdProviderWizard();
            return testUtils.openIdProviderWizard().then(() => {
                return idProviderWizard.waitForOpened();
            }).then(() => idProviderWizard.typeDisplayName(idProvider.displayName)
            ).then(() => {
                return idProviderWizard.waitAndClickOnSave();
            }).then(() => {
                return idProviderWizard.waitForErrorNotificationMessage();
            }).then(result => {
                let msg = `Id Provider [` + idProvider.displayName + `] could not be created. A Id Provider with that name already exists`;
                assert.strictEqual(result, msg, 'expected notification message should be displayed');
            }).then(() => {
                //verifies issue#189 - (Endless spinner when saving the Id Provider)
                return idProviderWizard.waitForSpinnerNotVisible();
            })
        });

    it(`GIVEN wizard for new Id Provider is opened WHEN data has been typed and 'Save' button pressed AND the wizard has been closed THEN new Id Provider should be listed`,
        () => {
            let userBrowsePanel = new UserBrowsePanel();
            idProvider = userItemsBuilder.buildIdProvider(userItemsBuilder.generateRandomName('provider'), 'test Id provider');
            return testUtils.openWizardAndSaveIdProvider(idProvider).then(() => {
                return userBrowsePanel.doClickOnCloseTabAndWaitGrid(idProvider.displayName);
            }).then(() => {
                return userBrowsePanel.pause(1000);
            }).then(() => {
                return userBrowsePanel.isItemDisplayed(idProvider.displayName);
            }).then(result => {
                assert.isTrue(result, 'new Id provider should be present in the grid');
            })
        });

    it(`GIVEN wizard for new Id Provider is opened WHEN data and permissions have been typed and 'Save' button pressed AND the wizard has been closed THEN 'Save Before' dialog should not be displayed`,
        () => {
            let idProviderWizard = new IdProviderWizard();
            let permissions = ['Everyone', 'Users App'];
            let userBrowsePanel = new UserBrowsePanel();
            let name = userItemsBuilder.generateRandomName('provider');
            let testProvider = userItemsBuilder.buildIdProvider(name, 'test Id provider', null, permissions);
            return testUtils.openIdProviderWizard(testProvider).then(() => {
                return idProviderWizard.typeData(testProvider);
            }).then(() => {
                return idProviderWizard.waitAndClickOnSave();
            }).then(() => {
                return idProviderWizard.waitForSpinnerNotVisible();
            }).then(() => {
                return idProviderWizard.pause(1500);
            }).then(() => {
                return userBrowsePanel.doClickOnCloseTabAndWaitGrid(testProvider.displayName);
            }).then(() => userBrowsePanel.isItemDisplayed(testProvider.displayName)).then(result => {
                assert.isTrue(result, 'new Id provider should be present in the grid');
            })
        });

    it(`WHEN existing 'Id Provider' has been opened THEN expected description should be present`, () => {
        let idProviderWizard = new IdProviderWizard();
        let userBrowsePanel = new UserBrowsePanel();
        return userBrowsePanel.clickOnRowByName(idProvider.displayName).then(() => {
            return userBrowsePanel.clickOnEditButton();
        }).then(() => {
            return idProviderWizard.waitForOpened();
        }).then(() => idProviderWizard.getDescription()
        ).then(result => {
            assert.strictEqual(result, idProvider.description, 'actual description and expected should be equals');
        })
    });

    it(`GIVEN existing 'Id Provider'(no any users) WHEN it has been selected THEN 'Delete' button should be enabled`, () => {
        let userBrowsePanel = new UserBrowsePanel();
        return userBrowsePanel.clickOnRowByName(idProvider.displayName).then(() => {
            return assert.eventually.equal(userBrowsePanel.waitForDeleteButtonEnabled(), true,
                "'Delete' button should be enabled, because of no any users were added in the store");
        }).then(() => {
            return assert.eventually.equal(userBrowsePanel.waitForNewButtonEnabled(), true, "'New' button should be enabled");
        }).then(() => {
            return assert.eventually.equal(userBrowsePanel.isEditButtonEnabled(), true, "'Edit' button should be enabled");
        });
    });

    it(`GIVEN existing 'Id Provider' has an user WHEN the provider has been selected THEN 'Delete' button should be disabled`, () => {
        let userName = userItemsBuilder.generateRandomName('user');
        let userWizard = new UserWizard();
        let userBrowsePanel = new UserBrowsePanel();
        testUser = userItemsBuilder.buildUser(userName, '1q2w3e', userItemsBuilder.generateEmail(userName));
        return testUtils.clickOnIdProviderAndOpenUserWizard(idProvider.displayName).then(() => {
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

    it(`GIVEN existing 'Id Provider' with an user WHEN the user has been deleted THEN the store can be deleted`, () => {
        let userBrowsePanel = new UserBrowsePanel();
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
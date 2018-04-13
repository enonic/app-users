/**
 * Created on 5/30/2017.
 * verifies the xp-apps#201 (options not filtered, when the name of ID provider has been typed)
 * https://github.com/enonic/xp-apps/issues/201
 */
const chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;
const assert = chai.assert;
var webDriverHelper = require('../libs/WebDriverHelper');
var userStoreWizard = require('../page_objects/wizardpanel/userstore.wizard');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');

describe('User Store wizard - validation and inputs', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();

    it('WHEN `UserStore` wizard is opened THEN red circle should be present, because required inputs are empty',
        () => {
            return testUtils.clickOnNewOpenUserStoreWizard().then(()=> {
                return userStoreWizard.waitUntilInvalidIconAppears('<Unnamed User Store>');
            }).then((isRedIconPresent)=> {
                assert.isTrue(isRedIconPresent, 'red circle should be present on the tab, because required inputs are empty');
            })
        });
    it('WHEN `New` button has been pressed AND `User Store` item selected THEN `User Store Wizard` should be opened with all required inputs',
        () => {
            return testUtils.clickOnNewOpenUserStoreWizard().then(()=> {
                return assert.eventually.isTrue(userStoreWizard.isDisplayNameInputVisible(), '`display name` input should be present');
            }).then(result=> {
                return assert.eventually.isTrue(userStoreWizard.isDescriptionInputDisplayed(), 'description input should be present');
            }).then(()=> {
                return assert.eventually.isTrue(userStoreWizard.waitForSaveButtonDisabled(), "`Save` button should be disabled");
            }).then(()=> {
                return assert.eventually.isTrue(userStoreWizard.isProviderOptionsFilterInputDisplayed(),
                    "`Provider Options Filter` input should be present");
            }).then(()=> {
                return assert.eventually.isTrue(userStoreWizard.isProviderOptionsFilterInputDisplayed(),
                    "`Permissions Options Filter` input should be present");
            })
        });
    //verifies the xp-apps#201
    it('GIVEN `User Store` wizard is opened WHEN `Standard ID Provider` has been selected THEN `Provider Options Filter` input should not be displayed',
        () => {
            return testUtils.clickOnNewOpenUserStoreWizard().then(()=> {
                return userStoreWizard.filterOptionsAndSelectIdProvider(appConst.STANDARD_ID_PROVIDER);
            }).then(()=> {
                return assert.eventually.isFalse(userStoreWizard.isProviderOptionsFilterInputDisplayed(),
                    "`Provider Options Filter` input should not be displayed");
            });
        });

    it('GIVEN wizard is opened and `Standard ID Provider` is selected WHEN the provider has been removed THEN `Provider Options Filter` input should be displayed',
        () => {
            return testUtils.clickOnNewOpenUserStoreWizard().then(()=> {
                return userStoreWizard.filterOptionsAndSelectIdProvider(appConst.STANDARD_ID_PROVIDER);
            }).then(()=> {
                return userStoreWizard.removeProvider();
            }).then(()=> {
                return assert.eventually.isTrue(userStoreWizard.isProviderOptionsFilterInputDisplayed(),
                    "`Provider Options Filter` input should be displayed");
            });
        });

    it('WHEN new `User Store Wizard` is opened  THEN three default roles should be present',
        () => {
            return testUtils.clickOnNewOpenUserStoreWizard().then(()=> {
                return userStoreWizard.clickOnPermissionsTabItem();
            }).then(()=> {
                return userStoreWizard.getPermissions();
            }).then(result=> {
                expect(result.length).to.equal(3);
                expect(result[0]).to.equal(appConst.roles.AUTHENTICATED);
                expect(result[1]).to.equal(appConst.roles.ADMINISTRATOR);
                expect(result[2]).to.equal(appConst.roles.USERS_ADMINISTRATOR);
            })
        });
    it('GIVEN `User Store Wizard` is opened WHEN `Everyone` role has been selected THEN `Permissions Options Filter` input should be displayed',
        () => {
            return testUtils.clickOnNewOpenUserStoreWizard().then(()=> {
                return userStoreWizard.filterOptionsAndSelectPermission('Everyone');
            }).then(()=> {
                return assert.eventually.isTrue(userStoreWizard.isPermissionsOptionsFilterInputDisplayed(),
                    "`Permissions Options Filter` input should not be displayed");
            }).then(()=> {
                return userStoreWizard.getPermissions();
            }).then(result=> {
                expect(result[0]).to.equal(appConst.roles.AUTHENTICATED);
                expect(result[1]).to.equal(appConst.roles.ADMINISTRATOR);
                expect(result[2]).to.equal(appConst.roles.USERS_ADMINISTRATOR);
                expect(result[3]).to.equal(appConst.roles.EVERYONE);
            })
        });

    it('GIVEN `User Store Wizard` is opened WHEN name has been typed THEN red icon should not be present on the page',
        () => {
            return testUtils.clickOnNewOpenUserStoreWizard().then(()=> {
                return userStoreWizard.typeDisplayName('test');
            }).then(()=> {
                return userStoreWizard.waitUntilInvalidIconDisappears('test');
            }).then((isRedIconNotPresent)=> {
                assert.isTrue(isRedIconNotPresent, 'red circle should not be present on the tab, because `name` has been typed');
            }).then(()=> {
                return assert.eventually.isTrue(userStoreWizard.waitForSaveButtonEnabled(), "`Save` button should be enabled");
            });
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(()=> {
        return console.log('specification starting: ' + this.title);
    });
});




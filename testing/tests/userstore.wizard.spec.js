/**
 * Created on 5/30/2017.
 * verifies the xp-apps#201 (options not filtered, when the name of ID provider has been typed)
 * https://github.com/enonic/xp-apps/issues/201
 */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const idProviderWizard = require('../page_objects/wizardpanel/userstore.wizard');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');

describe('Id Provider wizard - validation and inputs', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();

    it('WHEN `IdProvider` wizard is opened THEN red circle should be present, because required inputs are empty',
        () = > {
        return testUtils.clickOnNewOpenIdProviderWizard().then(() = > {
            return idProviderWizard.waitUntilInvalidIconAppears('<Unnamed Id Provider>');
            }).then((isRedIconPresent) => {
                assert.isTrue(isRedIconPresent, 'red circle should be present on the tab, because required inputs are empty');
            })
        });
    it('WHEN `New` button has been pressed AND `Id Provider` item selected THEN `Id Provider Wizard` should be opened with all required inputs',
        () = > {
        return testUtils.clickOnNewOpenIdProviderWizard().then(() = > {
            return assert.eventually.isTrue(idProviderWizard.isDisplayNameInputVisible(), '`display name` input should be present');
            }).then(result => {
        return assert.eventually.isTrue(idProviderWizard.isDescriptionInputDisplayed(), 'description input should be present');
            }).then(() => {
        return assert.eventually.isTrue(idProviderWizard.waitForSaveButtonDisabled(), "`Save` button should be disabled");
            }).then(() => {
        return assert.eventually.isTrue(idProviderWizard.isProviderOptionsFilterInputDisplayed(),
                    "`Provider Options Filter` input should be present");
            }).then(() => {
        return assert.eventually.isTrue(idProviderWizard.isProviderOptionsFilterInputDisplayed(),
                    "`Permissions Options Filter` input should be present");
            })
        });
    //verifies the xp-apps#201
    it('GIVEN `Id Provider` wizard is opened WHEN `Standard ID Provider` has been selected THEN `Provider Options Filter` input should not be displayed',
        () = > {
        return testUtils.clickOnNewOpenIdProviderWizard().then(() = > {
            return idProviderWizard.filterOptionsAndSelectIdProvider(appConst.STANDARD_ID_PROVIDER);
            }).then(() => {
        return assert.eventually.isFalse(idProviderWizard.isProviderOptionsFilterInputDisplayed(),
                    "`Provider Options Filter` input should not be displayed");
            });
        });

    it('GIVEN wizard is opened and `Standard ID Provider` is selected WHEN the provider has been removed THEN `Provider Options Filter` input should be displayed',
        () => {
        return testUtils.clickOnNewOpenIdProviderWizard().then(() = > {
            return idProviderWizard.filterOptionsAndSelectIdProvider(appConst.STANDARD_ID_PROVIDER);
            }).then(() => {
        return idProviderWizard.removeProvider();
            }).then(() => {
        return assert.eventually.isTrue(idProviderWizard.isProviderOptionsFilterInputDisplayed(),
                    "`Provider Options Filter` input should be displayed");
            });
        });

    it('WHEN new `Id Provider Wizard` is opened  THEN three default roles should be present',
        () = > {
        return testUtils.clickOnNewOpenIdProviderWizard().then(() = > {
            return idProviderWizard.clickOnPermissionsTabItem();
            }).then(() => {
        return idProviderWizard.getPermissions();
            }).then(result => {
                expect(result.length).to.equal(3);
                expect(result[0]).to.equal(appConst.roles.AUTHENTICATED);
                expect(result[1]).to.equal(appConst.roles.ADMINISTRATOR);
                expect(result[2]).to.equal(appConst.roles.USERS_ADMINISTRATOR);
            })
        });
    it('GIVEN `Id Provider Wizard` is opened WHEN `Everyone` role has been selected THEN `Permissions Options Filter` input should be displayed',
        () = > {
        return testUtils.clickOnNewOpenIdProviderWizard().then(() = > {
            return idProviderWizard.filterOptionsAndSelectPermission('Everyone');
            }).then(() => {
        return assert.eventually.isTrue(idProviderWizard.isPermissionsOptionsFilterInputDisplayed(),
                    "`Permissions Options Filter` input should not be displayed");
            }).then(() => {
        return idProviderWizard.getPermissions();
            }).then(result => {
                expect(result[0]).to.equal(appConst.roles.AUTHENTICATED);
                expect(result[1]).to.equal(appConst.roles.ADMINISTRATOR);
                expect(result[2]).to.equal(appConst.roles.USERS_ADMINISTRATOR);
                expect(result[3]).to.equal(appConst.roles.EVERYONE);
            })
        });

    it('GIVEN `Id Provider Wizard` is opened WHEN name has been typed THEN red icon should not be present on the page',
        () = > {
        return testUtils.clickOnNewOpenIdProviderWizard().then(() = > {
            return idProviderWizard.typeDisplayName('test');
            }).then(() => {
        return idProviderWizard.waitUntilInvalidIconDisappears('test');
            }).then((isRedIconNotPresent) => {
                assert.isTrue(isRedIconNotPresent, 'red circle should not be present on the tab, because `name` has been typed');
            }).then(() => {
        return assert.eventually.isTrue(idProviderWizard.waitForSaveButtonEnabled(), "`Save` button should be enabled");
            });
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});




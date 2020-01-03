/**
 * Created on 16.03.2018.
 */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const IdProviderWizard = require('../page_objects/wizardpanel/idprovider.wizard');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const SaveBeforeCloseDialog = require('../page_objects/save.before.close.dialog');

describe("Id Provider and Save Before Close dialog", function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();

    //Id Provider wizard - Confirmation about unsaved changes when no changes were made #689
    it("GIVEN wizard for new Id Provider is opened WHEN no data has been typed AND 'close' icon pressed THEN SaveBeforeClose dialog must not appear",
        () => {
            let userBrowsePanel = new UserBrowsePanel();
            let saveBeforeCloseDialog = new SaveBeforeCloseDialog();
            return testUtils.openIdProviderWizard().then(() => {
                return userBrowsePanel.doClickOnCloseTabButton("<Unnamed Id Provider>");
            }).then(() => {
                return userBrowsePanel.pause(400);
            }).then(() => {
                //there are no unsaved changes, so dialog should not be present.
                return assert.eventually.isFalse(saveBeforeCloseDialog.isDialogLoaded(), "'Save before close' dialog must not be present");
            })
        });

    it("GIVEN `IdProvider` wizard is opened WHEN description has been typed AND `close` icon pressed THEN SaveBeforeClose dialog should appear",
        () => {
            let idProviderWizard = new IdProviderWizard();
            let userBrowsePanel = new UserBrowsePanel();
            return testUtils.openIdProviderWizard().then(() => {
                return idProviderWizard.typeDescription('description');
            }).then(() => {
                return userBrowsePanel.doClickOnCloseTabButton("<Unnamed Id Provider>");
            }).then(() => {
                return userBrowsePanel.pause(400);
            }).then(() => {
                let saveBeforeCloseDialog = new SaveBeforeCloseDialog();
                //description has been typed, so save before close dialog should appear!
                return assert.eventually.isTrue(saveBeforeCloseDialog.isDialogLoaded(), "'Save before close' dialog should appear");
            })
        });

    it("GIVEN Id Provider wizard is opened AND name and idProvider have been typed WHEN 'close' icon has been pressed THEN 'Save Before Close' dialog should appear",
        () => {
            let idProviderWizard = new IdProviderWizard();
            let name = userItemsBuilder.generateRandomName('provider');
            let userBrowsePanel = new UserBrowsePanel();
            let testStore = userItemsBuilder.buildIdProvider(name, 'test Id provider', 'First Selenium App', null);
            return testUtils.openIdProviderWizard(testStore).then(() => {
                return idProviderWizard.typeData(testStore);
            }).then(() => {
                testUtils.saveScreenshot("application_should_be_selected");
                return userBrowsePanel.doClickOnCloseTabButton(testStore.displayName);
            }).then(()=>{
                return userBrowsePanel.pause(400);
            }).then(() => {
                let saveBeforeCloseDialog = new SaveBeforeCloseDialog();
                //name has been typed, so save before close dialog should appear!
                return assert.eventually.isTrue(saveBeforeCloseDialog.isDialogLoaded(), "'Save before close' dialog should appear");
            })
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});


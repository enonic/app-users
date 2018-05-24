/**
 * Created on 22.01.2018.
 * verifies: xp-apps#371 GroupWizard - SaveBeforeClose dialog appears in saved group
 */

const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const userBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const groupWizard = require('../page_objects/wizardpanel/group.wizard');
const saveBeforeCloseDialog = require('../page_objects/save.before.close.dialog');

describe('group.greate.with.role Create a Group with a just created new Role', function () {
    this.timeout(70000);
    webDriverHelper.setupBrowser();
    let testRole;


    it('WHEN `Role` with a description has been saved THEN the role should be searchable',
        () => {
            testRole =
                userItemsBuilder.buildRole(userItemsBuilder.generateRandomName('role'), 'description');
            return testUtils.openWizardAndSaveRole(testRole).then(()=> {
                return testUtils.typeNameInFilterPanel(testRole.displayName)
            }).then(()=> {
                return expect(userBrowsePanel.isItemDisplayed(testRole.displayName)).to.eventually.be.true;
            })
        });
    //verifies: xp-apps#371 GroupWizard - SaveBeforeClose dialog appears in saved group
    it('GIVEN group-wizard is opened AND name has been typed and new created role selected WHEN `Save` button has been pressed and `Close tab` has been clicked THEN `Save before close` dialog should not appear',
        () => {
            let testGroup =
                userItemsBuilder.buildGroup(userItemsBuilder.generateRandomName('group'), 'description', null, [testRole.displayName]);
            return testUtils.clickOnSystemAndOpenGroupWizard().then(()=> {
                return groupWizard.typeData(testGroup);
            }).then(()=> {
                return groupWizard.waitAndClickOnSave();
            }).pause(1000).then(()=> {
                return userBrowsePanel.doClickOnCloseTabButton(testGroup.displayName);
            }).pause(400).then(()=> {
                return assert.eventually.isFalse(saveBeforeCloseDialog.isDialogPresent(),
                    "`Save before close` dialog should not be present");
            })
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(()=> {
        return console.log('specification starting: ' + this.title);
    });
});
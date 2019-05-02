/**
 * Created on 15.03.2019.
 */

const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const RoleWizard = require('../page_objects/wizardpanel/role.wizard');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const FilterPanel = require('../page_objects/browsepanel/principal.filter.panel');

describe('Role - save a role and check the number in aggregations', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();
    let testRole;

    //verifies https://github.com/enonic/app-users/issues/214
    //Filter panel is not updated when the grid is filtered by role  and a new role is added
    it('GIVEN Filter Panel Is opened AND Roles checkbox is checked WHEN new role has been created THEN number of roles on the Filter panel should be increased',
        () => {
            let roleName = userItemsBuilder.generateRandomName('role');
            let initialNumber;
            let filterPanel = new FilterPanel();
            let roleWizard = new RoleWizard();
            let userBrowsePanel = new UserBrowsePanel();
            return testUtils.openFilterPanel().then(() => {
                //Click on Role-checkbox
                return filterPanel.clickOnRoleAggregation();
            }).then(() => {
                return filterPanel.getNumberAggregatedRoles();
            }).then(result => {
                initialNumber = result;
            }).then(() => {
                //Open wizard for new Role
                return testUtils.clickOnRolesFolderAndOpenWizard();
            }).then(() => {
                return roleWizard.typeDisplayName(roleName);
            }).then(() => {
                //save the role
                return roleWizard.waitAndClickOnSave();
            }).then(() => {
                return roleWizard.pause(1000);
            }).then(() => {
                // go to the grid
                return userBrowsePanel.clickOnAppHomeButton();
            }).then(() => {
                return filterPanel.getNumberAggregatedRoles();
            }).then(result => {
                assert.isTrue(result - initialNumber == 1, "Number of roles in Filter panel should be increased ")
            });
        });


    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});

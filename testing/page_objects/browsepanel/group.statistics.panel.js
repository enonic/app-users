/**
 * Created on 09.10.2017.
 */
const UserItemStatisticsPanel = require('./userItem.statistics.panel');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');

const XPATH = {
    container: "//div[contains(@id,'UserItemStatisticsPanel')]",
    membersDataGroup: "//div[contains(@id,'MembersListing') and child::h2[contains(.,'Members')]]",
    rolesAndGroupDataGroup: "//div[contains(@id,'ItemDataGroup') and child::h2[text()='Roles & Groups']]",
    memberList: "//div[contains(@id,'MembersListing') and child::h2[contains(.,'Members')]]//ul[@class='data-list']",
    roleList: "//div[contains(@id,'ItemDataGroup') and child::h2[text()='Roles & Groups']]//ul[@class='data-list' and child::li[text()='Roles']]",
    groupList: "//div[contains(@id,'ItemDataGroup') and child::h2[text()='Roles & Groups']]//ul[@class='data-list' and child::li[text()='Groups']]",
    transitiveCheckBox: "//div[contains(@id,'ItemDataGroup') and child::h2[text()='Roles & Groups']]//div[contains(@id,'Checkbox' ) and contains(@class,'transitive-switch')]"
};

class GroupStatisticsPanel extends UserItemStatisticsPanel {

    get transitiveCheckBox() {
        return XPATH.container + XPATH.transitiveCheckBox;
    }

    async clickOnTransitiveCheckBox() {
        try {
            await this.waitForElementDisplayed(this.transitiveCheckBox, appConst.mediumTimeout);
            await this.clickOnElement(this.transitiveCheckBox);
            return await this.pause(200);
        } catch (err) {
            await this.handleError('Group Statistics panel -  Transitive checkbox', 'err_transitive_checkbox',err);
        }
    }

    async getDisplayNameOfMembers() {
        let items = XPATH.container + XPATH.memberList + lib.H6_DISPLAY_NAME;
        try {
            await this.waitForElementDisplayed(XPATH.membersDataGroup, 1000);
            return await this.getTextInElements(items);
        } catch (err) {
            await this.handleError('Members data-group is not present on the page!','err_member_list', err);
        }
    }

    async getDisplayNameOfRoles() {
        try {
            let itemsLocator = XPATH.container + XPATH.roleList + lib.H6_DISPLAY_NAME;
            await this.waitForElementDisplayed(XPATH.rolesAndGroupDataGroup, appConst.mediumTimeout);
            return await this.getTextInElements(itemsLocator);
        } catch (err) {
            await this.handleError('Roles data-group is not present on the page!','err_role_list', err);
        }
    }

    async getDisplayNamesInGroupList() {
        try {
            let groupsList = XPATH.container + XPATH.groupList + lib.H6_DISPLAY_NAME;
            await this.waitForElementDisplayed(XPATH.rolesAndGroupDataGroup, 1000);
            return await this.getTextInElements(groupsList);
        } catch (err) {
            await this.handleError('Groups data-group is not present on the page!','err_group_list', err);
        }
    }

    // wait for Groups is not displayed in Roles & Groups section
    async waitForGroupListNotDisplayed() {
        try {
            let groupsList = XPATH.container + XPATH.groupList ;
            await this.waitForElementNotDisplayed(groupsList, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError('Groups list should not be displayed  Roles & Groups section!','err_group_list', err);
        }
    }
}

module.exports = GroupStatisticsPanel;

/**
 * Created on 09.10.2017.
 */
const UserItemStatisticsPanel = require('./userItem.statistics.panel');
const lib = require('../../libs/elements');

const XPATH = {
    container: "//div[contains(@id,'UserItemStatisticsPanel')]",
    membersDataGroup: "//div[contains(@id,'ItemDataGroup') and child::h2[text()='Members']]",
    rolesAndGroupDataGroup: "//div[contains(@id,'ItemDataGroup') and child::h2[text()='Roles & Groups']]",
    memberList: "//div[contains(@id,'ItemDataGroup') and child::h2[text()='Members']]//ul[@class='data-list']",
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
            await this.waitForElementDisplayed(this.transitiveCheckBox, 2000);
            await this.clickOnElement(this.transitiveCheckBox);
            return await this.pause(500);
        } catch (err) {
            this.saveScreenshot("err_transitive_checkbox");
            throw new Error("Error when clicking on Transitive checkbox  " + err);
        }
    }

    async getDisplayNameOfMembers() {
        let items = XPATH.container + XPATH.memberList + lib.H6_DISPLAY_NAME;
        try {
            await this.waitForElementDisplayed(XPATH.membersDataGroup, 1000);
            return await this.getTextInElements(items);
        } catch (err) {
            this.saveScreenshot('err_member_list');
            throw new Error('Members data-group is not present on the page!');
        }
    }

    async getDisplayNameOfRoles() {
        let items = XPATH.container + XPATH.roleList + lib.H6_DISPLAY_NAME;
        await this.waitForElementDisplayed(XPATH.rolesAndGroupDataGroup, 2000);
        return await this.getTextInElements(items);
    }

    async getDisplayNamesInGroupList() {
        try {
            let groupsList = XPATH.container + XPATH.groupList + lib.H6_DISPLAY_NAME;
            await this.waitForElementDisplayed(XPATH.rolesAndGroupDataGroup, 1000);
            return await this.getTextInElements(groupsList);
        } catch (err) {
            throw new Error("Unable to get group names in Statistics Panel:")
        }
    }
}
module.exports = GroupStatisticsPanel;

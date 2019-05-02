/**
 * Created on 09.10.2017.
 */
const UserItemStatisticsPanel = require('./userItem.statistics.panel');
const lib = require('../../libs/elements');

const XPATH = {
    container: `//div[contains(@id,'UserItemStatisticsPanel')]`,
    membersDataGroup: `//div[contains(@id,'ItemDataGroup') and child::h2[text()='Members']]`,
    rolesAndGroupDataGroup: `//div[contains(@id,'ItemDataGroup') and child::h2[text()='Roles & Groups']]`,
    memberList: `//div[contains(@id,'ItemDataGroup') and child::h2[text()='Members']]//ul[@class='data-list']`,
    roleList: `//div[contains(@id,'ItemDataGroup') and child::h2[text()='Roles & Groups']]//ul[@class='data-list' and child::li[text()='Roles']]`,
    groupList: `//div[contains(@id,'ItemDataGroup') and child::h2[text()='Roles & Groups']]//ul[@class='data-list' and child::li[text()='Groups']]`,
    transitiveCheckBox: `//div[contains(@id,'ItemDataGroup') and child::h2[text()='Roles & Groups']]//div[contains(@id,'api.ui.Checkbox' ) and contains(@class,'transitive-switch')]`
};
class GroupStatisticsPanel extends UserItemStatisticsPanel {

    get transitiveCheckBox() {
        return XPATH.container + XPATH.transitiveCheckBox;
    }

    clickOnTransitiveCheckBox() {
        return this.waitForElementDisplayed(this.transitiveCheckBox, 2000).catch(err => {
            this.saveScreenshot("err_transitive_checkbox");
            throw new Error("Transitive checkbox is not visible" + err);
        }).then(() => {
            return this.clickOnElement(this.transitiveCheckBox);
        }).then(() => {
            return this.pause(500);
        })
    }

    getDisplayNameOfMembers() {
        let items = XPATH.container + XPATH.memberList + lib.H6_DISPLAY_NAME;
        return this.waitForElementDisplayed(XPATH.membersDataGroup, 1000).catch((err) => {
            this.saveScreenshot('err_member_list');
            throw new Error('Members data-group is not present on the page!');
        }).then(() => {
            return this.getTextInElements(items);
        })
    }

    getDisplayNameOfRoles() {
        let items = XPATH.container + XPATH.roleList + lib.H6_DISPLAY_NAME;
        return this.waitForElementDisplayed(XPATH.rolesAndGroupDataGroup, 1000).then((result) => {
            if (!result) {
                throw new Error('Roles data-group is not present on the page!');
            }
        }).then(() => {
            return this.getTextInElements(items)
        })
    }
};
module.exports = GroupStatisticsPanel;

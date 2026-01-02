/**
 * Created on 04.10.2017.
 */
const UserItemStatisticsPanel = require('./userItem.statistics.panel');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');

const XPATH = {
    container: "//div[contains(@id,'UserItemStatisticsPanel')]",
    rolesAndGroupDataGroup: "//div[contains(@id,'ItemDataGroup') and child::h2[text()='Roles & Groups']]",
    roleList: "//ul[@class='data-list' and child::li[text()='Roles']]",
    email: "//ul[@class='data-list' and child::li[text()='Email']]//span",
};
class UserStatisticsPanel extends UserItemStatisticsPanel {

    get email() {
        return XPATH.container + XPATH.email;
    }

    getEmail() {
        return this.getTextInElements(this.email);
    }

    async getDisplayNameOfRoles() {
        try {
            let items = XPATH.container + XPATH.roleList + lib.H6_DISPLAY_NAME;
            await this.waitForElementDisplayed(XPATH.rolesAndGroupDataGroup, appConst.mediumTimeout)
            return await this.getTextInElements(items);
        } catch (err) {
            await this.handleError('User Statistics - Roles were not found!', 'err_user_roles', err);
        }
    }
}
module.exports = UserStatisticsPanel;




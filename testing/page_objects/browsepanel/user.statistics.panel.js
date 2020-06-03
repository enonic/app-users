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

    getDisplayNameOfRoles() {
        let items = XPATH.container + XPATH.roleList + lib.H6_DISPLAY_NAME;
        return this.waitForElementDisplayed(XPATH.rolesAndGroupDataGroup, appConst.TIMEOUT_2).catch(err => {
            this.saveScreenshot('err_user_statistic');
            throw new Error("Roles & Groups was not loaded!" + err);
        }).then(() => {
            return this.getTextInElements(items);
        })
    }
}
module.exports = UserStatisticsPanel;




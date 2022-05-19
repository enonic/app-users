/**
 * Created  on 06.10.2017.
 */
const ItemStatistic = require('./userItem.statistics.panel');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');

const XPATH = {
    div: "//div[contains(@id,'UserItemStatisticsPanel')]",
    header: "//div[contains(@id,'ItemStatisticsHeader')]",
    itemName: "//h1[@class='title']",
    itemPath: "//h4[@class='path']",
    membersDataGroup: "//div[contains(@id,'MembersListing') and child::h2[contains(.,'Members')]]",
    memberList: "//ul[@class='data-list' and child::li[text()='Members']]"
};

class RoleStatisticsPanel extends ItemStatistic {

    getDisplayNameOfMembers() {
        let items = XPATH.div + XPATH.memberList + lib.H6_DISPLAY_NAME;
        return this.waitForElementDisplayed(XPATH.membersDataGroup, 1000).catch(err => {
            this.saveScreenshot(appConst.generateRandomName('err_role_stat_members'));
            throw new Error('Members data-group was not in Role Statistic panel!' + err);
        }).then(() => {
            return this.getTextInElements(items);
        })
    }
}

module.exports = RoleStatisticsPanel;

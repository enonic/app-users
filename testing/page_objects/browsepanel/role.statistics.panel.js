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

    async getDisplayNameOfMembers() {
        try {
            let items = XPATH.div + XPATH.memberList + lib.H6_DISPLAY_NAME;
            await this.waitForElementDisplayed(XPATH.membersDataGroup, appConst.mediumTimeout);
            return await this.getTextInElements(items);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_role_stat_members');
            throw new Error('Members data-group was not in Role Statistic panel! screenshot: ' + screenshot + ' ' + err);
        }
    }
}

module.exports = RoleStatisticsPanel;

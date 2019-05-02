/**
 * Created  on 06.10.2017.
 */
const ItemStatistic = require('./userItem.statistics.panel');
const lib = require('../../libs/elements');

const XPATH = {
    div: `//div[contains(@id,'UserItemStatisticsPanel')]`,
    header: `//div[contains(@id,'ItemStatisticsHeader')]`,
    itemName: `//h1[@class='title']`,
    itemPath: `//h4[@class='path']`,
    membersDataGroup: `//div[contains(@id,'ItemDataGroup') and child::h2[text()='Members']]`,
    memberList: `//ul[@class='data-list' and child::li[text()='Members']]`
};
class RoleStatisticsPanel extends ItemStatistic {

    getDisplayNameOfMembers() {
        let items = XPATH.div + XPATH.memberList + lib.H6_DISPLAY_NAME;
        return this.waitForElementDisplayed(XPATH.membersDataGroup, 1000).catch(err => {
            this.saveScreenshot('err_role_statistic_members');
            throw new Error('Members data-group is not present on the page!');
        }).then(() => {
            return this.getTextInElements(items);
        })
    }
};
module.exports = RoleStatisticsPanel;
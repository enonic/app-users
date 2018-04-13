/**
 * Created  on 06.10.2017.
 */


const itemStatistic = require('./userItem.statistics.panel');
const elements = require('../../libs/elements');

var panel = {
    div: `//div[contains(@id,'UserItemStatisticsPanel')]`,
    header: `//div[contains(@id,'ItemStatisticsHeader')]`,
    itemName: `//h1[@class='title']`,
    itemPath: `//h4[@class='path']`,
    membersDataGroup: `//div[contains(@id,'ItemDataGroup') and child::h2[text()='Members']]`,
    memberList: `//ul[@class='data-list' and child::li[text()='Members']]`
}
var roleStatisticsPanel = Object.create(itemStatistic, {

    getDisplayNameOfMembers: {
        value: function () {
            let items = `${panel.div}` + `${panel.memberList}` + `${elements.H6_DISPLAY_NAME}`;
            return this.waitForVisible(`${panel.membersDataGroup}`, 1000).catch((err)=> {
                this.saveScreenshot('err_statistic_role');
                throw new Error('Members data-group is not present on the page!');
            }).then(()=> {
                return this.isVisible(items);
            }).then((result)=> {
                if (!result) {
                    return [];
                }
                return this.getTextFromElements(items)
            }).catch((err)=> {
                return [];
            })
        }
    },
});
module.exports = roleStatisticsPanel;

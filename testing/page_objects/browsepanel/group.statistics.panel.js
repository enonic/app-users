/**
 * Created on 09.10.2017.
 */


const itemStatistic = require('./userItem.statistics.panel');
const elements = require('../../libs/elements');

var panel = {
    div: `//div[contains(@id,'UserItemStatisticsPanel')]`,
    header: `//div[contains(@id,'ItemStatisticsHeader')]`,
    itemName: `//h1[@class='title']`,
    itemPath: `//h4[@class='path']`,
    membersDataGroup: `//div[contains(@id,'ItemDataGroup') and child::h2[text()='Members']]`,
    rolesDataGroup: `//div[contains(@id,'ItemDataGroup') and child::h2[text()='Roles']]`,
    memberList: `//div[contains(@id,'ItemDataGroup') and child::h2[text()='Members']]//ul[@class='data-list']`,
    roleList: `//div[contains(@id,'ItemDataGroup') and child::h2[text()='Roles']]//ul[@class='data-list']`
}
var groupStatisticsPanel = Object.create(itemStatistic, {

    getDisplayNameOfMembers: {
        value: function () {
            let items = `${panel.div}` + `${panel.memberList}` + `${elements.H6_DISPLAY_NAME}`;
            return this.waitForVisible(`${panel.membersDataGroup}`, 1000).catch((err)=> {
                this.saveScreenshot('err_member_list');
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
    getDisplayNameOfRoles: {
        value: function () {
            let items = `${panel.div}` + `${panel.roleList}` + `${elements.H6_DISPLAY_NAME}`;
            return this.waitForVisible(`${panel.rolesDataGroup}`, 1000).then((result)=> {
                if (!result) {
                    throw new Error('Roles data-group is not present on the page!');
                }
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
module.exports = groupStatisticsPanel;


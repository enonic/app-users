/**
 * Created on 09.10.2017.
 */
const itemStatistic = require('./userItem.statistics.panel');
const elements = require('../../libs/elements');

const panel = {
    div: `//div[contains(@id,'UserItemStatisticsPanel')]`,
    header: `//div[contains(@id,'ItemStatisticsHeader')]`,
    itemName: `//h1[@class='title']`,
    itemPath: `//h4[@class='path']`,
    membersDataGroup: `//div[contains(@id,'ItemDataGroup') and child::h2[text()='Members']]`,
    rolesAndGroupDataGroup: `//div[contains(@id,'ItemDataGroup') and child::h2[text()='Roles & Groups']]`,
    memberList: `//div[contains(@id,'ItemDataGroup') and child::h2[text()='Members']]//ul[@class='data-list']`,
    roleList: `//div[contains(@id,'ItemDataGroup') and child::h2[text()='Roles & Groups']]//ul[@class='data-list']`
};
const groupStatisticsPanel = Object.create(itemStatistic, {

    getDisplayNameOfMembers: {
        value: function () {
            let items = `${panel.div}` + `${panel.memberList}` + `${elements.H6_DISPLAY_NAME}`;
            return this.waitForVisible(`${panel.membersDataGroup}`, 1000).catch((err) => {
                this.saveScreenshot('err_member_list');
                throw new Error('Members data-group is not present on the page!');
            }).then(() => {
                return this.isVisible(items);
            }).then(result => {
                if (!result) {
                    return [];
                }
                return this.getTextFromElements(items)
            }).catch(err => {
                return [];
            })
        }
    },
    getDisplayNameOfRoles: {
        value: function () {
            let items = `${panel.div}` + `${panel.roleList}` + `${elements.H6_DISPLAY_NAME}`;
            return this.waitForVisible(`${panel.rolesAndGroupDataGroup}`, 1000).then((result) => {
                if (!result) {
                    throw new Error('Roles data-group is not present on the page!');
                }
            }).then(() => {
                return this.isVisible(items);
            }).then(result => {
                if (!result) {
                    return [];
                }
                return this.getTextFromElements(items)
            }).catch(err => {
                return [];
            })
        }
    },
});
module.exports = groupStatisticsPanel;

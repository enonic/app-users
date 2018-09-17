/**
 * Created on 04.10.2017.
 */

const itemStatistic = require('./userItem.statistics.panel');
const elements = require('../../libs/elements');
const appConst = require('../../libs/app_const')

const xpath = {
    div: `//div[contains(@id,'UserItemStatisticsPanel')]`,
    header: `//div[contains(@id,'ItemStatisticsHeader')]`,
    itemName: `//h1[@class='title']`,
    itemPath: `//h4[@class='path']`,
    rolesAndGroupDataGroup: `//div[contains(@id,'ItemDataGroup') and child::h2[text()='Roles & Groups']]`,
    reportDataGroup: `//div[contains(@id,'ItemDataGroup') and child::h2[text()='Report']]`,
    roleList: `//ul[@class='data-list' and child::li[text()='Roles']]`,
    email: `//ul[@class='data-list' and child::li[text()='Email']]//span`,
};
const userStatisticsPanel = Object.create(itemStatistic, {

    email: {
        get: function () {
            return `${xpath.div}` + `${xpath.email}`;
        }
    },

    getDisplayNameOfRoles: {
        value: function () {
            let items = `${xpath.div}` + `${xpath.roleList}` + `${elements.H6_DISPLAY_NAME}`;
            return this.waitForVisible(`${xpath.rolesAndGroupDataGroup}`, 1000).catch(err => {
                this.saveScreenshot('err_user_statistic');
                throw new Error('Roles & Groups was not loaded!');
            }).then(() => {
                return this.getTextFromElements(items)
            })
        }
    },
    getEmail: {
        value: function () {
            return this.getTextFromElements(this.email);
        }
    },
});
module.exports = userStatisticsPanel;




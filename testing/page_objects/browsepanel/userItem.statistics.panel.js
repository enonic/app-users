/**
 * Created on 20.09.2017.
 */

const page = require('../page');
const elements = require('../../libs/elements');

var panel = {
    div: `//div[contains(@id,'UserItemStatisticsPanel')]`,
    header: `//div[contains(@id,'ItemStatisticsHeader')]`,
    itemName: `//h1[@class='title']`,
    itemPath: `//h4[@class='path']`,
}
var userItemStatisticsPanel = Object.create(page, {

    getItemName: {
        value: function () {
            return this.waitForVisible(`${panel.div}` + `${panel.header}`, 1000).then(()=> {
                return this.getText(`${panel.div}` + `${panel.header}` + `${panel.itemName}`);
            }).catch((err)=> {
                this.saveScreenshot('err_statistic_item_name');
                throw new Error('Item name string was not found');
            })
        }
    },
    getItemPath: {
        value: function () {
            return this.waitForVisible(`${panel.div}` + `${panel.header}`, 1000).then(()=> {
                return this.getText(`${panel.div}` + `${panel.header}` + `${panel.itemPath}`);
            }).catch((err)=> {
                this.saveScreenshot('err_statistic_item_path');
                throw new Error('Item path string was not found');
            })

        }
    },
    waitForPanelVisible: {
        value: function (ms) {
            return this.waitForVisible(`${panel.div}`, ms).then(()=> {
                return this.waitForSpinnerNotVisible(3000);
            }).then(()=> {
                return console.log('user statistics panel is loaded')
            });
        }
    },
});
module.exports = userItemStatisticsPanel;




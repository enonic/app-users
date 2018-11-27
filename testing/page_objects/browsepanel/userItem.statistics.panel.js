/**
 * Created on 20.09.2017.
 */

const page = require('../page');
const elements = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const loaderComboBox = require('../inputs/loaderComboBox');

const panel = {
    div: `//div[contains(@id,'UserItemStatisticsPanel')]`,
    header: `//div[contains(@id,'ItemStatisticsHeader')]`,
    itemName: `//h1[@class='title']`,
    itemPath: `//h4[@class='path']`,
    reportDataGroup: `//div[contains(@id,'ItemDataGroup') and child::h2[text()='Report']]`,
    repoOptionsFilterInput: +`${loaderComboBox.optionsFilterInput}`,
    reportSelectedOptionsView: `//div[contains(@id,'ReportSelectedOptionsView')]`,
    generateButton: `//button[contains(@id,'Button') and child::span[text()='Generate report']]`,
    reportItem: `//ul[contains(@class,'data-list') and descendant::li[text()='Generated report(s)']]//li[contains(@id,'ReportProgressItem')]`,
    reportByTitle: function (title) {
        return `//li[contains(@id,'ReportProgressItem') and descendant::span[contains(.,'${title}')]]`
    },
    repositoryBranchOption: function (name) {
        return `//div[@class='slick-viewport']//div[contains(@class,'slick-cell') and child::div[contains(@id,'DefaultOptionDisplayValueViewer') and contains(.,'${name}')]]`
    },
};
const userItemStatisticsPanel = Object.create(page, {

    generateReportButton: {
        get: function () {
            return `${panel.div}` + panel.reportDataGroup + `${panel.generateButton}`;
        }
    },
    getItemName: {
        value: function () {
            return this.waitForVisible(`${panel.div}` + `${panel.header}`, appConst.TIMEOUT_1).then(() => {
                return this.getText(`${panel.div}` + `${panel.header}` + `${panel.itemName}`);
            }).catch(err => {
                this.saveScreenshot('err_statistic_item_name');
                throw new Error('Item name string was not found');
            })
        }
    },
    getItemPath: {
        value: function () {
            return this.waitForVisible(`${panel.div}` + `${panel.header}`, appConst.TIMEOUT_2).then(() => {
                return this.getText(`${panel.div}` + `${panel.header}` + `${panel.itemPath}`);
            }).catch((err) => {
                this.saveScreenshot('err_statistic_item_path');
                throw new Error('Item path string was not found');
            })

        }
    },
    waitForPanelVisible: {
        value: function () {
            return this.waitForVisible(`${panel.div}`, appConst.TIMEOUT_2).then(() => {
                return this.waitForSpinnerNotVisible();
            }).then(() => {
                return console.log('user statistics panel is loaded')
            });
        }
    },

    isReportDataGroupVisible: {
        value: function () {
            return this.isVisible(panel.reportDataGroup);
        }
    },
    waitForGenerateButtonEnabled: {
        value: function () {
            return this.waitForEnabled(this.generateReportButton, appConst.TIMEOUT_3).catch(err => {
                console.log('Generate Report Button : ' + err);
                return false;
            })
        }
    },

    clickOnGenerateReportButton: {
        value: function () {
            return this.doClick(this.generateReportButton).catch(err => {
                console.log('Click on Generate Report Button : ' + err);
                this.saveScreenshot("err_click_on_generate_report_button");
                throw new Error();
            })
        }
    },
    waitForGenerateButtonDisabled: {
        value: function () {
            return this.waitForDisabled(this.generateReportButton, appConst.TIMEOUT_3).catch(err => {
                console.log('Generate Report Button : ' + err);
                return false;
            })
        }
    },

    //clicks on required option in the comboBox and selects a repository for generating Permissions Report
    selectRepository: {
        value: function (name) {
            return loaderComboBox.typeTextAndSelectOption(name, panel.reportDataGroup);
        }
    },
    getReportTitles: {
        value: function () {
            return this.getText(panel.reportItem + `//span[@class='title']`).catch(err => {
                this.saveScreenshot('err_getting_text_report_item');
                throw new Error('Error when getting title of report item!' + err);
            }).then(result => {
                return [].concat(result);
            })
        }
    },
    getReportDate: {
        value: function (title) {
            return this.getText(panel.reportByTitle(title) + `//span[@class='timestamp']`).catch(err => {
                throw  new Error("Error when try to find report by title " + err);
            }).then(result => {
                return [].concat(result);
            })
        }
    },
    clickOnDeleteReportLink: {
        value: function (title) {
            let deleteLink = panel.reportByTitle(title) + `//a[contains(@class,'icon-report-delete')]`;
            return this.waitForVisible(deleteLink, appConst.TIMEOUT_1).catch(err => {
                this.saveScreenshot('err_report_not_found');
                throw new Error('Report was not found! ' + err);
            }).then(() => {
                return this.doClick(deleteLink);
            }).pause(400);
        }
    },
    getNumberOfReports: {
        value: function () {
            return this.numberOfElements(panel.reportItem);
        }
    },
    //Generate Report - clicks on dropDown handle and selects draft/master
    clickOnDropDownHandleAndSelectBranch: {
        value: function (optionName) {
            let dropDownHandle = panel.reportSelectedOptionsView + elements.DROP_DOWN_HANDLE;
            return this.waitForVisible(dropDownHandle).catch(err => {
                this.saveScreenshot('err_report_dropdown_handle');
                throw new Error('Report Selected Option, dropDown handle was not found!');
            }).then(() => {
                return this.doClick(dropDownHandle);
            }).then(() => {
                let optionSelector = panel.reportSelectedOptionsView + panel.repositoryBranchOption(optionName);
                return this.waitForVisible(optionSelector).catch(err => {
                    this.saveScreenshot('err_report_dropdown_options');
                    throw new Error('Report Selected Option was not found !' + optionName + "  " + err);
                }).then(() => {
                    return this.doClick(optionSelector);
                }).pause(300);
            })
        }
    }
});
module.exports = userItemStatisticsPanel;




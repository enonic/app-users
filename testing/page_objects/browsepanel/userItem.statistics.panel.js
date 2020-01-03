/**
 * Created on 20.09.2017.
 */
const Page = require('../page');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const LoaderComboBox = require('../inputs/loaderComboBox');

const XPATH = {
    container: "//div[contains(@id,'UserItemStatisticsPanel')]",
    header: "//div[contains(@id,'ItemStatisticsHeader')]",
    itemName: "//h1[@class='title']",
    itemPath: "//h4[@class='path']",
    reportDataGroup: "//div[contains(@id,'ItemDataGroup') and child::h2[text()='Report']]",
    reportSelectedOptionsView: "//div[contains(@id,'ReportSelectedOptionsView')]",
    reportSelectedOptionView: "//div[contains(@id,'ReportSelectedOptionView')]",
    generateButton: "//button[contains(@id,'Button') and child::span[text()='Generate report']]",
    reportItem: "//ul[contains(@class,'data-list') and descendant::li[text()='Generated report(s)']]//li[contains(@id,'ReportProgressItem')]",
    reportByTitle: function (title) {
        return `//li[contains(@id,'ReportProgressItem') and descendant::span[contains(.,'${title}')]]`
    },
    repositoryBranchOption: function (name) {
        return `//div[contains(@class,'slick-viewport')]//div[contains(@class,'slick-cell') and child::div[contains(@id,'DefaultOptionDisplayValueViewer') and contains(.,'${name}')]]`
    },
    selectedOptionByRepoName: function (name) {
        return `//div[contains(@id,'ReportSelectedOptionView') and descendant::h6[contains(@class,'main-name') and contains(.,'${name}')]]`
    }
};

class UserItemStatisticsPanel extends Page {

    get generateReportButton() {
        return XPATH.container + XPATH.reportDataGroup + XPATH.generateButton;
    }

    getItemName() {
        let itemName = XPATH.container + XPATH.header + XPATH.itemName;
        return this.waitForElementDisplayed(XPATH.container + XPATH.header, appConst.TIMEOUT_2).then(() => {
            return this.getText(itemName);
        }).catch(err => {
            this.saveScreenshot('err_statistic_item_name');
            throw new Error('Item name string was not found');
        })
    }

    getItemPath() {
        return this.waitForElementDisplayed(XPATH.container + XPATH.header, appConst.TIMEOUT_2).then(() => {
            return this.getText(XPATH.container + XPATH.header + XPATH.itemPath);
        }).catch(err => {
            this.saveScreenshot('err_statistic_item_path');
            throw new Error('Item path string was not found');
        })
    }

    waitForPanelLoaded() {
        return this.waitForElementDisplayed(XPATH.container, appConst.TIMEOUT_2).then(() => {
            return this.waitForSpinnerNotVisible();
        }).then(() => {
            return console.log('user statistics panel is loaded')
        });
    }

    isReportDataGroupVisible() {
        return this.isElementDisplayed(XPATH.reportDataGroup);
    }

    waitForGenerateButtonEnabled() {
        return this.waitForElementEnabled(this.generateReportButton, appConst.TIMEOUT_3).catch(err => {
            console.log('Generate Report Button : ' + err);
            return false;
        })
    }

    clickOnGenerateReportButton() {
        return this.clickOnElement(this.generateReportButton).catch(err => {
            console.log('Click on Generate Report Button : ' + err);
            this.saveScreenshot("err_click_on_generate_report_button");
            throw new Error(err);
        })
    }

    waitForGenerateButtonDisabled() {
        return this.waitForElementDisabled(this.generateReportButton, appConst.TIMEOUT_3).catch(err => {
            console.log('Generate Report Button : ' + err);
            return false;
        })
    }

//clicks on required option in the comboBox and selects a repository for generating Permissions Report
    selectRepository(name) {
        let loaderComboBox = new LoaderComboBox();
        return loaderComboBox.typeTextAndSelectOption(name, XPATH.reportDataGroup);
    }


    //clicks on dropDown handle and selects draft/master
    clickOnDropDownHandleAndSelectBranch(optionName) {
        let dropDownHandle = XPATH.reportSelectedOptionsView + lib.DROP_DOWN_HANDLE;
        return this.waitForElementDisplayed(dropDownHandle).catch(err => {
            this.saveScreenshot('err_report_dropdown_handle');
            throw new Error('Report Selected Option, dropDown handle was not found!');
        }).then(() => {
            return this.clickOnElement(dropDownHandle);
        }).then(() => {
            let optionSelector = XPATH.reportSelectedOptionsView + XPATH.repositoryBranchOption(optionName);
            return this.waitForElementDisplayed(optionSelector).catch(err => {
                this.saveScreenshot('err_report_dropdown_options');
                throw new Error('Report Selected Option was not found !' + optionName + "  " + err);
            }).then(() => {
                return this.clickOnElement(optionSelector);
            }).then(() => {
                return this.pause(400);
            });
        })
    }

    isOptionSelected(repoName) {
        let selector = XPATH.selectedOptionByRepoName(repoName);
        return this.waitForElementDisplayed(selector);
    }

    getBranchName(repoName) {
        let selector = XPATH.selectedOptionByRepoName(repoName) + "//div[@name='branch']//div[@class='viewer']";
        return this.getText(selector);
    }
};
module.exports = UserItemStatisticsPanel;
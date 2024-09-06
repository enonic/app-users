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

    async getItemName() {
        try {
            let itemName = XPATH.container + XPATH.header + XPATH.itemName;
            await this.waitForElementDisplayed(XPATH.container + XPATH.header, appConst.mediumTimeout);
            return await this.getText(itemName);
        } catch (err) {
            let screenshot = this.saveScreenshotUniqueName('err_statistic_item_name');
            throw new Error('Item name string was not found, screenshot: ' + screenshot + ' ' + err);
        }
    }

    async getItemPath() {
        try {
            await this.waitForElementDisplayed(XPATH.container + XPATH.header, appConst.mediumTimeout);
            return await this.getText(XPATH.container + XPATH.header + XPATH.itemPath);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_statistic_item_path');
            throw new Error('Item path string was not found. screenshot: ' + screenshot + ' ' + err);
        }
    }

    async waitForPanelLoaded() {
        await this.waitForElementDisplayed(XPATH.container, appConst.mediumTimeout);
        await this.waitForSpinnerNotVisible();
    }

    isReportDataGroupVisible() {
        return this.isElementDisplayed(XPATH.reportDataGroup);
    }

    async waitForGenerateButtonEnabled() {
        try {
            return await this.waitForElementEnabled(this.generateReportButton, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_generate_btn');
            throw new Error("Generate button is not enabled, screenshot " + screenshot + ' ' + err);
        }
    }

    async clickOnGenerateReportButton() {
        try {
            await this.clickOnElement(this.generateReportButton);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName("err_click_on_generate_report_button");
            throw new Error("Error generate report , screenshot" + screenshot + ' ' + err);
        }
    }

    waitForGenerateButtonDisabled() {
        return this.waitForElementDisabled(this.generateReportButton, appConst.mediumTimeout).catch(err => {
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
    async clickOnDropDownHandleAndSelectBranch(optionName) {
        let dropDownHandle = XPATH.reportSelectedOptionsView + lib.BUTTONS.DROP_DOWN_HANDLE;
        await this.waitForElementDisplayed(dropDownHandle, appConst.mediumTimeout);
        await this.clickOnElement(dropDownHandle);
        let optionSelector = XPATH.reportSelectedOptionsView + XPATH.repositoryBranchOption(optionName);
        await this.waitForElementDisplayed(optionSelector, appConst.mediumTimeout);
        await this.clickOnElement(optionSelector);
        return await this.pause(400);
    }

    isOptionSelected(repoName) {
        let selector = XPATH.selectedOptionByRepoName(repoName);
        return this.waitForElementDisplayed(selector, appConst.mediumTimeout);
    }

    getBranchName(repoName) {
        let selector = XPATH.selectedOptionByRepoName(repoName) + "//div[@name='branch']//div[@class='viewer']";
        return this.getText(selector);
    }
}

module.exports = UserItemStatisticsPanel;

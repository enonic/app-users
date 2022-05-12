/**
 * Created on 13.09.2018.
 */
const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');
const UserStatisticsPanel = require('../page_objects/browsepanel/user.statistics.panel');

describe('statistics.panel.permissions.report.spec: Generate Report specification ', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === "undefined") {
        webDriverHelper.setupBrowser();
    }

    it("GIVEN 'su' is selected WHEN repository is not selected in the statistic panel THEN 'Generate Report' button should be disabled",
        async () => {
            let userStatisticsPanel = new UserStatisticsPanel();
            await testUtils.findAndSelectItem('su');
            await testUtils.saveScreenshot('generate_report_button_is_disabled');
            let isDisabled = await userStatisticsPanel.waitForGenerateButtonDisabled();
            assert.isTrue(isDisabled, '`Generate Report` button should be disabled');
        });

    it("GIVEN 'su' is selected WHEN a repository has been selected in the statistic panel THEN 'Generate Report' button gets enabled",
        async () => {
            let userStatisticsPanel = new UserStatisticsPanel();
            await testUtils.findAndSelectItem('su');
            await userStatisticsPanel.selectRepository('com.enonic.cms.default');
            await testUtils.saveScreenshot('generate_report_button_getting_enabled');
            let result = await userStatisticsPanel.waitForGenerateButtonEnabled();
            assert.isTrue(result, '`Generate Report` button gets enabled');
        });

    it("GIVEN 'su' is selected WHEN 'default' repository and 'draft' branch have been selected THEN draft branch should be displayed AND 'remove' icon should appear",
        async () => {
            let userStatisticsPanel = new UserStatisticsPanel();
            await testUtils.findAndSelectItem('su');
            //1. Select a repository and a branch:
            await userStatisticsPanel.selectRepository('com.enonic.cms.default');
            await userStatisticsPanel.clickOnDropDownHandleAndSelectBranch('draft');

            //default repository and draft-branch should be selected:
            await userStatisticsPanel.isOptionSelected('com.enonic.cms.default');
            let branchName = await userStatisticsPanel.getBranchName('com.enonic.cms.default');
            assert.equal(branchName, "draft", "Expected branch should be displayed")
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(async () => {
        await testUtils.getBrowser().maximizeWindow();
        return console.log('specification starting: ' + this.title);
    });
});

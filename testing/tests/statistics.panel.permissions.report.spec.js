/**
 * Created on 13.09.2018.
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');
const UserStatisticsPanel = require('../page_objects/browsepanel/user.statistics.panel');

describe('statistics.panel.permissions.report.spec: Generate Report specification ', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    const TEST_REPOSITORY = 'com.enonic.cms.default';

    it("GIVEN 'su' is selected WHEN repository is not selected in the statistic panel THEN 'Generate Report' button should be disabled",
        async () => {
            let userStatisticsPanel = new UserStatisticsPanel();
            await testUtils.findAndSelectItem('su');
            await testUtils.saveScreenshot('generate_report_button_is_disabled');
            let isDisabled = await userStatisticsPanel.waitForGenerateButtonDisabled();
            assert.ok(isDisabled, "'Generate Report' button should be disabled");
        });

    it("GIVEN 'su' is selected WHEN a repository has been selected in the statistic panel THEN 'Generate Report' button gets enabled",
        async () => {
            let userStatisticsPanel = new UserStatisticsPanel();
            await testUtils.findAndSelectItem('su');
            await userStatisticsPanel.selectRepository('system-repo');
            await testUtils.saveScreenshot('generate_report_button_getting_enabled');
            // Verify that 'Generate' button is enabled:
            await userStatisticsPanel.waitForGenerateButtonEnabled();
        });

    it("GIVEN 'su' is selected WHEN existing repository and 'draft' branch have been selected THEN draft branch should be displayed AND 'remove' icon should appear",
        async () => {
            let userStatisticsPanel = new UserStatisticsPanel();
            await testUtils.findAndSelectItem('su');
            // 1. Select a repository :
            await userStatisticsPanel.selectRepository(TEST_REPOSITORY);
            // 2. Select draft branchL
            await userStatisticsPanel.selectBranch(TEST_REPOSITORY, 'draft');
            // 3. Verify that expected repository and draft-branch are displayed:
            await userStatisticsPanel.isOptionSelected(TEST_REPOSITORY);
            let branchName = await userStatisticsPanel.getBranchName(TEST_REPOSITORY);
            assert.equal(branchName, 'draft', "Expected branch should be displayed");
            await userStatisticsPanel.waitForRemoveRepoButtonDisplayed(TEST_REPOSITORY);
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(async () => {
        if (typeof browser !== 'undefined') {
            await testUtils.getBrowser().setWindowSize(appConst.BROWSER_WIDTH, appConst.BROWSER_HEIGHT);
        }
        return console.log('specification starting: ' + this.title);
    });
});

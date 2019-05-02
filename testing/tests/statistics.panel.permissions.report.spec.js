/**
 * Created on 13.09.2018.
 */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const assert = chai.assert;
const expect = chai.expect;
const webDriverHelper = require('../libs/WebDriverHelper');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');
const UserStatisticsPanel = require('../page_objects/browsepanel/user.statistics.panel');

describe('statistics.panel.permissions.report.spec: Generate Report data specification ', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();

    it('GIVEN `Super User` is selected WHEN repository is not selected on the statistic panel THEN `Generate Report` button should be disabled',
        () => {
            let userStatisticsPanel = new UserStatisticsPanel();
            return testUtils.findAndSelectItem('su').then(() => {
            }).then(() => {
                testUtils.saveScreenshot('generate_report_button_is_disabled');
                return userStatisticsPanel.waitForGenerateButtonDisabled();
            }).then(result => {
                assert.isTrue(result, '`Generate Report` button should be disabled');
            });
        });

    it('GIVEN `Super User` is selected WHEN repository has been selected on the statistic panel THEN `Generate Report` button is getting enabled',
        () => {
            let userStatisticsPanel = new UserStatisticsPanel();
            return testUtils.findAndSelectItem('su').then(() => {
                return userStatisticsPanel.selectRepository('com.enonic.cms.default');
            }).then(() => {
                testUtils.saveScreenshot('generate_report_button_getting_enabled');
                return userStatisticsPanel.waitForGenerateButtonEnabled();
            }).then(result => {
                assert.isTrue(result, '`Generate Report` button should be enabled now');
            });
        });

    it('GIVEN `Super User` is selected WHEN  `default` repository and `draft` branch have been selected THEN draft branch should be displayed AND`remove` icon should appear',
        () => {
            let userStatisticsPanel = new UserStatisticsPanel();
            return testUtils.findAndSelectItem('su').then(() => {
                return userStatisticsPanel.selectRepository('com.enonic.cms.default');
            }).then(() => {
                return userStatisticsPanel.clickOnDropDownHandleAndSelectBranch('draft');
            }).then(() => {
                //default repository and draft-branch should be selected
                return userStatisticsPanel.isOptionSelected('com.enonic.cms.default');
            }).then(() => {
                return userStatisticsPanel.getBranchName('com.enonic.cms.default');
            }).then(result => {
                assert.equal(result, "draft", "Expected branch should be displayed")
            })
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});

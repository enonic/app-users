const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const userBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const filterPanel = require('../page_objects/browsepanel/principal.filter.panel');

describe('User Browse Panel specification', function () {
    this.timeout(0);
    webDriverHelper.setupBrowser();

    it('WHEN navigate to the browse panel THEN folders with names `roles` and `/system` should  be present',
        () => {
            return userBrowsePanel.isItemDisplayed('roles').then((result)=> {
                assert.isTrue(result, 'roles folder should be present in the root directory');
            }).then(()=> {
                return userBrowsePanel.isItemDisplayed('/system');
            }).then((result)=> {
                assert.isTrue(result, '`/system` folder should be present in the root directory');
            }).then(()=> {
                return assert.eventually.isFalse(userBrowsePanel.isSelectionTogglerVisible(),
                    "`Selection toggler` should not be displayed");
            })

        });
    it('GIVEN navigate to the browse panel WHEN `roles` folder has been expanded THEN all system roles should be listed',
        () => {
            return userBrowsePanel.clickOnExpanderIcon('roles').then(()=> {
                return assert.eventually.isTrue(userBrowsePanel.isItemDisplayed('system.user.admin'),
                    "`User Administrator` role should be displayed");
            }).then(()=> {
                return assert.eventually.isTrue(userBrowsePanel.isItemDisplayed('system.admin'),
                    "`Administrator` role should be displayed");
            }).then(()=> {
                return assert.eventually.isTrue(userBrowsePanel.isItemDisplayed('cms.admin'),
                    "`Content Manager Administrator` role should be displayed");
            }).then(()=> {
                return assert.eventually.isTrue(userBrowsePanel.isItemDisplayed('system.admin.login'),
                    "`Administration Console Login` role should be displayed");
            }).then(()=> {
                return assert.eventually.isTrue(userBrowsePanel.isItemDisplayed('system.everyone'),
                    "`Everyone` role should be displayed");
            }).then(()=> {
                return assert.eventually.isTrue(userBrowsePanel.isItemDisplayed('cms.expert'),
                    "`Content Manager Expert` role should be displayed");
            }).then(()=> {
                return assert.eventually.isTrue(userBrowsePanel.isItemDisplayed('system.authenticated'),
                    "`Authenticated` role should be displayed");
            });
        });

    it('GIVEN navigate to the browse panel WHEN `/system` folder has been expanded THEN `Groups` and `Users` folders should be listed in the grid',
        () => {
            return userBrowsePanel.clickOnExpanderIcon('/system').then(()=> {
                return userBrowsePanel.isItemDisplayed('groups');
            }).then(result=> {
                assert.isTrue(result, '`Groups` folder should be present beneath the `system`');
            }).then(()=> {
                return userBrowsePanel.isItemDisplayed('users');
            }).then(result=> {
                assert.isTrue(result, '`Users` folder should be present beneath the `system`');
            });
        });

    it('WHEN checkbox for `Roles` is checked THEN SelectionPanelToggler is getting visible',
        () => {
            return userBrowsePanel.clickCheckboxAndSelectRowByDisplayName('Roles').then(()=> {
                return userBrowsePanel.waitForSelectionTogglerVisible();
            }).then(()=> {
                return userBrowsePanel.getNumberInSelectionToggler();
            }).then(result=> {
                testUtils.saveScreenshot('number_in_selection');
                assert.isTrue(result == 1, '1 should be displayed in the selection-toggler button');
            });
        });

    it('GIVEN checkbox for `Roles` is checked WHEN SelectionPanelToggler has been clicked THEN only one folder should be listed in the grid',
        () => {
            return userBrowsePanel.clickCheckboxAndSelectRowByDisplayName('Roles').then(()=> {
                return userBrowsePanel.waitForSelectionTogglerVisible();
            }).then(()=> {
                return userBrowsePanel.clickOnSelectionToggler();
            }).then(result=> {
                return userBrowsePanel.getGridItemDisplayNames();
            }).then(names=> {
                testUtils.saveScreenshot('selection_toggler_clicked');
                assert.isTrue(names.length == 1, 'one folder should be listed in the grid');
                assert.isTrue(names[0] == 'Roles', 'The name of the folder should be Roles');
            });
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(()=> {
        return console.log('specification starting: ' + this.title);
    });
});

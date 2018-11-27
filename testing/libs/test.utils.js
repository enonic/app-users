/**
 * Created on 6/28/2017.
 */
const launcherPanel = require('../page_objects/launcher.panel');
const homePage = require('../page_objects/home.page');
const loginPage = require('../page_objects/login.page');
const browsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const userStoreWizard = require('../page_objects/wizardpanel/userstore.wizard');
const userWizard = require('../page_objects/wizardpanel/user.wizard');
const groupWizard = require('../page_objects/wizardpanel/group.wizard');
const roleWizard = require('../page_objects/wizardpanel/role.wizard');
const wizard = require('../page_objects/wizardpanel/wizard.panel');
const newPrincipalDialog = require('../page_objects/browsepanel/new.principal.dialog');
const filterPanel = require("../page_objects/browsepanel/principal.filter.panel");
const confirmationDialog = require("../page_objects/confirmation.dialog");
const appConst = require("./app_const");
const webDriverHelper = require("./WebDriverHelper");
const itemBuilder = require('./userItems.builder');

module.exports = {

    generateRandomName: function (part) {
        return part + Math.round(Math.random() * 1000000);
    },
    findAndSelectItem: function (name) {
        return this.typeNameInFilterPanel(name).then(() => {
            return browsePanel.waitForRowByNameVisible(name);
        }).pause(400).then(() => {
            return browsePanel.clickOnRowByName(name);
        });
    },
    openFilterPanel: function () {
        return browsePanel.clickOnSearchButton().then(() => {
            return filterPanel.waitForOpened();
        })
    },
    typeNameInFilterPanel: function (name) {
        return filterPanel.isPanelVisible().then(result => {
            if (!result) {
                return browsePanel.clickOnSearchButton().then(() => {
                    return filterPanel.waitForOpened();
                });
            } else {
                this.saveScreenshot('filter_panel_opened');
                return true;
            }
        }).then(result => {
            console.log('filter panel is opened, typing the text: ' + name);
            return filterPanel.typeSearchText(name);
        }).pause(300).then(() => {
            return browsePanel.waitForSpinnerNotVisible();
        });
    },
    selectAndDeleteItem: function (name) {
        return this.findAndSelectItem(name).pause(500).then(() => {
            return browsePanel.waitForDeleteButtonEnabled();
        }).then(result => {
            return browsePanel.clickOnDeleteButton();
        }).then(() => {
            return confirmationDialog.waitForDialogLoaded();
        }).then(result => {
            if (!result) {
                throw new Error('Confirmation dialog was not loaded!')
            }
            return confirmationDialog.clickOnYesButton();
        }).then(() => {
            return browsePanel.waitForSpinnerNotVisible();
        })
    },
    confirmDelete: function () {
        return confirmationDialog.waitForDialogLoaded().then(() => {
            return confirmationDialog.clickOnYesButton();
        }).then(() => {
            return browsePanel.waitForSpinnerNotVisible();
        }).catch(err => {
            this.saveScreenshot('err_confirm_dialog');
            throw new Error('Error in Confirm Delete: ' + err);
        })
    },
    navigateToUsersApp: function (userName, password) {
        return launcherPanel.waitForPanelVisible(appConst.TIMEOUT_1).then((result) => {
            if (result) {
                console.log("Launcher Panel is opened, click on the `Users` link...");
                return launcherPanel.clickOnUsersLink();
            } else {
                console.log("Login Page is opened, type a password and name...");
                return this.doLoginAndClickOnUsersLink(userName, password);
            }
        }).then(() => {
            return this.doSwitchToUsersApp();
        }).catch(err => {
            console.log('tried to navigate to Users app, but: ' + err);
            this.saveScreenshot("err_navigate_to_users" + itemBuilder.generateRandomNumber());
            throw new Error('error when navigate to Users app ' + err);
        });
    },

    doLoginAndClickOnUsersLink: function (userName, password) {
        return loginPage.doLogin(userName, password).pause(500).then(() => {
            return homePage.waitForXpTourVisible(appConst.TIMEOUT_3);
        }).then(result => {
            if (result) {
                console.log('xp-tour dialog is present, closing it... ');
                return homePage.doCloseXpTourDialog();
            } else {
                console.log('xp-tour dialog is not visible: ');
            }
        }).then(() => {
            return launcherPanel.clickOnUsersLink().pause(700);
        })
    },

    doSwitchToUsersApp: function () {
        console.log('testUtils:switching to users app...');
        return webDriverHelper.browser.getTabIds().then(tabs => {
            let prevPromise = Promise.resolve(false);
            tabs.some(tabId => {
                prevPromise = prevPromise.then(isUsers => {
                    if (!isUsers) {
                        return this.switchAndCheckTitle(tabId, "Users - Enonic XP Admin");
                    }
                    return false;
                });
            });
            return prevPromise;
        }).then(() => {
            return browsePanel.waitForSpinnerNotVisible();
        }).then(() => {
            return browsePanel.waitForUsersGridLoaded(appConst.TIMEOUT_3);
        });
    },
    doSwitchToHome: function () {
        console.log('testUtils:switching to Home page...');
        return webDriverHelper.browser.getTabIds().then(tabs => {
            let prevPromise = Promise.resolve(false);
            tabs.some((tabId) => {
                prevPromise = prevPromise.then(isHome => {
                    if (!isHome) {
                        return this.switchAndCheckTitle(webDriverHelper.browser, tabId, "Enonic XP Home");
                    }
                    return false;
                });
            });
            return prevPromise;
        }).then(() => {
            return homePage.waitForLoaded(appConst.TIMEOUT_3);
        });
    },
    switchAndCheckTitle: function (tabId, reqTitle) {
        return webDriverHelper.browser.switchTab(tabId).then(() => {
            return webDriverHelper.browser.getTitle().then(title => {
                return title == reqTitle;

            })
        });
    },
    doCloseUsersApp: function () {
        return webDriverHelper.browser.getTabIds().then(tabIds => {
            let result = Promise.resolve();
            tabIds.forEach((tabId) => {
                result = result.then(() => {
                    return this.switchAndCheckTitle(tabId, "Enonic XP Home");
                }).then((result) => {
                    if (!result) {
                        return webDriverHelper.browser.close();
                    }
                });
            });
            return result;
        }).then(() => {
            return this.doSwitchToHome();
        });
    },

    selectUserAndOpenWizard: function (displayName) {
        return this.findAndSelectItem(displayName).then(() => {
            return browsePanel.waitForEditButtonEnabled();
        }).then(() => {
            return browsePanel.clickOnEditButton();
        }).then(() => {
            return userWizard.waitForOpened();
        }).pause(500);
    },
    selectSystemUserStoreAndOpenWizard: function () {
        return this.findAndSelectItem('system').then(() => {
            return browsePanel.waitForEditButtonEnabled();
        }).then(() => {
            return browsePanel.clickOnEditButton();
        }).then(() => {
            return userStoreWizard.waitForOpened();
        }).pause(500);
    },
    clickOnRolesFolderAndOpenWizard: function () {
        return browsePanel.clickOnRowByName('roles').then(() => {
            return browsePanel.clickOnNewButton();
        }).then(() => {
            return roleWizard.waitForOpened();
        });
    },
    selectRoleAndOpenWizard: function (displayName) {
        return this.findAndSelectItem(displayName).then(() => {
            return browsePanel.waitForEditButtonEnabled();
        }).then(result => {
            if (!result) {
                throw new Error('`Edit` button is disabled!');
            }
            return browsePanel.clickOnEditButton();
        }).then(() => {
            return roleWizard.waitForOpened();
        })
    },
    selectGroupAndOpenWizard: function (displayName) {
        return this.findAndSelectItem(displayName).then(() => {
            return browsePanel.waitForEditButtonEnabled();
        }).then(result => {
            if (!result) {
                throw new Error('`Edit` button is disabled!');
            }
            return browsePanel.clickOnEditButton();
        }).then(() => {
            return groupWizard.waitForOpened();
        })
    },
    saveAndCloseWizard: function (displayName) {
        return wizard.waitAndClickOnSave().pause(1000).then(() => {
            return browsePanel.doClickOnCloseTabAndWaitGrid(displayName);
        })
    },
    openWizardAndSaveUserStore: function (userStoreData) {
        return this.clickOnNewOpenUserStoreWizard().then(() => {
            return userStoreWizard.typeData(userStoreData)
        }).pause(400).then(() => {
            return userStoreWizard.waitAndClickOnSave()
        }).then(() => {
            return userStoreWizard.waitForSpinnerNotVisible()
        }).pause(1200);
    },
    openWizardAndSaveRole: function (role) {
        return this.clickOnRolesFolderAndOpenWizard().then(() => {
            return roleWizard.typeData(role)
        }).pause(500).then(() => {
            return this.saveAndCloseWizard(role.displayName)
        }).pause(500);
    },
    openWizardAndSaveGroup: function (group) {
        return this.clickOnSystemAndOpenGroupWizard().then(() => {
            return groupWizard.typeData(group)
        }).pause(500).then(() => {
            return this.saveAndCloseWizard(group.displayName)
        }).pause(1000);
    },
    clickOnNewOpenUserStoreWizard: function () {
        return browsePanel.clickOnNewButton().then(() => {
            return newPrincipalDialog.waitForOpened();
        }).then(() => {
            return newPrincipalDialog.clickOnItem(`User Store`);
        }).then(() => userStoreWizard.waitForOpened());
    },
    clickOnSystemOpenUserWizard: function () {
        return browsePanel.clickOnRowByName('system').then(() => {
            return browsePanel.waitForNewButtonEnabled();
        }).then(() => {
            return browsePanel.clickOnNewButton();
        }).then(() => {
            return newPrincipalDialog.clickOnItem('User');
        }).then(() => {
            return userWizard.waitForOpened();
        });
    },
    addSystemUser: function (userData) {
        return this.clickOnSystemOpenUserWizard().then(() => {
            return userWizard.typeData(userData).then(() => {
                return this.saveAndCloseWizard(userData.displayName);
            })
        })
    },
    clickOnSystemAndOpenGroupWizard: function () {
        return browsePanel.clickOnRowByName('system').then(() => {
            return browsePanel.waitForNewButtonEnabled();
        }).then(() => {
            return browsePanel.clickOnNewButton();
        }).then(() => {
            return newPrincipalDialog.clickOnItem('Group');
        }).then(() => {
            return groupWizard.waitForOpened();
        });
    },
    clickOnUserStoreAndOpenUserWizard: function (storeName) {
        return browsePanel.clickOnRowByName(storeName).then(() => {
            return browsePanel.waitForNewButtonEnabled();
        }).then(() => {
            return browsePanel.clickOnNewButton();
        }).then(() => {
            return newPrincipalDialog.clickOnItem('User');
        }).then(() => {
            return userWizard.waitForOpened();
        }).pause(300);
    },
    saveScreenshot: function (name) {
        let path = require('path');
        let screenshotsDir = path.join(__dirname, '/../build/screenshots/');
        return webDriverHelper.browser.saveScreenshot(screenshotsDir + name + '.png').then(() => {
            return console.log('screenshot saved ' + name);
        }).catch(err => {
            return console.log('screenshot was not saved ' + screenshotsDir + 'utils  ' + err);
        })
    }
};

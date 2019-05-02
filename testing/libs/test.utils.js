/**
 * Created on 6/28/2017.
 */
const LauncherPanel = require('../page_objects/launcher.panel');
const HomePage = require('../page_objects/home.page');
const LoginPage = require('../page_objects/login.page');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const IdProviderWizard = require('../page_objects/wizardpanel/idprovider.wizard');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const GroupWizard = require('../page_objects/wizardpanel/group.wizard');
const RoleWizard = require('../page_objects/wizardpanel/role.wizard');
const wizard = require('../page_objects/wizardpanel/wizard.panel');
const NewPrincipalDialog = require('../page_objects/browsepanel/new.principal.dialog');
const FilterPanel = require("../page_objects/browsepanel/principal.filter.panel");
const ConfirmationDialog = require("../page_objects/confirmation.dialog");
const appConst = require("./app_const");
const webDriverHelper = require("./WebDriverHelper");
const itemBuilder = require('./userItems.builder');

module.exports = {

    generateRandomName: function (part) {
        return part + Math.round(Math.random() * 1000000);
    },
    findAndSelectItem(name) {
        let browsePanel = new UserBrowsePanel();
        return this.typeNameInFilterPanel(name).then(() => {
            return browsePanel.pause(400);
        }).then(() => {
            return browsePanel.waitForRowByNameVisible(name);
        }).then(() => {
            return browsePanel.clickOnRowByName(name);
        }).then(() => {
            return browsePanel.pause(800);
        });
    },
    openFilterPanel() {
        let filterPanel = new FilterPanel();
        let browsePanel = new UserBrowsePanel();
        return browsePanel.clickOnSearchButton().then(() => {
            return filterPanel.waitForOpened();
        })
    },
    typeNameInFilterPanel(name) {
        let browsePanel = new UserBrowsePanel();
        let filterPanel = new FilterPanel();
        return filterPanel.isPanelVisible().then(result => {
            if (!result) {
                return browsePanel.clickOnSearchButton().then(() => {
                    return filterPanel.waitForOpened();
                });
            }
        }).then(result => {
            console.log('filter panel is opened, typing the text: ' + name);
            return filterPanel.typeSearchText(name);
        }).then(() => {
            return browsePanel.pause(300);
        }).then(() => {
            return browsePanel.waitForSpinnerNotVisible();
        });
    },
    selectAndDeleteItem: function (name) {
        let browsePanel = new UserBrowsePanel();
        let confirmationDialog = new ConfirmationDialog();
        return this.findAndSelectItem(name).then(() => {
            return browsePanel.waitForDeleteButtonEnabled();
        }).then(result => {
            return browsePanel.clickOnDeleteButton();
        }).then(() => {
            return confirmationDialog.waitForDialogLoaded();
        }).then(result => {
            return confirmationDialog.clickOnYesButton();
        }).then(() => {
            return browsePanel.waitForSpinnerNotVisible();
        })
    },
    confirmDelete: function () {
        let confirmationDialog = new ConfirmationDialog();
        let browsePanel = new UserBrowsePanel();
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
        let launcherPanel = new LauncherPanel();
        return launcherPanel.waitForPanelDisplayed(3000).then(result => {
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
        let loginPage = new LoginPage();
        return loginPage.doLogin(userName, password).then(() => {
            let launcherPanel = new LauncherPanel();
            return launcherPanel.clickOnUsersLink();
        }).then(() => {
            return loginPage.pause(1000);
        })
    },
    doSwitchToUsersApp: function () {
        console.log('testUtils:switching to users app...');
        let browsePanel = new UserBrowsePanel();
        return webDriverHelper.browser.switchWindow("Users - Enonic XP Admin").then(() => {
            console.log("switched to Users app...");
            return browsePanel.waitForSpinnerNotVisible();
        }).then(() => {
            return browsePanel.waitForUsersGridLoaded(appConst.TIMEOUT_3);
        }).catch(err => {
            throw new Error("Error when switching to Users App " + err);
        })
    },

    doSwitchToHome: function () {
        console.log('testUtils:switching to Home page...');
        return webDriverHelper.browser.switchWindow("Enonic XP Home").then(() => {
            console.log("switched to Home...");
        }).then(() => {
            let homePage = new HomePage();
            return homePage.waitForLoaded(appConst.TIMEOUT_3);
        });
    },
    switchAndCheckTitle: function (handle, reqTitle) {
        return webDriverHelper.browser.switchWindow(handle).then(() => {
            return webDriverHelper.browser.getTitle().then(title => {
                return title == reqTitle;

            })
        });
    },
    doCloseUsersApp: function () {
        return webDriverHelper.browser.getTitle().then(title => {
            if (title == "Users - Enonic XP Admin") {
                return webDriverHelper.browser.closeWindow();
            }
        }).then(() => {
            return this.doSwitchToHome();
        });
    },
    selectUserAndOpenWizard(displayName) {
        let browsePanel = new UserBrowsePanel();
        let userWizard = new UserWizard();
        return this.findAndSelectItem(displayName).then(() => {
            return browsePanel.waitForEditButtonEnabled();
        }).then(() => {
            return browsePanel.clickOnEditButton();
        }).then(() => {
            return userWizard.waitForOpened();
        }).then(() => {
            return userWizard.pause(500);
        })
    },
    openWizardAndSaveGroup: function (group) {
        let groupWizard = new GroupWizard();
        return this.clickOnSystemAndOpenGroupWizard().then(() => {
            return groupWizard.typeData(group)
        }).then(() => {
            return groupWizard.pause(500);
        }).then(() => {
            return this.saveAndCloseWizard(group.displayName)
        }).then(() => {
            return groupWizard.pause(500);
        });
    },
    clickOnSystemAndOpenGroupWizard: function () {
        let browsePanel = new UserBrowsePanel();
        let newPrincipalDialog = new NewPrincipalDialog();
        let groupWizard = new GroupWizard();
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
    saveAndCloseWizard: function (displayName) {
        let wizardPanel = new wizard.WizardPanel();
        let browsePanel = new UserBrowsePanel();
        return wizardPanel.waitAndClickOnSave().then(() => {
            return wizardPanel.pause(700);
        }).then(() => {
            return browsePanel.doClickOnCloseTabAndWaitGrid(displayName);
        })
    },
    openWizardAndSaveRole: function (role) {
        let roleWizard = new RoleWizard();
        return this.clickOnRolesFolderAndOpenWizard().then(() => {
            return roleWizard.typeData(role)
        }).then(() => {
            return roleWizard.pause(500);
        }).then(() => {
            return this.saveAndCloseWizard(role.displayName)
        }).then(() => {
            return roleWizard.pause(500);
        });
    },
    clickOnRolesFolderAndOpenWizard: function () {
        let browsePanel = new UserBrowsePanel();
        let roleWizard = new RoleWizard();
        return browsePanel.clickOnRowByName('roles').then(() => {
            return browsePanel.clickOnNewButton();
        }).then(() => {
            return roleWizard.waitForLoaded();
        });
    },
    clickOnSystemOpenUserWizard: function () {
        let browsePanel = new UserBrowsePanel();
        let userWizard = new UserWizard();
        let newPrincipalDialog = new NewPrincipalDialog();
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
    selectSystemIdProviderAndOpenWizard: function () {
        let browsePanel = new UserBrowsePanel();
        let idProviderWizard = new IdProviderWizard();
        return this.findAndSelectItem('system').then(() => {
            return browsePanel.waitForEditButtonEnabled();
        }).then(() => {
            return browsePanel.clickOnEditButton();
        }).then(() => {
            return idProviderWizard.waitForOpened();
        });
    },
    selectRoleAndOpenWizard: function (displayName) {
        let browsePanel = new UserBrowsePanel();
        let roleWizard = new RoleWizard();
        return this.findAndSelectItem(displayName).then(() => {
            return browsePanel.waitForEditButtonEnabled();
        }).then(result => {
            if (!result) {
                throw new Error('`Edit` button is disabled!');
            }
            return browsePanel.clickOnEditButton();
        }).then(() => {
            return roleWizard.waitForLoaded();
        })
    },
    selectGroupAndOpenWizard: function (displayName) {
        let browsePanel = new UserBrowsePanel();
        let groupWizard = new GroupWizard();
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
    openWizardAndSaveIdProvider: function (idProviderData) {
        let idProviderWizard = new IdProviderWizard();
        return this.openIdProviderWizard().then(() => {
            return idProviderWizard.typeData(idProviderData);
        }).then(() => {
            return idProviderWizard.pause(500);
        }).then(() => {
            return idProviderWizard.waitAndClickOnSave();
        }).then(() => {
            //return idProviderWizard.waitForSpinnerVisible();
        }).then(() => {
            return idProviderWizard.waitForSpinnerNotVisible();
        });
    },
    openIdProviderWizard: function () {
        let browsePanel = new UserBrowsePanel();
        let newPrincipalDialog = new NewPrincipalDialog();
        let idProviderWizard = new IdProviderWizard();
        return browsePanel.clickOnNewButton().then(() => {
            return newPrincipalDialog.waitForDialogLoaded();
        }).then(() => {
            return newPrincipalDialog.clickOnItem(appConst.ID_PROVIDER);
        }).then(() => {
                return idProviderWizard.waitForOpened();
            }
        );
    },

    addSystemUser: function (userData) {
        let userWizard = new UserWizard();
        return this.clickOnSystemOpenUserWizard().then(() => {
            return userWizard.typeData(userData).then(() => {
                return this.saveAndCloseWizard(userData.displayName);
            })
        })
    },
    clickOnIdProviderAndOpenUserWizard: function (storeName) {
        let browsePanel = new UserBrowsePanel();
        let newPrincipalDialog = new NewPrincipalDialog();
        let userWizard = new UserWizard();
        return browsePanel.clickOnRowByName(storeName).then(() => {
            return browsePanel.waitForNewButtonEnabled();
        }).then(() => {
            return browsePanel.clickOnNewButton();
        }).then(() => {
            return newPrincipalDialog.clickOnItem('User');
        }).then(() => {
            return userWizard.waitForOpened();
        });
    },
    saveScreenshot: function (name) {
        let path = require('path')
        let screenshotsDir = path.join(__dirname, '/../build/screenshots/');
        return webDriverHelper.browser.saveScreenshot(screenshotsDir + name + '.png').then(() => {
            return console.log('screenshot saved ' + name);
        }).catch(err => {
            return console.log('screenshot was not saved ' + screenshotsDir + 'utils  ' + err);
        })
    }
};

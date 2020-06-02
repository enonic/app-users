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
    async findAndSelectItem(name) {
        let browsePanel = new UserBrowsePanel();
        await this.typeNameInFilterPanel(name);
        await browsePanel.waitForRowByNameVisible(name);
        await browsePanel.clickOnRowByName(name);
        return await browsePanel.pause(500);
    },
    async openFilterPanel() {
        let filterPanel = new FilterPanel();
        let browsePanel = new UserBrowsePanel();
        await browsePanel.clickOnSearchButton();
        return await filterPanel.waitForOpened();
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
    async selectAndDeleteItem(name) {
        let browsePanel = new UserBrowsePanel();
        let confirmationDialog = new ConfirmationDialog();
        await this.findAndSelectItem(name);
        await browsePanel.waitForDeleteButtonEnabled();
        await browsePanel.clickOnDeleteButton();
        await confirmationDialog.waitForDialogLoaded();
        await confirmationDialog.clickOnYesButton();
        return await browsePanel.waitForSpinnerNotVisible();
    },
    async confirmDelete() {
        try {
            let confirmationDialog = new ConfirmationDialog();
            let browsePanel = new UserBrowsePanel();
            await confirmationDialog.waitForDialogLoaded();
            await confirmationDialog.clickOnYesButton();
            return await browsePanel.waitForSpinnerNotVisible();
        } catch (err) {
            this.saveScreenshot('err_confirm_dialog');
            throw new Error('Error in Confirm Delete: ' + err);
        }
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
    async doLoginAndClickOnUsersLink(userName, password) {
        let loginPage = new LoginPage();
        await loginPage.doLogin(userName, password);
        let launcherPanel = new LauncherPanel();
        await launcherPanel.clickOnUsersLink();
        return await loginPage.pause(1000);
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
    async selectUserAndOpenWizard(displayName) {
        let browsePanel = new UserBrowsePanel();
        let userWizard = new UserWizard();
        await this.findAndSelectItem(displayName);
        await browsePanel.waitForEditButtonEnabled();
        await browsePanel.clickOnEditButton();
        await userWizard.waitForOpened();
        return await userWizard.pause(500);

    },
    async openWizardAndSaveGroup(group) {
        let groupWizard = new GroupWizard();
        //Select System ID Provider and open new Group Wizard:
        await this.clickOnSystemAndOpenGroupWizard();
        await groupWizard.typeData(group);
        await groupWizard.pause(500);
        //Close the wizard:
        await this.saveAndCloseWizard(group.displayName);
        return await groupWizard.pause(500);
    },
    async clickOnSystemAndOpenGroupWizard() {
        let browsePanel = new UserBrowsePanel();
        let newPrincipalDialog = new NewPrincipalDialog();
        let groupWizard = new GroupWizard();
        //1. Select System ID Provider folder:
        await browsePanel.clickOnRowByName('system');
        //2. Open New Principal dialog:
        await browsePanel.waitForNewButtonEnabled();
        await browsePanel.clickOnNewButton();
        await newPrincipalDialog.waitForDialogLoaded();
        //3. Click on Group item in the modal dialog:
        await newPrincipalDialog.clickOnItem('Group');
        return await groupWizard.waitForOpened();

    },
//Click on Save button and close the wizard:
    async saveAndCloseWizard(displayName) {
        let wizardPanel = new wizard.WizardPanel();
        let browsePanel = new UserBrowsePanel();
        await wizardPanel.waitAndClickOnSave();
        await wizardPanel.pause(700);
        //Click on Close icon and close the wizard:
        return await browsePanel.doClickOnCloseTabAndWaitGrid(displayName);
    },
    async openWizardAndSaveRole(role) {
        let roleWizard = new RoleWizard();
        //Open Role-wizard:
        await this.clickOnRolesFolderAndOpenWizard();
        await roleWizard.typeData(role);
        await roleWizard.pause(500);
        await this.saveAndCloseWizard(role.displayName);
        return await roleWizard.pause(500);
    },
    async clickOnRolesFolderAndOpenWizard() {
        let browsePanel = new UserBrowsePanel();
        let roleWizard = new RoleWizard();
        //Select Roles folder:
        await browsePanel.clickOnRowByName('roles');
        await browsePanel.clickOnNewButton();
        return await roleWizard.waitForLoaded();
    },
    async clickOnSystemOpenUserWizard() {
        let browsePanel = new UserBrowsePanel();
        let userWizard = new UserWizard();
        let newPrincipalDialog = new NewPrincipalDialog();
        await browsePanel.clickOnRowByName('system');
        await browsePanel.waitForNewButtonEnabled();
        await browsePanel.clickOnNewButton();
        await newPrincipalDialog.clickOnItem('User');
        return await userWizard.waitForOpened();
    },
//Opens System ID Provider folder:
    async selectSystemIdProviderAndOpenWizard() {
        let browsePanel = new UserBrowsePanel();
        let idProviderWizard = new IdProviderWizard();
        await this.findAndSelectItem('system');
        await browsePanel.waitForEditButtonEnabled();
        await browsePanel.clickOnEditButton();
        return await idProviderWizard.waitForOpened();
    },
    async selectAndOpenIdProvider(displayName) {
        let browsePanel = new UserBrowsePanel();
        let idProviderWizard = new IdProviderWizard();
        await this.findAndSelectItem(displayName);
        await browsePanel.waitForEditButtonEnabled();
        await browsePanel.clickOnEditButton();
        return await idProviderWizard.waitForOpened();
    },
    async selectRoleAndOpenWizard(displayName) {
        let browsePanel = new UserBrowsePanel();
        let roleWizard = new RoleWizard();
        try {
            await this.findAndSelectItem(displayName);
            await browsePanel.waitForEditButtonEnabled();
            await browsePanel.clickOnEditButton();
            return await roleWizard.waitForLoaded();
        } catch (err) {
            throw new Error("Error when open the role: " + err);
        }
    },
    async selectGroupAndOpenWizard(displayName) {
        let browsePanel = new UserBrowsePanel();
        let groupWizard = new GroupWizard();
        try {
            await this.findAndSelectItem(displayName);
            await browsePanel.waitForEditButtonEnabled();
            await browsePanel.clickOnEditButton();
            return await groupWizard.waitForOpened();
        } catch (err) {
            throw new Error("Error when open the group: " + err);
        }
    },
    async openWizardAndSaveIdProvider(idProviderData) {
        let idProviderWizard = new IdProviderWizard();
        //1. Open new ID Provider Wizard:
        await this.openIdProviderWizard();
        await idProviderWizard.typeData(idProviderData);
        await idProviderWizard.pause(500);
        //2. Save the data:
        await idProviderWizard.waitAndClickOnSave();
        await idProviderWizard.pause(2000);
        return await idProviderWizard.waitForSpinnerNotVisible();
    },
    async openIdProviderWizard() {
        let browsePanel = new UserBrowsePanel();
        let newPrincipalDialog = new NewPrincipalDialog();
        let idProviderWizard = new IdProviderWizard();
        await browsePanel.clickOnNewButton();
        await newPrincipalDialog.waitForDialogLoaded();
        await newPrincipalDialog.clickOnItem(appConst.ID_PROVIDER);
        return await idProviderWizard.waitForOpened();
    },

    async addSystemUser(userData) {
        let userWizard = new UserWizard();
        //1. Select System ID Provider folder:
        await this.clickOnSystemOpenUserWizard();
        //2. Type the data:
        await userWizard.typeData(userData);
        //3. Save the data and close the wizard:
        return await this.saveAndCloseWizard(userData.displayName);
    },
    async clickOnIdProviderAndOpenUserWizard(storeName) {
        let browsePanel = new UserBrowsePanel();
        let newPrincipalDialog = new NewPrincipalDialog();
        let userWizard = new UserWizard();
        await browsePanel.clickOnRowByName(storeName);
        await browsePanel.waitForNewButtonEnabled();
        await browsePanel.clickOnNewButton();
        await newPrincipalDialog.clickOnItem('User');
        return await userWizard.waitForOpened();
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

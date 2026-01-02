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
const fs = require('fs');
const path = require('path');

module.exports = {

    getBrowser() {
        if (typeof browser !== 'undefined') {
            return browser;
        } else {
            return webDriverHelper.browser;
        }
    },
    generateRandomName: function (part) {
        return part + Math.round(Math.random() * 1000000);
    },
    async findAndSelectItem(name) {
        let browsePanel = new UserBrowsePanel();
        await this.typeNameInFilterPanel(name);
        await browsePanel.waitForRowByNameVisible(name);

        await browsePanel.clickOnRowByName(name);
        // Removed redundant pause - waitForRowByNameVisible already waits for element
    },
    async openFilterPanel() {
        let filterPanel = new FilterPanel();
        let browsePanel = new UserBrowsePanel();
        await browsePanel.clickOnSearchButton();
        return await filterPanel.waitForOpened();
    },
    async typeNameInFilterPanel(name) {
        let browsePanel = new UserBrowsePanel();
        let filterPanel = new FilterPanel();
        let isVisible = await filterPanel.isPanelVisible();
        if (!isVisible) {
            await browsePanel.clickOnSearchButton();
            await filterPanel.waitForOpened();

        }
        console.log('filter panel is opened, insert the text: ' + name);
        await filterPanel.typeSearchText(name);
        await filterPanel.pause(200);
        await browsePanel.waitForSpinnerNotVisible();
    },
    async selectAndDeleteItem(name) {
        let browsePanel = new UserBrowsePanel();
        let confirmationDialog = new ConfirmationDialog();
        await this.findAndSelectItem(name);
        await browsePanel.waitForDeleteButtonEnabled();
        await browsePanel.clickOnDeleteButton();
        await confirmationDialog.waitForDialogLoaded();
        await confirmationDialog.clickOnYesButton();
        await browsePanel.waitForSpinnerNotVisible();
    },
    async confirmDelete() {
        try {
            let confirmationDialog = new ConfirmationDialog();
            let browsePanel = new UserBrowsePanel();
            await confirmationDialog.waitForDialogLoaded();
            await confirmationDialog.clickOnYesButton();
            return await browsePanel.waitForSpinnerNotVisible();
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_confirm_dialog');
            throw new Error('Error in Confirm Delete, screenshot: ' + screenshot + ' ' + err);
        }
    },
    async switchToTab(title) {
        let handles = await this.getBrowser().getWindowHandles();
        for (const handle of handles) {
            await this.getBrowser().switchToWindow(handle);
            let currentTitle = await this.getBrowser().getTitle();
            if (currentTitle === title) {
                return handle;
            }
        }
        throw new Error('Browser tab with title ' + title + ' was not found');
    },
    async navigateToUsersApp(userName, password) {
        try {
            let launcherPanel = new LauncherPanel();
            let result = await launcherPanel.waitForPanelDisplayed(appConst.mediumTimeout);
            if (result) {
                console.log("Launcher Panel is opened, click on the `Users` link...");
                await launcherPanel.clickOnUsersLink();
            } else {
                console.log("Login Page is opened, type a password and name...");
                await this.doLoginAndClickOnUsersLink(userName, password);
            }
            await this.doSwitchToUsersApp();
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_navigation');
            throw new Error('navigateToUsersApp  - error during navigation to Users app, screenshot: ' + screenshot + "  " + err);
        }
    },
    async saveScreenshotUniqueName(namePart) {
        let screenshotName = appConst.generateRandomName(namePart);
        await this.saveScreenshot(screenshotName);
        return screenshotName;
    },
    async doLoginAndClickOnUsersLink(userName, password) {
        let loginPage = new LoginPage();
        await loginPage.doLogin(userName, password);
        let launcherPanel = new LauncherPanel();
        await launcherPanel.clickOnUsersLink();
        // Removed redundant pause - next operation (doSwitchToUsersApp) has proper waits
    },
    async doSwitchToUsersApp() {
        try {
            console.log('testUtils:switching to users app...');
            let browsePanel = new UserBrowsePanel();
            await this.switchToTab(appConst.BROWSER_TITLES.USERS_APP);
            console.log("switched to Users app...");
            await browsePanel.waitForSpinnerNotVisible();
            return browsePanel.waitForUsersGridLoaded(appConst.mediumTimeout);
        } catch (err) {
            throw new Error("Error when switching to Users App " + err);
        }
    },

    async doSwitchToHome() {
        console.log('testUtils:switching to Home page...');
        let homePage = new HomePage();
        await this.switchToTab(appConst.BROWSER_TITLES.XP_HOME);
        return await homePage.waitForLoaded(appConst.mediumTimeout);
    },
    switchAndCheckTitle(handle, reqTitle) {
        return this.getBrowser().switchWindow(handle).then(() => {
            return this.getBrowser().getTitle().then(title => {
                return title === reqTitle;
            })
        });
    },
    async doCloseUsersApp() {
        let title = await this.getBrowser().getTitle();
        if (title === appConst.BROWSER_TITLES.USERS_APP) {
            await this.getBrowser().closeWindow();
        }
        await this.doSwitchToHome();
    },
    // Select a user by its display name that is present in the path
    async selectUserAndOpenWizard(displayName) {
        let browsePanel = new UserBrowsePanel();
        let userWizard = new UserWizard();
        await this.findAndSelectItem(displayName);
        await browsePanel.waitForEditButtonEnabled();
        await browsePanel.clickOnEditButton();
        await userWizard.waitForOpened();
    },
    async openWizardAndSaveGroup(group) {
        let groupWizard = new GroupWizard();
        //Select System ID Provider and open new Group Wizard:
        await this.clickOnSystemAndOpenGroupWizard();
        await groupWizard.typeData(group);
        await groupWizard.pause(300);
        //Close the wizard:
        await this.saveAndCloseWizard(group.displayName);
    },
    async clickOnSystemAndOpenGroupWizard() {
        let browsePanel = new UserBrowsePanel();
        let newPrincipalDialog = new NewPrincipalDialog();
        let groupWizard = new GroupWizard();
        let result = await browsePanel.isRowHighlighted('System Id Provider');
        if (!result) {
            //1. Select System ID Provider folder:
            await browsePanel.clickOnRowByName('system');
        }
        //2. Open New Principal dialog:
        await browsePanel.waitForNewButtonEnabled();
        await browsePanel.clickOnNewButton();
        await newPrincipalDialog.waitForDialogLoaded();
        //3. Click on Group item in the modal dialog:
        await newPrincipalDialog.clickOnItem('Group');
        return await groupWizard.waitForOpened();
    },
    async selectIdProviderAndClickOnMenuItem(providerName, menuItem) {
        let browsePanel = new UserBrowsePanel();
        let newPrincipalDialog = new NewPrincipalDialog();
        let result = await browsePanel.isRowHighlighted(providerName);
        if (!result) {
            //1. click on the ID Provider folder:
            await browsePanel.clickOnRowByName(providerName);
        }
        //2. Open New Principal dialog:
        await browsePanel.waitForNewButtonEnabled();
        // Removed redundant pause after waitForNewButtonEnabled
        await browsePanel.clickOnNewButton();
        await newPrincipalDialog.waitForDialogLoaded();
        //3. Click on Group item in the modal dialog:
        await newPrincipalDialog.clickOnItem(menuItem);
    },
    // Click on Save button and close the wizard:
    async saveAndCloseWizard(displayName) {
        let wizardPanel = new wizard.WizardPanel();
        let browsePanel = new UserBrowsePanel();
        await wizardPanel.waitAndClickOnSave();
        await wizardPanel.pause(300);
        // Click on 'Close' icon and close the wizard:
        return await browsePanel.closeTabAndWaitForGrid(displayName);
    },
    async openWizardAndSaveRole(role) {
        let roleWizard = new RoleWizard();
        //Open Role-wizard:
        await this.clickOnRolesFolderAndOpenWizard();
        await roleWizard.typeData(role);
        await roleWizard.pause(300);
        await this.saveAndCloseWizard(role.displayName);
        // Removed duplicate pause - saveAndCloseWizard has proper waits
    },
    async clickOnRolesFolderAndOpenWizard() {
        let browsePanel = new UserBrowsePanel();
        let roleWizard = new RoleWizard();
        // Select 'Roles' folder:
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
        // Removed redundant pause - waitForNewButtonEnabled already waits
        await newPrincipalDialog.clickOnItem('User');
        await userWizard.waitForOpened();
    },
    // Opens System ID Provider folder:
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
            await roleWizard.waitForLoaded();
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
        // 1. Open new ID Provider Wizard:
        await this.openIdProviderWizard();
        await idProviderWizard.typeData(idProviderData);
        await idProviderWizard.pause(300);
        // 2. Save the data:
        await idProviderWizard.waitAndClickOnSave();
        // ID provider operations may require more processing time
        await idProviderWizard.pause(500);
        await idProviderWizard.waitForSpinnerNotVisible();
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
        // 1. Select System ID Provider folder:
        await this.clickOnSystemOpenUserWizard();
        // 2. Type the data:
        await userWizard.typeData(userData);
        // 3. Save the data and close the wizard:
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
    saveScreenshot(name, that) {
        let screenshotsDir = path.join(__dirname, '/../build/reports/screenshots/');
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir, {recursive: true});
        }
        return this.getBrowser().saveScreenshot(screenshotsDir + name + '.png').then(() => {

            return console.log('screenshot saved ' + name);
        }).catch(err => {
            return console.log('screenshot was not saved ' + screenshotsDir + 'utils  ' + err);
        })
    }
};

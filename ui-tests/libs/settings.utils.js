/**
 * Created on 24.09.2026
 */
const HomePage = require('../page_objects/home.page');
const LoginPage = require('../page_objects/login.page');
const appConst = require('./app_const');
const webDriverHelper = require('./WebDriverHelper');
const MenuSectionsRail = require('../page_objects/menu.sections.rail');
const UsersPage = require('../page_objects/users/users.page');
const UserEditorIdProviderStepDialog = require('../page_objects/users/user-dialog/user.editor.id.provider.step.dialog');
const UserEditorGeneralStepDialog = require('../page_objects/users/user-dialog/user.editor.general.step.dialog');
const UserEditorCredentialsStepDialog = require('../page_objects/users/user-dialog/user.editor.credentials.step.dialog');
const UserEditorRolesStepDialog = require('../page_objects/users/user-dialog/user.editor.roles.step.dialog');
const UserEditorGroupsStepDialog = require('../page_objects/users/user-dialog/user.editor.groups.step.dialog');
const UserEditorSummaryStepDialog = require('../page_objects/users/user-dialog/user.editor.summary.step.dialog');
const ServiceAccountsPage = require('../page_objects/service-accounts/service.accounts.page');
const ServiceAccountEditorGeneralStepDialog = require('../page_objects/service-accounts/service-account-dialog/service.account.editor.general.step.dialog');
const ServiceAccountEditorCredentialsStepDialog = require('../page_objects/service-accounts/service-account-dialog/service.account.editor.credentials.step.dialog');
const ServiceAccountEditorRolesStepDialog = require('../page_objects/service-accounts/service-account-dialog/service.account.editor.roles.step.dialog');
const ServiceAccountEditorGroupsStepDialog = require('../page_objects/service-accounts/service-account-dialog/service.account.editor.groups.step.dialog');
const ServiceAccountEditorSummaryStepDialog = require('../page_objects/service-accounts/service-account-dialog/service.account.editor.summary.step.dialog');
const IdProvidersPage = require('../page_objects/providers/id.providers.page');
const IdProviderEditorGeneralStepDialog = require('../page_objects/providers/provider-dialog/provider.editor.general.step.dialog');
const IdProviderEditorPermissionsStepDialog = require('../page_objects/providers/provider-dialog/provider.editor.permissions.step.dialog');
const IdProviderEditorSummaryStepDialog = require('../page_objects/providers/provider-dialog/provider.editor.summary.step.dialog');
const fs = require('fs');
const path = require('path');

// 'base.url' from browser.properties, the address the runner opens the browser at.
const propertiesReaderModule = require('properties-reader');
const propertiesReader =
  propertiesReaderModule.propertiesReader ||
  propertiesReaderModule.default ||
  propertiesReaderModule;
const properties = propertiesReader({ sourceFile: path.join(__dirname, '../browser.properties') });
const BASE_URL = String(properties.get('base.url')).replace(/[/]+$/, '') + '/';

module.exports = {
  getBrowser() {
    if (typeof browser !== 'undefined') {
      return browser;
    } else {
      return webDriverHelper.browser;
    }
  },
  async waitForElementDisplayed(selector, ms) {
    let element = await this.getBrowser().$(selector);
    return await element.waitForDisplayed(ms);
  },
  async clickOnElement(selector) {
    let el = await this.getBrowser().$(selector);
    await el.waitForDisplayed({ timeout: 2000 });
    return await el.click();
  },
  async getText(selector) {
    let el = await this.getBrowser().$(selector);
    await el.waitForDisplayed({ timeout: 2000 });
    return await el.getText();
  },

  async isElementDisplayed(selector) {
    let el = await this.getBrowser().$(selector);
    return await el.isDisplayed();
  },
  getPageSource() {
    return this.getBrowser().getPageSource();
  },

  getTitle() {
    return this.getBrowser().getTitle();
  },

  scrollViewPort(viewportElement, step) {
    return this.getBrowser().execute('arguments[0].scrollTop=arguments[1]', viewportElement, step);
  },
  async doCloseCurrentBrowserTab() {
    let title = await this.getBrowser().getTitle();
    if (title !== 'Enonic XP Home') {
      //return await this.getBrowser().closeWindow();
      return await this.getBrowser().execute('window.close();');
    }
  },
  async saveScreenshotUniqueName(namePart) {
    let screenshotName = appConst.generateRandomName(namePart);
    await this.saveScreenshot(screenshotName);
    return screenshotName;
  },

  async doLogout() {
    let loginPage = new LoginPage();
    let homePage = new HomePage();
    await homePage.clickOnAvatarButton();
    await homePage.clickOnLogoutDropdownMenuItem();
    return await loginPage.waitForPageLoaded();
  },
  // Logs in, opens the Settings app and, when a section is given, switches to it via the rail.
  // `section` is one of MenuSectionsRail.SECTION.* ('Users', 'Roles', ...).
  async navigateToSettingsApp(userName, password, section) {
    try {
      await this.doLogin(userName, password);
      let homePage = new HomePage();
      await homePage.clickOnSettingsLink();
      let menuSectionsRail = new MenuSectionsRail();
      await menuSectionsRail.waitForLoaded();
      if (section) {
        await this.navigateToExtension(section);
      }
    } catch (err) {
      let screenshot = await this.saveScreenshotUniqueName('err_navigate_settings');
      throw new Error(
        `Error occurred after clicking on Settings link ,  screenshot:${screenshot}  ` + err,
      );
    }
  },
  async doLogin(userName, password) {
    let loginPage = new LoginPage();
    let result = await loginPage.isLoaded();
    if (result) {
      await loginPage.doLogin(userName, password);
    }
    let homePage = new HomePage();
    await homePage.waitForSettingsLinkDisplayed();
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
  async waitForNewTabAndSwitch(expectedTitlePart) {
    let matchedHandle = null;
    try {
      await this.getBrowser().waitUntil(
        async () => {
          let handles = await this.getBrowser().getWindowHandles();
          for (const handle of handles) {
            try {
              await this.getBrowser().switchToWindow(handle);
              let currentTitle = await this.getBrowser().getTitle();
              if (currentTitle.includes(expectedTitlePart)) {
                matchedHandle = handle;
                return true;
              }
            } catch (err) {
              // the tab is not ready yet or has been closed
            }
          }
          return false;
        },
        {
          timeout: appConst.TIMEOUT.MEDIUM,
          timeoutMsg: `A browser tab with the title containing '${expectedTitlePart}' was not opened`,
        },
      );
      return matchedHandle;
    } catch (err) {
      let screenshot = await this.saveScreenshotUniqueName('err_new_tab_switch');
      throw new Error(
        `Error when switching to the new browser tab: ${err} [screenshot]: ${screenshot}`,
      );
    }
  },

  async doPressBackspace() {
    await this.getBrowser().keys('\uE003');
    return await this.getBrowser().pause(200);
  },
  doPressTabKey() {
    return this.getBrowser().keys('Tab');
  },
  doPressEnter() {
    return this.getBrowser().keys('Enter');
  },
  async doSwitchToNewTab() {
    try {
      console.log('testUtils:switching to the new wizard tab...');
      let tabs = await this.getBrowser().getWindowHandles();
      await this.getBrowser().switchToWindow(tabs[tabs.length - 1]);
    } catch (err) {
      throw new Error('Error when switching to the new browser tab ' + err);
    }
  },

  async doSwitchToTabByIndex(index) {
    try {
      let tabs = await this.getBrowser().getWindowHandles();
      await this.getBrowser().switchToWindow(tabs[index]);
    } catch (err) {
      throw new Error('Error occurred during switching to the new browser tab ' + err);
    }
  },
  async doSwitchToPrevTab() {
    try {
      let tabs = await this.getBrowser().getWindowHandles();
      return await this.getBrowser().switchToWindow(tabs[tabs.length - 2]);
    } catch (err) {
      throw new Error('Error occurred while switching to the new browser tab' + err);
    }
  },

  async doCloseAllWindowTabsAndNavigateToHome() {
    await this.doCloseAllWindowTabs();
    await this.navigateToHomePage();
  },
  // 'base.url' from browser.properties, with a trailing slash, e.g. 'http://localhost:8080/admin/'.
  getBaseUrl() {
    return BASE_URL;
  },
  async navigateToHomePage() {
    await this.getBrowser().url(this.getBaseUrl());
    await this.getBrowser().pause(500);
  },
  async doCloseAllWindowTabs(keepTitle1 = 'Enonic XP Admin', keepTitle2 = 'Settings') {
    const handles = await this.getBrowser().getWindowHandles();
    const keepTitles = [keepTitle1, keepTitle2].filter(Boolean);

    for (const handle of handles) {
      await this.getBrowser().switchToWindow(handle);
      const title = await this.getBrowser().getTitle();

      const shouldKeep = keepTitles.some((keepTitle) => title.includes(keepTitle));
      if (!shouldKeep) {
        // Closing the last remaining window would terminate the WebDriver session,
        // so keep it open - the caller navigates it to the home page afterwards:
        const remaining = await this.getBrowser().getWindowHandles();
        if (remaining.length === 1) {
          break;
        }
        await this.getBrowser().closeWindow();
        await this.getBrowser().pause(100);
      }
    }
    // After closeWindow() the driver still points to the closed window - switch to a live one:
    const remainingHandles = await this.getBrowser().getWindowHandles();
    await this.getBrowser().switchToWindow(remainingHandles[remainingHandles.length - 1]);
  },
  async saveScreenshot(name, that) {
    try {
      let screenshotsDir = path.join(__dirname, '/../build/reports/screenshots/');
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }
      await this.getBrowser().saveScreenshot(screenshotsDir + name + '.png');
      console.log('screenshot is saved ' + name);
    } catch (err) {
      return console.log('screenshot was not saved ' + err);
    }
  },
  generateRandomName(part) {
    return part + Math.round(Math.random() * 1000000);
  },
  async getDisplayedElements(selector) {
    let elements = await this.getBrowser().$$(selector);
    if (elements.length === 0) {
      return [];
    }
    let pr = elements.map((el) => el.isDisplayed());
    return await Promise.all(pr).then((result) => {
      return elements.filter((el, i) => result[i]);
    });
  },
  waitUntilDisplayed(selector, ms) {
    return this.getBrowser().waitUntil(
      () => {
        return this.getDisplayedElements(selector).then((result) => {
          return result.length > 0;
        });
      },
      {
        timeout: ms,
        timeoutMsg: 'Timeout exception. Element ' + selector + ' still not visible in: ' + ms,
      },
    );
  },
  loadUrl(url) {
    return this.getBrowser().url(url);
  },
  async saveScreen(name) {
    await this.getBrowser().saveScreen();
  },
  // Opens a section (extension) of the Settings app through the sections rail and waits until its
  // browse screen is shown: the rail link is active, the app bar shows the section title and the
  // 'Actions' toolbar is displayed. `section` is one of MenuSectionsRail.SECTION.*
  async navigateToExtension(section) {
    try {
      let menuSectionsRail = new MenuSectionsRail();
      await menuSectionsRail.waitForLoaded();
      await menuSectionsRail.clickOnSectionButton(section);
      await this.waitForSectionScreenLoaded(section);
      return menuSectionsRail;
    } catch (err) {
      let screenshot = await this.saveScreenshotUniqueName('err_navigate_extension');
      throw new Error(`'${section}' section was not opened, screenshot: ${screenshot} ` + err);
    }
  },
  // Creates a user through the user editor and returns when it is listed. For the tests that need a
  // user to exist, not for the ones that test the editor itself - those walk the steps themselves.
  //
  // `user` is what users.items.builder.buildUser() returns: { idProvider, displayName, id, email,
  // password?, roles?, groups? }. `idProvider` is the display name of a provider the user may live
  // in - required, the system ID provider takes service accounts only; when it is the one the step
  // opens with, nothing is picked. An empty or missing `password`, `roles` or `groups` skips
  // that step.
  //
  // Precondition: the Settings app is open (navigateToSettingsApp). The Users section is opened here.
  async createUser(user) {
    const usersPage = new UsersPage();
    const idProviderStep = new UserEditorIdProviderStepDialog();
    const generalStep = new UserEditorGeneralStepDialog();
    const credentialsStep = new UserEditorCredentialsStepDialog();
    const rolesStep = new UserEditorRolesStepDialog();
    const groupsStep = new UserEditorGroupsStepDialog();
    const summaryStep = new UserEditorSummaryStepDialog();
    if (!user.idProvider) {
      throw new Error(
        `createUser: '${user.displayName}' names no ID provider. A user needs one (the system ID provider takes service accounts only): buildUser({ displayName, idProvider: <display name> })`,
      );
    }
    try {
      await this.navigateToExtension(appConst.EXTENSIONS.USERS);
      await usersPage.clickOnNewButton();
      // 1. ID provider: picked only when the one shown is not the one asked for. Picked by filtering,
      // the one way that does not depend on how long the list is - a test of the combobox itself
      // walks the step on its own and picks the way it checks.
      await idProviderStep.waitForLoaded();
      if ((await idProviderStep.getSelectedIdProvider()) !== user.idProvider) {
        await idProviderStep.doFilterAndSelectIdProviderByDisplayName(user.idProvider);
      }
      await idProviderStep.clickOnNextAndWaitForGeneralStep();
      // 2. General: display name, id, email.
      await generalStep.typeDataAndClickOnNext(user);
      // 3. Credentials: a password, when there is one.
      await credentialsStep.waitForLoaded();
      if (user.password) {
        await credentialsStep.setPassword(user.password);
      }
      await credentialsStep.clickOnNextButton();
      // 4. Roles
      await rolesStep.waitForLoaded();
      if (user.roles && user.roles.length > 0) {
        await rolesStep.addRoles(user.roles);
      }
      await rolesStep.clickOnNextButton();
      // 5. Groups
      await groupsStep.waitForLoaded();
      if (user.groups && user.groups.length > 0) {
        await groupsStep.addGroups(user.groups);
      }
      await groupsStep.clickOnNextButton();
      // 6. Summary → Create; the toast confirms and the row appears.
      await summaryStep.waitForLoaded();
      await summaryStep.clickOnCreateButtonAndWaitForClosed();
      await usersPage.waitForExpectedNotificationMessage(
        appConst.userCreatedMessage(user.displayName),
      );
      await usersPage.waitForRowByDisplayNameDisplayed(user.displayName);
      return user;
    } catch (err) {
      const screenshot = await this.saveScreenshotUniqueName('err_create_user');
      throw new Error(
        `User '${user.displayName}' was not created, screenshot: ${screenshot} ` + err,
      );
    }
  },
  // Creates a service account through its editor and returns when it is listed. For the tests that
  // need an account to exist, not for the ones that test the editor itself.
  //
  // `serviceAccount` is what users.items.builder.buildServiceAccount() returns: { displayName, id,
  // email?, password?, roles?, groups? }. A service account lives in the system ID provider, so
  // there is no ID provider step: the editor opens on General. An empty or missing `password`,
  // `roles` or `groups` skips that step.
  //
  // Precondition: the Settings app is open (navigateToSettingsApp). The Service Accounts section is
  // opened here.
  async createServiceAccount(serviceAccount) {
    const serviceAccountsPage = new ServiceAccountsPage();
    const generalStep = new ServiceAccountEditorGeneralStepDialog();
    const credentialsStep = new ServiceAccountEditorCredentialsStepDialog();
    const rolesStep = new ServiceAccountEditorRolesStepDialog();
    const groupsStep = new ServiceAccountEditorGroupsStepDialog();
    const summaryStep = new ServiceAccountEditorSummaryStepDialog();
    try {
      await this.navigateToExtension(appConst.EXTENSIONS.SERVICE_ACCOUNTS);
      await serviceAccountsPage.clickOnNewButton();
      // 1. General: display name, id, email - the first step, no ID provider to pick.
      await generalStep.waitForLoaded();
      await generalStep.typeDataAndClickOnNext(serviceAccount);
      // 2. Credentials: a password, when there is one.
      await credentialsStep.waitForLoaded();
      if (serviceAccount.password) {
        await credentialsStep.setPassword(serviceAccount.password);
      }
      await credentialsStep.clickOnNextButton();
      // 3. Roles
      await rolesStep.waitForLoaded();
      if (serviceAccount.roles && serviceAccount.roles.length > 0) {
        await rolesStep.addRoles(serviceAccount.roles);
      }
      await rolesStep.clickOnNextButton();
      // 4. Groups
      await groupsStep.waitForLoaded();
      if (serviceAccount.groups && serviceAccount.groups.length > 0) {
        await groupsStep.addGroups(serviceAccount.groups);
      }
      await groupsStep.clickOnNextButton();
      // 5. Summary → Create; the toast confirms and the row appears.
      await summaryStep.waitForLoaded();
      await summaryStep.clickOnCreateButtonAndWaitForClosed();
      await serviceAccountsPage.waitForExpectedNotificationMessage(
        appConst.serviceAccountCreatedMessage(serviceAccount.displayName),
      );
      await serviceAccountsPage.waitForRowByDisplayNameDisplayed(serviceAccount.displayName);
      return serviceAccount;
    } catch (err) {
      const screenshot = await this.saveScreenshotUniqueName('err_create_service_account');
      throw new Error(
        `Service account '${serviceAccount.displayName}' was not created, screenshot: ${screenshot} ` +
          err,
      );
    }
  },
  // Creates an ID provider through its editor and returns when it is listed. For the tests that
  // need a provider to exist, not for the ones that test the editor itself.
  //
  // `idProvider` is what users.items.builder.buildIdProvider() returns: { displayName, id,
  // description?, application?, permissions? }. `application` is the display name offered in the
  // General step's selector; absent, no application is bound. `permissions` is
  // { '<principal display name>': '<appConst.ID_PROVIDER_ACCESS.*>' } added to the default ones
  // (Administrator, Users Administrator, Authenticated), which stay as they are.
  //
  // Precondition: the Settings app is open (navigateToSettingsApp). The ID Providers section is
  // opened here.
  async createIdProvider(idProvider) {
    const idProvidersPage = new IdProvidersPage();
    const generalStep = new IdProviderEditorGeneralStepDialog();
    const permissionsStep = new IdProviderEditorPermissionsStepDialog();
    const summaryStep = new IdProviderEditorSummaryStepDialog();
    try {
      await this.navigateToExtension(appConst.EXTENSIONS.ID_PROVIDERS);
      await idProvidersPage.clickOnNewButton();
      // 1. General: display name, id, description and, when given, the application.
      await generalStep.waitForLoaded();
      await generalStep.typeDataAndClickOnNext(idProvider);
      // 2. Permissions: the defaults are in place; the given principals are added with their access.
      await permissionsStep.waitForLoaded();
      for (const [displayName, access] of Object.entries(idProvider.permissions ?? {})) {
        await permissionsStep.addPrincipalWithAccess(displayName, access);
      }
      await permissionsStep.clickOnNextAndWaitForSummaryStep();
      // 3. Summary → Create; the toast confirms and the row appears.
      await summaryStep.clickOnCreateButtonAndWaitForClosed();
      await idProvidersPage.waitForExpectedNotificationMessage(
        appConst.idProviderCreatedMessage(idProvider.displayName),
      );
      await idProvidersPage.waitForRowByDisplayNameDisplayed(idProvider.displayName);
      return idProvider;
    } catch (err) {
      const screenshot = await this.saveScreenshotUniqueName('err_create_id_provider');
      throw new Error(
        `ID provider '${idProvider.displayName}' was not created, screenshot: ${screenshot} ` + err,
      );
    }
  },
  // GraphQL API - the sections' own endpoint, called from the page the browser is on with its session
  // cookie. The browser must be logged in (doLogin) and stay on the XP admin origin.

  // Posts a GraphQL request from the current page and returns { status, text } without interpreting it.
  async postGraphQl(url, query, variables) {
    return await this.getBrowser().executeAsync(
      function (url, query, variables, done) {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ query: query, variables: variables }),
        })
          .then(function (response) {
            return response.text().then(function (text) {
              done({ status: response.status, text: text });
            });
          })
          .catch(function (err) {
            done({ status: 0, text: String(err) });
          });
      },
      url,
      query,
      variables,
    );
  },

  // Sends a GraphQL request to the app's API and returns its 'data'. Throws on HTTP or GraphQL errors.
  async sendGraphQlRequest(query, variables, url = appConst.GRAPHQL_API.ID_PROVIDERS) {
    const result = await this.postGraphQl(url, query, variables);
    let body;
    try {
      body = JSON.parse(result.text);
    } catch {
      throw new Error(`GraphQL: unexpected response (${result.status}): ${result.text}`);
    }
    if (result.status !== 200 || body.errors || body.error) {
      throw new Error(`GraphQL request failed (${result.status}): ${result.text}`);
    }
    return body.data;
  },

  // The access enum the API takes ('WRITE_USERS') from the label the editor shows ('Write users',
  // appConst.ID_PROVIDER_ACCESS.*); an enum value is returned as is.
  resolveIdProviderAccess(access) {
    const byLabel = Object.keys(appConst.ID_PROVIDER_ACCESS).find(
      (name) => appConst.ID_PROVIDER_ACCESS[name] === access,
    );
    if (byLabel !== undefined) {
      return byLabel;
    }
    if (Object.keys(appConst.ID_PROVIDER_ACCESS).includes(access)) {
      return access;
    }
    throw new Error(
      `Unknown access '${access}': use a label from appConst.ID_PROVIDER_ACCESS or its name`,
    );
  },

  // The key of an ID provider application from its display name ('Standard ID Provider') or its
  // key ('com.enonic.xp.app.standardidprovider'): the installed applications are read and the text
  // is matched against both, since a display name may well contain a period.
  async resolveIdProviderApplicationKey(application) {
    const data = await this.sendGraphQlRequest(
      '{ idProviderApplications { key displayName } }',
      {},
    );
    const found =
      data.idProviderApplications.find((app) => app.key === application) ??
      data.idProviderApplications.find((app) => app.displayName === application);
    if (found === undefined) {
      throw new Error(
        `Unknown ID provider application '${application}'. Installed: ` +
          data.idProviderApplications.map((app) => `${app.displayName} (${app.key})`).join(', '),
      );
    }
    return found.key;
  },

  // Creates an ID provider through the GraphQL API instead of the editor. `idProvider` is what
  // users.items.builder.buildIdProvider() returns: { displayName, id, description?, application?,
  // permissions? }. `application` is a display name or a key. `permissions` is
  // { '<principal key>': '<access>' } - keys, since the API grants to a key - added to the defaults a
  // new provider starts from (the three the editor seeds); access is a label or an enum value.
  // Returns the provider with its 'key'.
  async createIdProviderViaApi(idProvider) {
    const name = idProvider.id ?? idProvider.name ?? idProvider.displayName;
    const application =
      idProvider.application === undefined
        ? undefined
        : await this.resolveIdProviderApplicationKey(idProvider.application);
    const defaults = await this.sendGraphQlRequest(
      '{ defaultIdProviderPermissions { principal { key } access } }',
      {},
    );
    const permissions = defaults.defaultIdProviderPermissions.map(({ principal, access }) => ({
      principal: principal.key,
      access,
    }));
    for (const [principal, access] of Object.entries(idProvider.permissions ?? {})) {
      if (!/^(user|group|role):/.test(principal)) {
        throw new Error(`A permission names a principal by key, got '${principal}'`);
      }
      permissions.push({ principal, access: this.resolveIdProviderAccess(access) });
    }
    const query = `mutation ($name: String!, $displayName: String!, $description: String, $application: String, $permissions: [IdProviderPermissionInput!]) {
      createIdProvider(name: $name, displayName: $displayName, description: $description, application: $application, permissions: $permissions) {
        key displayName
      }
    }`;
    const data = await this.sendGraphQlRequest(query, {
      name,
      displayName: idProvider.displayName,
      description: idProvider.description,
      application,
      permissions,
    });
    console.log('ID provider created via API: ' + data.createIdProvider.key);
    await this.waitForIdProviderListed(data.createIdProvider.key);
    return Object.assign({}, idProvider, { key: data.createIdProvider.key });
  },

  // Waits until the list of ID providers (the search index) holds the key. A create leaves the index
  // stale for a moment, and `createUser` / `createGroup` check the provider against that list
  // (`requireIdProvider`), so a group or user made in a provider right after it was created is
  // refused with 'No ID provider answers to [key]' until the index has caught up.
  async waitForIdProviderListed(key, ms = appConst.TIMEOUT.LONG) {
    const deadline = Date.now() + ms;
    for (;;) {
      const data = await this.sendGraphQlRequest('{ idProviders { key } }', {});
      if (data.idProviders.some((provider) => provider.key === key)) {
        return;
      }
      if (Date.now() >= deadline) {
        throw new Error(`The ID provider '${key}' is still not listed after ${ms} ms`);
      }
      await this.getBrowser().pause(300);
    }
  },

  // Deletes ID providers through the GraphQL API. `keys` is a key ('myprovider'), a list of keys,
  // or what createIdProviderViaApi() / buildIdProvider() returned (its 'key' or 'id' is taken).
  // Throws when any was not deleted - a provider that still holds users or groups is refused.
  async deleteIdProviderViaApi(keys) {
    const list = []
      .concat(keys)
      .map((item) => (typeof item === 'string' ? item : (item.key ?? item.id)));
    const query = `mutation ($keys: [String!]!) {
      deleteIdProviders(keys: $keys) { key deleted reason }
    }`;
    const data = await this.sendGraphQlRequest(query, { keys: list });
    const failed = data.deleteIdProviders.filter((item) => !item.deleted);
    if (failed.length > 0) {
      throw new Error('ID providers were not deleted: ' + JSON.stringify(failed));
    }
    console.log('ID providers deleted via API: ' + list.join(', '));
    return data.deleteIdProviders;
  },

  // The key of an ID provider from its key ('system') or its display name ('System Id Provider').
  // A key is read directly (`idProvider(key)`, a get), which sees a provider the moment it is
  // created; the list (`idProviders`) comes from the search index, which a create leaves stale for
  // a moment, so a display name is looked up with a few retries. The get is only tried for a text
  // that can be a key: the server rejects one with a space ("IdProviderKey must not contain ' '")
  // instead of answering null, and a display name like 'System Id Provider' has them.
  async resolveIdProviderKey(idProvider) {
    if (!/\s/.test(idProvider)) {
      const byKey = await this.sendGraphQlRequest(
        'query ($key: String!) { idProvider(key: $key) { key } }',
        {
          key: idProvider,
        },
      );
      if (byKey.idProvider !== null && byKey.idProvider !== undefined) {
        return byKey.idProvider.key;
      }
    }
    let providers = [];
    for (let attempt = 0; attempt < 10; attempt++) {
      const data = await this.sendGraphQlRequest('{ idProviders { key displayName } }', {});
      providers = data.idProviders;
      const found = providers.find((provider) => provider.displayName === idProvider);
      if (found !== undefined) {
        return found.key;
      }
      await this.getBrowser().pause(300);
    }
    throw new Error(
      `Unknown ID provider '${idProvider}'. Existing: ` +
        providers.map((provider) => `${provider.displayName} (${provider.key})`).join(', '),
    );
  },

  // The keys of roles from their display names ('Users App') - a principal key ('role:...') is
  // taken as is. Read once for the whole list.
  async resolveRoleKeys(roles) {
    const names = roles.filter((role) => !role.startsWith('role:'));
    if (names.length === 0) {
      return [...roles];
    }
    const data = await this.sendGraphQlRequest('{ roles { key displayName } }', {});
    return roles.map((role) => {
      if (role.startsWith('role:')) {
        return role;
      }
      const found = data.roles.find((item) => item.displayName === role);
      if (found === undefined) {
        throw new Error(
          `Unknown role '${role}': use a display name from appConst.SYSTEM_ROLES or a key 'role:...'`,
        );
      }
      return found.key;
    });
  },

  // Creates a group through the GraphQL API instead of the editor. `group` is what
  // users.items.builder.buildGroup() returns: { idProvider, displayName, id, description?, members?,
  // roles? }. `idProvider` is a display name or a key; `roles` are display names or 'role:' keys;
  // `members` are principal keys ('user:system:bob', 'group:system:editors') - the API grants
  // membership to a key, and a display name is not one. Returns the group with its 'key'.
  async createGroupViaApi(group) {
    if (!group.idProvider) {
      throw new Error(`createGroupViaApi: '${group.displayName}' names no ID provider`);
    }
    const members = group.members ?? [];
    const notKeys = members.filter((member) => !/^(user|group):/.test(member));
    if (notKeys.length > 0) {
      throw new Error(
        `createGroupViaApi: members are principal keys ('user:<provider>:<name>'), got '${notKeys.join("', '")}'`,
      );
    }
    const query = `mutation ($idProvider: String!, $name: String!, $displayName: String!, $description: String, $members: [String!], $roles: [String!]) {
      createGroup(idProvider: $idProvider, name: $name, displayName: $displayName, description: $description, members: $members, roles: $roles) {
        key displayName
      }
    }`;
    const data = await this.sendGraphQlRequest(query, {
      idProvider: await this.resolveIdProviderKey(group.idProvider),
      name: group.id ?? group.name ?? group.displayName,
      displayName: group.displayName,
      description: group.description,
      members,
      roles: await this.resolveRoleKeys(group.roles ?? []),
    });
    console.log('Group created via API: ' + data.createGroup.key);
    return Object.assign({}, group, { key: data.createGroup.key });
  },

  // Deletes principals (users, groups, roles) through the GraphQL API. `keys` is a principal key, a
  // list of them, or what a create*ViaApi() returned (its 'key' is taken). Throws when any was not
  // deleted.
  async deletePrincipalsViaApi(keys) {
    const list = [].concat(keys).map((item) => (typeof item === 'string' ? item : item.key));
    const query = `mutation ($keys: [String!]!) {
      deletePrincipals(keys: $keys) { key deleted reason }
    }`;
    const data = await this.sendGraphQlRequest(query, { keys: list });
    const failed = data.deletePrincipals.filter((item) => !item.deleted);
    if (failed.length > 0) {
      throw new Error('Principals were not deleted: ' + JSON.stringify(failed));
    }
    console.log('Principals deleted via API: ' + list.join(', '));
    return data.deletePrincipals;
  },

  deleteGroupViaApi(keys) {
    return this.deletePrincipalsViaApi(keys);
  },

  // Section-agnostic 'loaded' check for the browse screen: every section renders the same app bar
  // and toolbar, so this does not depend on a section-specific page object.
  //
  // The app bar is light DOM, so XPath serves it. The toolbar is inside the section's shadow root,
  // where Chrome cannot evaluate XPath ("#document-fragment is not a valid context node type"), so it
  // is located with CSS through webdriverio's deep selector from the section's shadow host - the
  // same way SectionPage scopes every lookup (see page_objects/section.page.js).
  async waitForSectionScreenLoaded(section, ms = appConst.TIMEOUT.MEDIUM) {
    const appBarTitle = `//header//h2[text()='${section}']`;
    await this.waitForElementDisplayed(appBarTitle, ms);

    // Light DOM: the shadow host of the section's mount. Inactive sections stay mounted with the
    // class 'hidden', hence the scoping by section id and the ':not(.hidden)'.
    const shadowHost =
      `div[data-component='SectionMount'][data-section='${this.getSectionId(section)}']:not(.hidden)` +
      " div[data-component='SectionMountHost']";
    // 'BrowseToolbar' once a section carries its own data-component (app-users#2764),
    // 'Toolbar.Container' until then (app-applications). One selector each: a deep selector must
    // not be a comma-separated list, webdriverio splits it on the commas when it re-matches the
    // element.
    const toolbars = [
      ">>> [data-component='BrowseToolbar'][aria-label='Actions']",
      ">>> [data-component='Toolbar.Container'][aria-label='Actions']",
    ];
    await this.getBrowser().waitUntil(
      async () => {
        const host = await this.getBrowser().$(shadowHost);
        if (!(await host.isExisting())) {
          return false;
        }
        for (const toolbar of toolbars) {
          if (await host.$(toolbar).isDisplayed()) {
            return true;
          }
        }
        return false;
      },
      {
        timeout: ms,
        timeoutMsg: `'${section}' section - the 'Actions' toolbar is still not displayed in: ${ms}`,
      },
    );
  },
  // The 'data-section' of a section's mount (appConst.SECTION_ID.*) from its title
  // (appConst.EXTENSIONS.*, what MenuSectionsRail.SECTION.* and the app bar show).
  getSectionId(section) {
    const key = Object.keys(appConst.EXTENSIONS).find(
      (name) => appConst.EXTENSIONS[name] === section,
    );
    if (key === undefined) {
      throw new Error(`Unknown section '${section}': not one of appConst.EXTENSIONS`);
    }
    return appConst.SECTION_ID[key];
  },
};

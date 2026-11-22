const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const userItemsBuilder = require('../libs/users.items.builder');
const BrowsePage = require('../page_objects/browse.page');
const MenuSectionsRail = require('../page_objects/menu.sections.rail');
const ServiceAccountsPage = require('../page_objects/service-accounts/service.accounts.page');
const ServiceAccountDetails = require('../page_objects/service-accounts/service.account.details');

describe("service.account.users.administrator.role.spec - an account with 'Users Administrator' may write to the Users sections: the toolbar with New and Delete in place of the read-only banner, and the Edit buttons in the details panel", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  const ROLES = [appConst.SYSTEM_ROLES.ADMIN_CONSOLE, appConst.SYSTEM_ROLES.USERS_ADMINISTRATOR];
  const NEW_ACCOUNT = userItemsBuilder.buildServiceAccount({
    displayName: userItemsBuilder.generateRandomName('account'),
    password: appConst.PASSWORD.MEDIUM,
    roles: ROLES,
  });
  const EDIT_BUTTONS = Object.values(ServiceAccountDetails.BUTTON);
  // The sections of app-users, in the order the rail lists them.
  const USERS_SECTIONS = [
    appConst.EXTENSIONS.SERVICE_ACCOUNTS,
    appConst.EXTENSIONS.USERS,
    appConst.EXTENSIONS.GROUPS,
    appConst.EXTENSIONS.ROLES,
    appConst.EXTENSIONS.ID_PROVIDERS,
  ];
  let SERVICE_ACCOUNT;
  const ITEMS = {};
  let ID_PROVIDER, EMPTY_ID_PROVIDER, USER, GROUP, ROLE;

  function browsePageOf(section) {
    const name = settingsUtils.getSectionName(section);
    return new BrowsePage({
      sectionId: appConst.SECTION_ID[name],
      pageComponent: appConst.PAGE_COMPONENT[name],
      pageName: `${section} page`,
    });
  }

  it('GIVEN SU is logged in WHEN a service account with the two roles and an item for every section have been created via the API THEN SU should be logged out', async () => {
    // 1. Log in as SU; the API is called from the XP home page with its session.
    await settingsUtils.doLogin('su', 'password');
    // 2. Create the account through the API: the editor is not what is under test here.
    SERVICE_ACCOUNT = await settingsUtils.createServiceAccountViaApi(NEW_ACCOUNT);
    assert.equal(SERVICE_ACCOUNT.key, ServiceAccountsPage.serviceAccountKey(NEW_ACCOUNT.id));
    // 3. Something to select in each of the other sections: an ID provider, a user and a group in
    //    it, a role - and a second ID provider left empty, since one that holds a user or a group
    //    cannot be deleted and keeps Delete disabled.
    ID_PROVIDER = await settingsUtils.createIdProviderViaApi(
      userItemsBuilder.buildIdProvider({
        displayName: userItemsBuilder.generateRandomName('provider'),
      }),
    );
    EMPTY_ID_PROVIDER = await settingsUtils.createIdProviderViaApi(
      userItemsBuilder.buildIdProvider({
        displayName: userItemsBuilder.generateRandomName('provider'),
      }),
    );
    USER = await settingsUtils.createUserViaApi(
      userItemsBuilder.buildUser({
        displayName: userItemsBuilder.generateRandomName('user'),
        idProvider: ID_PROVIDER.key,
      }),
    );
    GROUP = await settingsUtils.createGroupViaApi(
      userItemsBuilder.buildGroup({
        displayName: userItemsBuilder.generateRandomName('group'),
        idProvider: ID_PROVIDER.key,
      }),
    );
    ROLE = await settingsUtils.createRoleViaApi(
      userItemsBuilder.buildRole({ displayName: userItemsBuilder.generateRandomName('role') }),
    );
    ITEMS[appConst.EXTENSIONS.SERVICE_ACCOUNTS] = SERVICE_ACCOUNT.displayName;
    ITEMS[appConst.EXTENSIONS.USERS] = USER.displayName;
    ITEMS[appConst.EXTENSIONS.GROUPS] = GROUP.displayName;
    ITEMS[appConst.EXTENSIONS.ROLES] = ROLE.displayName;
    ITEMS[appConst.EXTENSIONS.ID_PROVIDERS] = EMPTY_ID_PROVIDER.displayName;
    // 4. Log out.
    await settingsUtils.doLogout();
  });

  it("GIVEN the new account is logged in WHEN 'Service Accounts' section has been opened THEN the toolbar with 'New' and 'Delete' should be displayed AND 'Read-only mode' banner should not be shown", async () => {
    let serviceAccountsPage = new ServiceAccountsPage();
    // 1. Log in as the account made above and open the section.
    await settingsUtils.navigateToSettingsApp(
      SERVICE_ACCOUNT.id,
      SERVICE_ACCOUNT.password,
      appConst.EXTENSIONS.SERVICE_ACCOUNTS,
    );
    await serviceAccountsPage.waitForLoaded();
    await settingsUtils.saveScreenshot('service_accounts_users_administrator');
    // 2. Verify the toolbar: New is enabled, Delete waits for a selection.
    assert.deepEqual(await serviceAccountsPage.getToolbarButtonLabels(), ['New', 'Delete']);
    await serviceAccountsPage.waitForNewButtonEnabled();
    await serviceAccountsPage.waitForDeleteButtonDisabled();
    // 3. Verify that there is no read-only banner.
    assert.ok(
      !(await serviceAccountsPage.isReadOnlyBannerDisplayed()),
      "'Read-only mode' banner should not be displayed for 'Users Administrator'",
    );
  });

  it("GIVEN 'Service Accounts' section is opened WHEN the new account has been clicked THEN the Edit buttons should be enabled in the details panel AND 'New' and 'Delete' should be enabled in the toolbar", async () => {
    let serviceAccountsPage = new ServiceAccountsPage();
    let serviceAccountDetails = new ServiceAccountDetails();
    // 1. Click on the account the visitor is logged in as: its details are loaded.
    await serviceAccountsPage.clickOnRowByDisplayName(SERVICE_ACCOUNT.displayName);
    await serviceAccountDetails.waitForLoaded();
    await serviceAccountDetails.waitForTitle(SERVICE_ACCOUNT.displayName);
    await serviceAccountDetails.waitForSectionDisplayed(ServiceAccountDetails.SECTION.GROUPS);
    await settingsUtils.saveScreenshot('service_account_details_users_administrator');
    // 2. Verify the two roles the account was created with.
    for (const role of ROLES) {
      await serviceAccountDetails.waitForRole(role);
    }
    // 3. Verify that every section offers its Edit button, enabled.
    assert.deepEqual(await serviceAccountDetails.getEditButtonLabels(), EDIT_BUTTONS);
    assert.deepEqual(await serviceAccountDetails.getEnabledEditButtonLabels(), EDIT_BUTTONS);
    // 4. Verify the toolbar over the selected row.
    await serviceAccountsPage.waitForNewButtonEnabled();
    await serviceAccountsPage.waitForDeleteButtonEnabled();
  });

  it("GIVEN the account is logged in WHEN an item has been selected in each section THEN 'New' and 'Delete' should be enabled in every section AND 'Read-only mode' banner should not be shown", async () => {
    let menuSectionsRail = new MenuSectionsRail();
    for (const section of USERS_SECTIONS) {
      const page = browsePageOf(section);
      // 1. Open the section by its rail item.
      await menuSectionsRail.clickOnSectionButton(section);
      await settingsUtils.waitForSectionScreenLoaded(section);
      await page.waitForLoaded();
      assert.ok(
        !(await page.isReadOnlyBannerDisplayed()),
        `'${section}' - 'Read-only mode' banner should not be displayed`,
      );
      // 2. Nothing is selected yet: New is enabled, Delete is not.
      assert.deepEqual(await page.getToolbarButtonLabels(), ['New', 'Delete'], section);
      await page.waitForNewButtonEnabled();
      // 3. Select the item made for this section: Delete gets enabled too.
      await page.clickOnRowByDisplayName(ITEMS[section]);
      await page.waitForNewButtonEnabled();
      await page.waitForDeleteButtonEnabled();
    }
    await settingsUtils.saveScreenshot('sections_users_administrator');
  });

  // Everything made here is deleted by SU, the members of the ID provider before the provider - one
  // that still holds a user or a group is refused.
  after(async () => {
    if (SERVICE_ACCOUNT === undefined) {
      return;
    }
    await settingsUtils.doLogout();
    await settingsUtils.doLogin('su', 'password');
    const principals = [SERVICE_ACCOUNT, USER, GROUP, ROLE].filter((item) => item !== undefined);
    await settingsUtils.deletePrincipalsViaApi(principals);
    const idProviders = [ID_PROVIDER, EMPTY_ID_PROVIDER].filter((item) => item !== undefined);
    if (idProviders.length > 0) {
      await settingsUtils.deleteIdProvidersViaApi(idProviders);
    }
  });
});

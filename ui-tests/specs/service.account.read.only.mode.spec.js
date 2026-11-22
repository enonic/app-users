const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const userItemsBuilder = require('../libs/users.items.builder');
const BrowsePage = require('../page_objects/browse.page');
const MenuSectionsRail = require('../page_objects/menu.sections.rail');
const ServiceAccountsPage = require('../page_objects/service-accounts/service.accounts.page');
const ServiceAccountDetails = require('../page_objects/service-accounts/service.account.details');

describe("service.account.read.only.mode.spec -an account that may open the Users sections but not write to them ('Users App' without 'Users Administrator') gets them read-only: a banner in place of the toolbar and no Edit buttons in the details panel", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  const SUPER_USER = appConst.systemUsersDisplayName.SUPER_USER;
  const ROLES = [
    appConst.SYSTEM_ROLES.ADMIN_CONSOLE,
    //appConst.SYSTEM_ROLES.CM_ADMIN,
    appConst.SYSTEM_ROLES.USERS_APP,
  ];
  const NEW_ACCOUNT = userItemsBuilder.buildServiceAccount({
    displayName: userItemsBuilder.generateRandomName('account'),
    password: appConst.PASSWORD.MEDIUM,
    roles: ROLES,
  });
  let SERVICE_ACCOUNT;
  // The sections of app-users, in the order the rail lists them: all the account may open.
  const USERS_SECTIONS = [
    appConst.EXTENSIONS.SERVICE_ACCOUNTS,
    appConst.EXTENSIONS.USERS,
    appConst.EXTENSIONS.GROUPS,
    appConst.EXTENSIONS.ROLES,
    appConst.EXTENSIONS.ID_PROVIDERS,
  ];
  const APPLICATIONS_MOUNT = `div[data-component='SectionMount'][data-section='${appConst.SECTION_ID.APPLICATIONS}']`;

  // The section's browse screen is shown read-only: the banner with its two phrases, no toolbar.
  async function assertSectionIsReadOnly(section) {
    const name = settingsUtils.getSectionName(section);
    const page = new BrowsePage({
      sectionId: appConst.SECTION_ID[name],
      pageComponent: appConst.PAGE_COMPONENT[name],
      pageName: `${section} page`,
    });
    await settingsUtils.waitForSectionScreenLoaded(section, { readOnly: true });
    await page.waitForLoadedInReadOnlyMode();
    assert.equal(
      await page.getReadOnlyBannerTitle(),
      appConst.READ_ONLY.TITLE,
      `'${section}' - the title of the read-only banner`,
    );
    assert.equal(
      await page.getReadOnlyBannerHelp(),
      appConst.READ_ONLY.HELP,
      `'${section}' - the help of the read-only banner`,
    );
    assert.ok(
      !(await page.isToolbarDisplayed()),
      `'${section}' - the toolbar should not be displayed in read-only mode`,
    );
  }

  it('GIVEN SU is logged in WHEN a service account with the three roles has been created via the API THEN SU should be logged out', async () => {
    // 1. Log in as SU; the API is called from the XP home page with its session.
    await settingsUtils.doLogin('su', 'password');
    // 2. Create the account through the API: the editor is not what is under test here.
    SERVICE_ACCOUNT = await settingsUtils.createServiceAccountViaApi(NEW_ACCOUNT);
    assert.equal(SERVICE_ACCOUNT.key, ServiceAccountsPage.serviceAccountKey(NEW_ACCOUNT.id));
    // 3. Log out.
    await settingsUtils.doLogout();
  });

  it("GIVEN the new account is logged in WHEN 'Service Accounts' section has been opened THEN the toolbar should not be displayed AND 'Read-only mode' banner should be shown in its place", async () => {
    let serviceAccountsPage = new ServiceAccountsPage();
    // 1. Log in as the account made above and open the section.
    await settingsUtils.navigateToSettingsApp(
      SERVICE_ACCOUNT.id,
      SERVICE_ACCOUNT.password,
      appConst.EXTENSIONS.SERVICE_ACCOUNTS,
      { readOnly: true },
    );
    await serviceAccountsPage.waitForLoadedInReadOnlyMode();
    await settingsUtils.saveScreenshot('service_accounts_read_only');
    // 2. Verify that there is no toolbar: no New, no Delete.
    assert.ok(
      !(await serviceAccountsPage.isToolbarDisplayed()),
      'The toolbar should not be displayed in read-only mode',
    );
    // 3. Verify the banner shown in its place.
    assert.equal(await serviceAccountsPage.getReadOnlyBannerTitle(), appConst.READ_ONLY.TITLE);
    assert.equal(await serviceAccountsPage.getReadOnlyBannerHelp(), appConst.READ_ONLY.HELP);
  });

  it("GIVEN 'Service Accounts' section is opened in read-only mode WHEN 'Super User' has been clicked THEN the details panel should be loaded without Edit buttons", async () => {
    let serviceAccountsPage = new ServiceAccountsPage();
    let serviceAccountDetails = new ServiceAccountDetails();
    // 1. Click on 'Super User': its details are loaded.
    await serviceAccountsPage.clickOnRowByDisplayName(SUPER_USER);
    await serviceAccountDetails.waitForLoaded();
    await serviceAccountDetails.waitForTitle(SUPER_USER);
    await settingsUtils.saveScreenshot('service_account_details_read_only');
    // 2. The panel shows the account - the sections are there, so a missing button is not a panel
    //    that has not rendered yet.
    await serviceAccountDetails.waitForSectionDisplayed(ServiceAccountDetails.SECTION.ROLES);
    assert.equal(await serviceAccountDetails.getLogin(), 'su');
    // 3. Verify that no section offers an Edit button.
    assert.deepEqual(
      await serviceAccountDetails.getEditButtonLabels(),
      [],
      'The details panel should show no Edit buttons in read-only mode',
    );
  });

  it('GIVEN the section is opened in read-only mode WHEN an ordinary service account has been clicked THEN the details panel should be loaded without Edit buttons', async () => {
    let serviceAccountsPage = new ServiceAccountsPage();
    let serviceAccountDetails = new ServiceAccountDetails();
    // 1. Click on the account the visitor is logged in as.
    await serviceAccountsPage.clickOnRowByDisplayName(SERVICE_ACCOUNT.displayName);
    await serviceAccountDetails.waitForTitle(SERVICE_ACCOUNT.displayName);
    await serviceAccountDetails.waitForSectionDisplayed(ServiceAccountDetails.SECTION.ROLES);
    // 2. Verify the three roles it was created with - the panel is complete.
    for (const role of ROLES) {
      await serviceAccountDetails.waitForRole(role);
    }
    // 3. Verify that no section offers an Edit button.
    assert.deepEqual(
      await serviceAccountDetails.getEditButtonLabels(),
      [],
      'The details panel should show no Edit buttons in read-only mode',
    );
  });

  // 'Applications' is not open to this account, and the platform leaves an extension out of
  // discovery for a visitor its access rules do not include: the shell is never told of it.
  it("GIVEN the account is logged in WHEN the sections rail is loaded THEN 'Applications' item should not be displayed AND only the sections of Users should be listed", async () => {
    let menuSectionsRail = new MenuSectionsRail();
    await menuSectionsRail.waitForLoaded();
    await menuSectionsRail.waitForSectionButtonNotDisplayed(appConst.EXTENSIONS.APPLICATIONS);
    assert.deepEqual(await menuSectionsRail.getSectionNames(), USERS_SECTIONS);
  });

  it("GIVEN the account is logged in WHEN each item of the sections rail has been clicked THEN 'Read-only mode' banner should be shown in every section", async () => {
    let menuSectionsRail = new MenuSectionsRail();
    for (const section of USERS_SECTIONS) {
      // 1. Click on the rail item: it becomes the active one.
      await menuSectionsRail.clickOnSectionButton(section);
      // 2. The url follows, and the section is read-only.
      assert.equal(await settingsUtils.getBrowser().getUrl(), settingsUtils.getSectionUrl(section));
      await assertSectionIsReadOnly(section);
    }
    await settingsUtils.saveScreenshot('sections_read_only_by_rail');
  });

  it("GIVEN the account is logged in WHEN each section has been opened by its direct link THEN the section should be active in the rail AND 'Read-only mode' banner should be shown in it", async () => {
    for (const section of USERS_SECTIONS) {
      // 1. Load the app at the section's link, e.g. '.../com.enonic.xp.app.settings/main#/roles'.
      const menuSectionsRail = await settingsUtils.openSectionByUrl(section);
      // 2. The link lands on its section, and the section is read-only.
      await menuSectionsRail.waitForSectionActive(section);
      await assertSectionIsReadOnly(section);
    }
    await settingsUtils.saveScreenshot('sections_read_only_by_url');
  });

  // A path no section answers to goes to the first one, and to this account 'applications' is such
  // a path.
  it("GIVEN the account is logged in WHEN the direct link to 'Applications' has been opened THEN the section should not be mounted AND the first section should be opened instead", async () => {
    const menuSectionsRail = await settingsUtils.openSectionByUrl(appConst.EXTENSIONS.APPLICATIONS);
    await menuSectionsRail.waitForSectionActive(USERS_SECTIONS[0]);
    await assertSectionIsReadOnly(USERS_SECTIONS[0]);
    await settingsUtils.saveScreenshot('applications_link_read_only_account');
    await menuSectionsRail.waitForSectionButtonNotDisplayed(appConst.EXTENSIONS.APPLICATIONS);
    const mounts = await settingsUtils.getBrowser().$$(APPLICATIONS_MOUNT);
    assert.equal(mounts.length, 0, "'Applications' section should not be mounted");
  });

  // The account is deleted by SU: the one made here may not delete anything, itself included.
  after(async () => {
    if (SERVICE_ACCOUNT === undefined) {
      return;
    }
    await settingsUtils.doLogout();
    await settingsUtils.doLogin('su', 'password');
    await settingsUtils.deletePrincipalsViaApi(SERVICE_ACCOUNT);
  });
});

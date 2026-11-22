const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const MenuSectionsRail = require('../page_objects/menu.sections.rail');
const AppShell = require('../page_objects/app.shell');
const ServiceAccountsPage = require('../page_objects/service-accounts/service.accounts.page');
const ServiceAccountDetails = require('../page_objects/service-accounts/service.account.details');

describe("browser.history.navigation.spec - the browser's Back and Forward move between the sections and between the sub-paths of a section, and the rail, the app bar and the section follow the url", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  const ROLES = appConst.EXTENSIONS.ROLES;
  const SERVICE_ACCOUNTS = appConst.EXTENSIONS.SERVICE_ACCOUNTS;
  const GROUPS = appConst.EXTENSIONS.GROUPS;
  const FIRST_SECTION = appConst.EXTENSIONS.APPLICATIONS;
  const SUPER_USER = appConst.systemUsersDisplayName.SUPER_USER;
  const SUPER_USER_KEY = ServiceAccountsPage.serviceAccountKey('su');
  // The url with 'Super User' selected in 'Service Accounts'.
  let ITEM_URL;

  // The url names `section`, and the rail, the app bar and the mounts agree with it.
  async function assertSectionIsShown(section, url = settingsUtils.getSectionUrl(section)) {
    const menuSectionsRail = new MenuSectionsRail();
    const appShell = new AppShell();
    await appShell.waitForUrl(url);
    await menuSectionsRail.waitForSectionActive(section);
    assert.deepEqual(await menuSectionsRail.getActiveSectionNames(), [section]);
    await appShell.waitForAppBarTitle(section);
    await appShell.waitForDocumentTitle(appConst.documentTitle(section));
    await settingsUtils.waitForSectionScreenLoaded(section);
  }

  async function assertSuperUserIsSelected() {
    await new ServiceAccountDetails().waitForTitle(SUPER_USER);
    await new ServiceAccountsPage().waitForRowHighlighted(SUPER_USER_KEY);
  }

  it("GIVEN 'Roles', 'Service Accounts' with an item selected and 'Groups' have been opened in turn WHEN Back has been pressed THEN each step should be undone in reverse order: the item in 'Service Accounts', 'Roles', the section the app opened on", async () => {
    let menuSectionsRail = new MenuSectionsRail();
    let serviceAccountsPage = new ServiceAccountsPage();
    let browser = settingsUtils.getBrowser();
    // 1. Walk: the first section (opened by default) → Roles → Service Accounts, 'Super User'
    //    selected → Groups.
    await settingsUtils.navigateToSettingsApp('su', 'password', ROLES);
    await menuSectionsRail.clickOnSectionButton(SERVICE_ACCOUNTS);
    await assertSectionIsShown(SERVICE_ACCOUNTS);
    await serviceAccountsPage.clickOnRowByDisplayName(SUPER_USER);
    await assertSuperUserIsSelected();
    ITEM_URL = await browser.getUrl();
    assert.notEqual(ITEM_URL, settingsUtils.getSectionUrl(SERVICE_ACCOUNTS));
    await menuSectionsRail.clickOnSectionButton(GROUPS);
    await assertSectionIsShown(GROUPS);
    // 2. Back: 'Service Accounts' at the sub-path it was left at, the item selected.
    await browser.back();
    await assertSectionIsShown(SERVICE_ACCOUNTS, ITEM_URL);
    await assertSuperUserIsSelected();
    await settingsUtils.saveScreenshot('history_back_to_item');
    // 3. Back: 'Roles'.
    await browser.back();
    await assertSectionIsShown(ROLES);
    // 4. Back: the section the app opened on.
    await browser.back();
    await assertSectionIsShown(FIRST_SECTION);
  });

  it("GIVEN Back has been pressed down to the first section WHEN Forward has been pressed THEN each step should be redone: 'Roles', the item in 'Service Accounts', 'Groups'", async () => {
    let browser = settingsUtils.getBrowser();
    // 1. Forward: 'Roles'.
    await browser.forward();
    await assertSectionIsShown(ROLES);
    // 2. Forward: 'Service Accounts' with the item selected again.
    await browser.forward();
    await assertSectionIsShown(SERVICE_ACCOUNTS, ITEM_URL);
    await assertSuperUserIsSelected();
    // 3. Forward: 'Groups'.
    await browser.forward();
    await assertSectionIsShown(GROUPS);
  });

  // The sections walked through were mounted once and kept: the history moved between them without
  // a remount, so each is still there, hidden.
  it('GIVEN Back and Forward have been pressed across the sections WHEN the mounts are read THEN every section walked through should be mounted AND only the last one shown', async () => {
    let appShell = new AppShell();
    const mounts = await appShell.getSectionMounts();
    const shown = mounts.filter((mount) => mount.displayed).map((mount) => mount.section);
    assert.deepEqual(shown, [appConst.SECTION_ID.GROUPS]);
    for (const sectionId of [
      appConst.SECTION_ID.APPLICATIONS,
      appConst.SECTION_ID.ROLES,
      appConst.SECTION_ID.SERVICE_ACCOUNTS,
    ]) {
      assert.deepEqual(await appShell.getSectionMount(sectionId), {
        section: sectionId,
        active: false,
        displayed: false,
      });
    }
  });
});

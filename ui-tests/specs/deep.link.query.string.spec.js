const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const MenuSectionsRail = require('../page_objects/menu.sections.rail');
const AppShell = require('../page_objects/app.shell');
const ServiceAccountsPage = require('../page_objects/service-accounts/service.accounts.page');
const ServiceAccountDetails = require('../page_objects/service-accounts/service.account.details');

describe("deep.link.query.string.spec - a deep link '#/<section>/<sub-path>?<query>' opens its section with the sub-path and the query string kept verbatim, and the shell remembers both when the section is left", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  const ROLES = appConst.EXTENSIONS.ROLES;
  const SERVICE_ACCOUNTS = appConst.EXTENSIONS.SERVICE_ACCOUNTS;
  const SUPER_USER = appConst.systemUsersDisplayName.SUPER_USER;
  const SUPER_USER_KEY = ServiceAccountsPage.serviceAccountKey('su');
  // A query string no section reads: the shell is to carry it, not to understand it.
  const QUERY = '?foo=bar&x=1';
  const hashOf = (url) => url.slice(url.indexOf('#'));
  // '#/service-accounts/<the item>?foo=bar&x=1'
  let ITEM_HASH;

  async function assertSuperUserIsSelected() {
    await new ServiceAccountDetails().waitForTitle(SUPER_USER);
    await new ServiceAccountsPage().waitForRowHighlighted(SUPER_USER_KEY);
  }

  it('GIVEN the url of a selected item with a query string added WHEN the Settings app has been loaded at that url THEN the section should be opened with the item selected AND the url should be kept as it was typed', async () => {
    let appShell = new AppShell();
    let serviceAccountsPage = new ServiceAccountsPage();
    // 1. Select 'Super User' to learn the sub-path the section gives its item.
    await settingsUtils.navigateToSettingsApp('su', 'password', SERVICE_ACCOUNTS);
    await serviceAccountsPage.clickOnRowByDisplayName(SUPER_USER);
    await assertSuperUserIsSelected();
    ITEM_HASH = hashOf(await settingsUtils.getBrowser().getUrl()) + QUERY;
    // 2. Load the page anew at that sub-path with the query string.
    const menuSectionsRail = await settingsUtils.openSettingsByHash(ITEM_HASH);
    // 3. Verify the section, the item and that the url was not rewritten.
    await menuSectionsRail.waitForSectionActive(SERVICE_ACCOUNTS);
    await settingsUtils.waitForSectionScreenLoaded(SERVICE_ACCOUNTS);
    await assertSuperUserIsSelected();
    await appShell.waitForUrl(settingsUtils.getSettingsUrl() + ITEM_HASH);
    await settingsUtils.saveScreenshot('deep_link_query_string');
  });

  it('GIVEN a section is opened at a sub-path with a query string WHEN another section has been opened and the first one returned to THEN its rail item should carry the sub-path with the query string AND lead back to the same url', async () => {
    let appShell = new AppShell();
    let menuSectionsRail = new MenuSectionsRail();
    // 1. Leave the section.
    await menuSectionsRail.clickOnSectionButton(ROLES);
    await settingsUtils.waitForSectionScreenLoaded(ROLES);
    await appShell.waitForUrl(settingsUtils.getSectionUrl(ROLES));
    // 2. Verify that the rail item remembers the query string along with the sub-path.
    assert.equal(await menuSectionsRail.getSectionHref(SERVICE_ACCOUNTS), ITEM_HASH);
    // 3. Return: the same url, the same item.
    await menuSectionsRail.clickOnSectionButton(SERVICE_ACCOUNTS);
    await appShell.waitForUrl(settingsUtils.getSettingsUrl() + ITEM_HASH);
    await assertSuperUserIsSelected();
  });

  it("GIVEN SU is logged in WHEN the Settings app has been loaded at a section's root with a query string THEN that section should be opened AND the query string should be kept", async () => {
    let appShell = new AppShell();
    const hash = `#/${appConst.SECTION_PATH.ROLES}${QUERY}`;
    const menuSectionsRail = await settingsUtils.openSettingsByHash(hash);
    await menuSectionsRail.waitForSectionActive(ROLES);
    await settingsUtils.waitForSectionScreenLoaded(ROLES);
    await appShell.waitForAppBarTitle(ROLES);
    await appShell.waitForUrl(settingsUtils.getSettingsUrl() + hash);
  });
});

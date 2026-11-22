const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const MenuSectionsRail = require('../page_objects/menu.sections.rail');
const AppShell = require('../page_objects/app.shell');
const ServiceAccountsPage = require('../page_objects/service-accounts/service.accounts.page');
const ServiceAccountDetails = require('../page_objects/service-accounts/service.account.details');

describe('sections.keep.alive.spec - a section left for another stays mounted, hidden, with its state, and the shell remembers its sub-path: the rail item leads back to where the visitor was, and a click on the active item resets it', function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  const SERVICE_ACCOUNTS = appConst.EXTENSIONS.SERVICE_ACCOUNTS;
  const ROLES = appConst.EXTENSIONS.ROLES;
  const SERVICE_ACCOUNTS_ID = appConst.SECTION_ID.SERVICE_ACCOUNTS;
  const SUPER_USER = appConst.systemUsersDisplayName.SUPER_USER;
  const SUPER_USER_KEY = ServiceAccountsPage.serviceAccountKey('su');
  // The term the list is narrowed by: the section's own state, which the url does not carry.
  const TERM = 'su';
  // The url with 'Super User' selected: the section's path, then the sub-path the section owns.
  let ITEM_URL;

  // '#/service-accounts/...' of a url: what a rail item carries as its href.
  const hashOf = (url) => url.slice(url.indexOf('#'));

  // The section is where the visitor left it: the term in force, the row highlighted, its details.
  async function assertSuperUserIsSelected() {
    const serviceAccountsPage = new ServiceAccountsPage();
    const serviceAccountDetails = new ServiceAccountDetails();
    await settingsUtils.waitForSectionScreenLoaded(SERVICE_ACCOUNTS);
    await serviceAccountDetails.waitForTitle(SUPER_USER);
    await serviceAccountsPage.waitForRowHighlighted(SUPER_USER_KEY);
    assert.deepEqual(await serviceAccountsPage.getSearchTerms(), [TERM]);
  }

  it("GIVEN an item is selected in a narrowed list of 'Service Accounts' WHEN another section has been opened THEN 'Service Accounts' should stay mounted, hidden AND its rail item should lead to the selected item", async () => {
    let menuSectionsRail = new MenuSectionsRail();
    let appShell = new AppShell();
    let serviceAccountsPage = new ServiceAccountsPage();
    await settingsUtils.navigateToSettingsApp('su', 'password', SERVICE_ACCOUNTS);
    // 1. Narrow the list and select 'Super User': the url gets the item's sub-path.
    await serviceAccountsPage.addSearchTerm(TERM);
    await serviceAccountsPage.clickOnRowByDisplayName(SUPER_USER);
    await assertSuperUserIsSelected();
    ITEM_URL = await settingsUtils.getBrowser().getUrl();
    const sectionUrl = settingsUtils.getSectionUrl(SERVICE_ACCOUNTS);
    assert.ok(
      ITEM_URL.startsWith(sectionUrl + '/') && ITEM_URL.length > sectionUrl.length + 1,
      `The url should carry a sub-path after the section's own, got '${ITEM_URL}'`,
    );
    // 2. The item of the section shown leads to its root - a click on it is a reset.
    assert.equal(await menuSectionsRail.getSectionHref(SERVICE_ACCOUNTS), hashOf(sectionUrl));
    // 3. Open another section.
    await menuSectionsRail.clickOnSectionButton(ROLES);
    await settingsUtils.waitForSectionScreenLoaded(ROLES);
    await appShell.waitForUrl(settingsUtils.getSectionUrl(ROLES));
    await settingsUtils.saveScreenshot('keep_alive_left_section');
    // 4. Verify that the section left is still mounted, and hidden.
    assert.deepEqual(await appShell.getSectionMount(SERVICE_ACCOUNTS_ID), {
      section: SERVICE_ACCOUNTS_ID,
      active: false,
      displayed: false,
    });
    // 5. Verify that its rail item now leads to where the visitor was.
    assert.equal(await menuSectionsRail.getSectionHref(SERVICE_ACCOUNTS), hashOf(ITEM_URL));
  });

  it("GIVEN 'Service Accounts' was left with an item selected WHEN its rail item has been clicked THEN the url should be the one it was left at AND the search term, the selected row and its details should be as they were", async () => {
    let menuSectionsRail = new MenuSectionsRail();
    let appShell = new AppShell();
    // 1. Return to the section.
    await menuSectionsRail.clickOnSectionButton(SERVICE_ACCOUNTS);
    // 2. Verify the url and the state of the section.
    await appShell.waitForUrl(ITEM_URL);
    await assertSuperUserIsSelected();
    await settingsUtils.saveScreenshot('keep_alive_returned');
    // 3. The section left in its turn is the one kept hidden now.
    assert.deepEqual(await appShell.getSectionMount(appConst.SECTION_ID.ROLES), {
      section: appConst.SECTION_ID.ROLES,
      active: false,
      displayed: false,
    });
  });

  it("GIVEN an item is selected in 'Service Accounts' WHEN the rail item of the section, already active, has been clicked THEN the url should be reset to the section's root AND the details panel should show no item", async () => {
    let menuSectionsRail = new MenuSectionsRail();
    let appShell = new AppShell();
    let serviceAccountsPage = new ServiceAccountsPage();
    let serviceAccountDetails = new ServiceAccountDetails();
    // 1. Click on the active item.
    await menuSectionsRail.clickOnSectionButton(SERVICE_ACCOUNTS);
    // 2. Verify that the sub-path is gone and nothing is selected.
    await appShell.waitForUrl(settingsUtils.getSectionUrl(SERVICE_ACCOUNTS));
    assert.equal(
      await serviceAccountDetails.waitForEmptyMessage(),
      appConst.DETAILS_MESSAGE.SELECT_AN_ITEM,
    );
    assert.ok(
      !(await serviceAccountsPage.isRowHighlighted(SUPER_USER_KEY)),
      `'${SUPER_USER}' should not be highlighted after the reset`,
    );
    // 3. The reset is of the path alone: the section was not remounted, its search term stands.
    assert.deepEqual(await serviceAccountsPage.getSearchTerms(), [TERM]);
  });

  it('GIVEN the url of a selected item WHEN the Settings app has been loaded anew at that url THEN the item should be selected AND its details should be shown', async () => {
    let serviceAccountsPage = new ServiceAccountsPage();
    let serviceAccountDetails = new ServiceAccountDetails();
    let appShell = new AppShell();
    // 1. Load the page at the deep link: nothing of the earlier visit is left.
    await settingsUtils.openSettingsByHash(hashOf(ITEM_URL));
    await settingsUtils.waitForSectionScreenLoaded(SERVICE_ACCOUNTS);
    // 2. Verify that the shell handed the sub-path to the section verbatim: the item is selected.
    await serviceAccountDetails.waitForTitle(SUPER_USER);
    await serviceAccountsPage.waitForRowHighlighted(SUPER_USER_KEY);
    await appShell.waitForUrl(ITEM_URL);
    // 3. A fresh mount: the search term of the earlier visit is gone.
    assert.deepEqual(await serviceAccountsPage.getSearchTerms(), []);
  });
});

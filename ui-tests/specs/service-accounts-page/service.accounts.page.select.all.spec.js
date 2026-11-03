/**
 * Created on 03.11.2026
 */
const webDriverHelper = require('../../libs/WebDriverHelper');
const settingsUtils = require('../../libs/settings.utils');
const appConst = require('../../libs/app_const');
const assert = require('node:assert');
const userItemsBuilder = require('../../libs/users.items.builder');
const ServiceAccountsPage = require('../../page_objects/service-accounts/service.accounts.page');

describe("service.accounts.page.select.all.spec - Select all ticks what the operator may act on and nothing else: an account made here joins the selection, the built-in 'Super User' and 'Anonymous User' are left out of it", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  // The two built-in accounts of the system ID provider every instance lists; neither can be
  // deleted, so their checkboxes are greyed.
  const SUPER_USER = appConst.systemUsersDisplayName.SUPER_USER;
  const ANONYMOUS_USER = appConst.systemUsersDisplayName.ANONYMOUS_USER;
  const SUPER_USER_KEY = ServiceAccountsPage.serviceAccountKey('su');
  const ANONYMOUS_USER_KEY = ServiceAccountsPage.serviceAccountKey('anonymous');
  const NEW_ACCOUNT = userItemsBuilder.buildServiceAccount({
    displayName: userItemsBuilder.generateRandomName('account'),
  });
  let SERVICE_ACCOUNT;

  // 'Select all' ticks the rows the section lets the operator act on, so the one row made here is
  // ticked while the two built-in accounts stay out, their checkboxes greyed as they were before
  // the click.
  it("GIVEN a service account has been created via the API WHEN Select all has been clicked THEN the new account should be ticked AND 'Super User' and 'Anonymous User' should not be AND their checkboxes should stay disabled", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.SERVICE_ACCOUNTS);
    let serviceAccountsPage = new ServiceAccountsPage();
    // 1. Create the account through the API: the editor is not what is under test here.
    SERVICE_ACCOUNT = await settingsUtils.createServiceAccountViaApi(NEW_ACCOUNT);
    // 2. The list was read before the account existed, so it is re-read rather than waited on.
    await serviceAccountsPage.clickOnRefreshButton();
    await serviceAccountsPage.waitForRowDisplayed(SERVICE_ACCOUNT.key);
    await serviceAccountsPage.waitForRowByDisplayNameDisplayed(SUPER_USER);
    await serviceAccountsPage.waitForRowByDisplayNameDisplayed(ANONYMOUS_USER);
    // 3. Nothing is ticked yet, and the built-in accounts' checkboxes are greyed from the start.
    assert.ok(
      !(await serviceAccountsPage.isSelectAllCheckboxSelected()),
      'Select all should start unticked',
    );
    await serviceAccountsPage.waitForDeleteButtonDisabled();
    assert.ok(
      !(await serviceAccountsPage.isRowCheckboxEnabled(SUPER_USER_KEY)),
      "The checkbox of 'Super User' should be disabled before the click",
    );
    assert.ok(
      !(await serviceAccountsPage.isRowCheckboxEnabled(ANONYMOUS_USER_KEY)),
      "The checkbox of 'Anonymous User' should be disabled before the click",
    );
    // 4. Click on Select all.
    await serviceAccountsPage.clickOnSelectAllCheckbox();
    await settingsUtils.saveScreenshot('service_accounts_select_all');
    // 5. Verify that the account made here is ticked.
    assert.ok(
      await serviceAccountsPage.isRowChecked(SERVICE_ACCOUNT.key),
      `The account '${SERVICE_ACCOUNT.displayName}' should be ticked`,
    );
    // 6. Verify that neither built-in account is - and that their checkboxes are still the greyed
    //    ones, which is why Select all passed them by.
    assert.ok(
      !(await serviceAccountsPage.isRowChecked(SUPER_USER_KEY)),
      "'Super User' should be left out of the selection",
    );
    assert.ok(
      !(await serviceAccountsPage.isRowCheckboxEnabled(SUPER_USER_KEY)),
      "The checkbox of 'Super User' should stay disabled",
    );
    assert.ok(
      !(await serviceAccountsPage.isRowChecked(ANONYMOUS_USER_KEY)),
      "'Anonymous User' should be left out of the selection",
    );
    assert.ok(
      !(await serviceAccountsPage.isRowCheckboxEnabled(ANONYMOUS_USER_KEY)),
      "The checkbox of 'Anonymous User' should stay disabled",
    );
    // 7. The header's own checkbox reads as ticked all the same: the rows it cannot tick do not
    //    count against it. Every ticked row may be deleted, so Delete is enabled.
    assert.ok(
      await serviceAccountsPage.isSelectAllCheckboxSelected(),
      'Select all should be ticked once every selectable account is',
    );
    await serviceAccountsPage.waitForDeleteButtonEnabled();
    // 8. A second click takes every tick back: the account made here is unticked, the built-in
    //    ones are as they were.
    //
    //    Nothing is asserted about Delete here: the list keeps the last ticked row highlighted,
    //    with its details shown, and the toolbar acts on the highlighted row while nothing is
    //    ticked, so Delete stays enabled over it.
    await serviceAccountsPage.clickOnSelectAllCheckbox();
    assert.ok(
      !(await serviceAccountsPage.isSelectAllCheckboxSelected()),
      'Select all should be unticked by the second click',
    );
    assert.ok(
      !(await serviceAccountsPage.isRowChecked(SERVICE_ACCOUNT.key)),
      `The account '${SERVICE_ACCOUNT.displayName}' should be unticked`,
    );
    assert.ok(
      !(await serviceAccountsPage.isRowChecked(SUPER_USER_KEY)),
      "'Super User' should still be unticked",
    );
  });

  beforeEach(async () => {
    await settingsUtils.navigateToSettingsApp();
  });
  afterEach(() => settingsUtils.doCloseAllWindowTabsAndNavigateToHome());
  before(async () => {
    if (typeof browser !== 'undefined') {
      await settingsUtils
        .getBrowser()
        .setWindowSize(appConst.BROWSER_WIDTH, appConst.BROWSER_HEIGHT);
    }
    return console.log('specification starting: ' + this.title);
  });
  after(async () => {
    if (SERVICE_ACCOUNT !== undefined) {
      await settingsUtils.deletePrincipalsViaApi(SERVICE_ACCOUNT).catch((err) => {
        console.log(`'${SERVICE_ACCOUNT.displayName}' was not cleaned up: ` + err);
      });
    }
  });
});

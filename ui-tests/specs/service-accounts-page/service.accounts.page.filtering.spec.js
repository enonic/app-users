/**
 * Created on 03.11.2026
 */
const webDriverHelper = require('../../libs/WebDriverHelper');
const settingsUtils = require('../../libs/settings.utils');
const appConst = require('../../libs/app_const');
const assert = require('node:assert');
const ServiceAccountsPage = require('../../page_objects/service-accounts/service.accounts.page');
const ServiceAccountDetails = require('../../page_objects/service-accounts/service.account.details');
const ConfirmationDialog = require('../../page_objects/confirmation.dialog');
const userItemsBuilder = require('../../libs/users.items.builder');

describe('service.accounts.page.filtering.spec - Service Accounts page: the search over the display name, the ID and the email of an account made in the editor, every term at once and each alone, and a delete through the row menu in the narrowed list', function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  const SUPER_USER = appConst.systemUsersDisplayName.SUPER_USER;
  const SUFFIX = userItemsBuilder.generateRandomNumber();
  const DISPLAY_NAME = `account${SUFFIX}`;
  const ID = `sa-${SUFFIX}`;
  const EMAIL = `mail${SUFFIX}@gmail.com`;
  // Matches no field of any account: added over the three terms, it proves every term in force
  // must match, since the account the three match alone disappears with it.
  const NO_MATCH = `nomatch${SUFFIX}`;
  let SERVICE_ACCOUNT;

  // The search matches any of the three fields, and every term in force must match: the three
  // terms together leave the account alone in the list.
  it('GIVEN a new service account with its own display name, ID and email has been created in the editor WHEN the three have been entered as terms THEN that account alone should be listed AND WHEN a term matching nothing has been added THEN no account should be listed', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.SERVICE_ACCOUNTS);
    let serviceAccountsPage = new ServiceAccountsPage();
    await serviceAccountsPage.waitForRowByDisplayNameDisplayed(SUPER_USER);
    // 1. Create the account in the editor (not via the API): the General step takes the display
    //    name, the ID typed over the derived one, and the email; the other steps are passed.
    SERVICE_ACCOUNT = await settingsUtils.createServiceAccount(
      userItemsBuilder.buildServiceAccount({ displayName: DISPLAY_NAME, id: ID, email: EMAIL }),
    );
    await serviceAccountsPage.waitForRowByDisplayNameDisplayed(DISPLAY_NAME);
    assert.equal(
      await serviceAccountsPage.getServiceAccountNameByDisplayName(DISPLAY_NAME),
      ID,
      'The row should show the ID typed in the editor under the display name',
    );
    // 2. The display name, the email and the ID entered one after another: three tags, and the
    //    account is still the one listed - every term matches it, nothing else matches all three.
    await serviceAccountsPage.addSearchTerm(DISPLAY_NAME);
    await serviceAccountsPage.waitForRowByDisplayNameNotDisplayed(SUPER_USER);
    await serviceAccountsPage.addSearchTerm(EMAIL);
    await serviceAccountsPage.addSearchTerm(ID);
    await settingsUtils.saveScreenshot('service_accounts_search_three_terms');
    assert.deepEqual(await serviceAccountsPage.getSearchTerms(), [DISPLAY_NAME, EMAIL, ID]);
    assert.deepEqual(
      await serviceAccountsPage.getServiceAccountDisplayNames(),
      [DISPLAY_NAME],
      'The new account alone should match the three terms',
    );
    assert.equal(
      await serviceAccountsPage.getListMessage(),
      undefined,
      'No message should be shown',
    );
    // 3. A fourth term that matches nothing, over the three that match the account: the terms are
    //    combined with AND, so the account goes and the list says nothing matches. (Combined with
    //    OR, the three would keep it listed - which is what this step tells apart.)
    await serviceAccountsPage.addSearchTerm(NO_MATCH);
    await serviceAccountsPage.waitForRowByDisplayNameNotDisplayed(DISPLAY_NAME);
    await settingsUtils.saveScreenshot('service_accounts_search_term_matching_nothing');
    assert.deepEqual(await serviceAccountsPage.getSearchTerms(), [
      DISPLAY_NAME,
      EMAIL,
      ID,
      NO_MATCH,
    ]);
    assert.deepEqual(
      await serviceAccountsPage.getServiceAccountDisplayNames(),
      [],
      'No account should match a term that matches nothing',
    );
    assert.equal(
      await serviceAccountsPage.getListMessage(),
      appConst.LIST_MESSAGE.NOTHING_MATCHES,
      "The list should read 'Nothing matches the search'",
    );
    // 4. That term taken back: the account is listed again, alone, under the three terms.
    await serviceAccountsPage.removeSearchTerm(NO_MATCH);
    await serviceAccountsPage.waitForRowByDisplayNameDisplayed(DISPLAY_NAME);
    assert.deepEqual(await serviceAccountsPage.getServiceAccountDisplayNames(), [DISPLAY_NAME]);
    // 5. The three tags taken back one by one: the list is whole again.
    await serviceAccountsPage.removeSearchTerm(ID);
    await serviceAccountsPage.removeSearchTerm(EMAIL);
    await serviceAccountsPage.removeSearchTerm(DISPLAY_NAME);
    assert.deepEqual(await serviceAccountsPage.getSearchTerms(), [], 'No term should be left');
    await serviceAccountsPage.waitForRowByDisplayNameDisplayed(SUPER_USER);
  });

  it('WHEN the ID of the new service account has been entered in the search input THEN that account alone should be listed', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.SERVICE_ACCOUNTS);
    let serviceAccountsPage = new ServiceAccountsPage();
    await serviceAccountsPage.waitForRowByDisplayNameDisplayed(DISPLAY_NAME);
    // 1. The ID, which the display name and the email do not contain, leaves the account alone.
    await serviceAccountsPage.addSearchTerm(ID);
    await serviceAccountsPage.waitForRowByDisplayNameNotDisplayed(SUPER_USER);
    await settingsUtils.saveScreenshot('service_accounts_search_by_id');
    assert.deepEqual(await serviceAccountsPage.getSearchTerms(), [ID]);
    assert.deepEqual(
      await serviceAccountsPage.getServiceAccountDisplayNames(),
      [DISPLAY_NAME],
      'The search by ID should leave the new account alone',
    );
    assert.equal(await serviceAccountsPage.getServiceAccountNameByDisplayName(DISPLAY_NAME), ID);
  });

  it('WHEN the email of the new service account has been entered in the search input THEN that account alone should be listed', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.SERVICE_ACCOUNTS);
    let serviceAccountsPage = new ServiceAccountsPage();
    await serviceAccountsPage.waitForRowByDisplayNameDisplayed(DISPLAY_NAME);
    // 1. The email, shown in no row, is searched all the same: the account alone is left.
    await serviceAccountsPage.addSearchTerm(EMAIL);
    await serviceAccountsPage.waitForRowByDisplayNameNotDisplayed(SUPER_USER);
    await settingsUtils.saveScreenshot('service_accounts_search_by_email');
    assert.deepEqual(await serviceAccountsPage.getSearchTerms(), [EMAIL]);
    assert.deepEqual(
      await serviceAccountsPage.getServiceAccountDisplayNames(),
      [DISPLAY_NAME],
      'The search by email should leave the new account alone',
    );
  });

  // Select all ticks the rows the list shows - the one the email leaves - and the row menu offers
  // Delete over the ticked rows, the same as the toolbar. Once the account is gone the term is
  // still in force and matches nothing: Select all has nothing to tick and the list says so.
  // 'Clear the filter' brings the whole list back, the built-in accounts with it, and the details
  // panel, with nothing selected, asks for a selection.
  it("GIVEN the email of the new service account has been entered AND Select all has been clicked WHEN the account has been deleted through the row menu THEN Select all should be unticked AND the list empty AND WHEN the filter has been cleared THEN 'Super User' should be listed again AND the details should ask for a selection", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.SERVICE_ACCOUNTS);
    let serviceAccountsPage = new ServiceAccountsPage();
    let serviceAccountDetails = new ServiceAccountDetails();
    let confirmationDialog = new ConfirmationDialog(appConst.SECTION_ID.SERVICE_ACCOUNTS);
    await serviceAccountsPage.waitForRowByDisplayNameDisplayed(DISPLAY_NAME);
    // 1. Narrow the list to the account by its email.
    await serviceAccountsPage.addSearchTerm(EMAIL);
    await serviceAccountsPage.waitForRowByDisplayNameNotDisplayed(SUPER_USER);
    assert.deepEqual(await serviceAccountsPage.getServiceAccountDisplayNames(), [DISPLAY_NAME]);
    // 2. Select all ticks the one row the list shows: Delete gets enabled.
    await serviceAccountsPage.waitForDeleteButtonDisabled();
    await serviceAccountsPage.clickOnSelectAllCheckbox();
    assert.ok(
      await serviceAccountsPage.isRowChecked(ServiceAccountsPage.serviceAccountKey(ID)),
      `'${DISPLAY_NAME}' should be ticked`,
    );
    assert.ok(
      await serviceAccountsPage.isSelectAllCheckboxSelected(),
      'Select all should be ticked',
    );
    await serviceAccountsPage.waitForDeleteButtonEnabled();
    // 3. Delete in the row menu: the confirmation names the account by its display name, and the
    //    gate wants its ID - the login the server knows it by - typed back.
    await serviceAccountsPage.openContextMenu(DISPLAY_NAME);
    await settingsUtils.saveScreenshot('service_accounts_row_menu_delete');
    await serviceAccountsPage.clickOnContextMenuItem(appConst.ROW_MENU_ITEM.DELETE);
    await confirmationDialog.waitForDialogOpened();
    assert.equal(await confirmationDialog.getTargetDisplayName(), DISPLAY_NAME);
    assert.equal(await confirmationDialog.getExpectedValue(), ID, 'The gate should ask for the ID');
    await confirmationDialog.confirmDelete(ID);
    await serviceAccountsPage.waitForExpectedNotificationMessage(
      appConst.principalDeletedMessage(DISPLAY_NAME),
    );
    // Deleted here, so the API delete at the end has nothing to do.
    SERVICE_ACCOUNT = undefined;
    // 4. The term is still in force and matches nothing now: no row, so nothing for Select all to
    //    tick, and the list says so.
    await serviceAccountsPage.waitForRowByDisplayNameNotDisplayed(DISPLAY_NAME);
    assert.deepEqual(await serviceAccountsPage.getSearchTerms(), [EMAIL]);
    assert.ok(
      !(await serviceAccountsPage.isSelectAllCheckboxSelected()),
      'Select all should be unticked once the ticked row is gone',
    );
    assert.deepEqual(
      await serviceAccountsPage.getServiceAccountDisplayNames(),
      [],
      'No service account should be listed',
    );
    assert.equal(
      await serviceAccountsPage.getListMessage(),
      appConst.LIST_MESSAGE.NOTHING_MATCHES,
      "The list should read 'Nothing matches the search'",
    );
    await settingsUtils.saveScreenshot('service_accounts_deleted_in_narrowed_list');
    // 5. 'Clear the filter': the term goes and the list is whole again, the built-in account in
    //    it, the deleted one not.
    await serviceAccountsPage.clickOnClearSearchButton();
    assert.deepEqual(
      await serviceAccountsPage.getSearchTerms(),
      [],
      'No search term should be left',
    );
    await serviceAccountsPage.waitForRowByDisplayNameDisplayed(SUPER_USER);
    assert.equal(
      await serviceAccountsPage.getListMessage(),
      undefined,
      'No message should be shown',
    );
    assert.ok(
      !(await serviceAccountsPage.isRowByDisplayNameDisplayed(DISPLAY_NAME)),
      'The deleted account should not be listed',
    );
    // 6. Nothing is selected: the details panel asks for a selection.
    assert.equal(
      await serviceAccountDetails.waitForEmptyMessage(),
      appConst.DETAILS_MESSAGE.SELECT_AN_ITEM,
      "The details should read 'Select an item to see its details'",
    );
    await settingsUtils.saveScreenshot('service_accounts_filter_cleared');
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
      await settingsUtils
        .deletePrincipalsViaApi(ServiceAccountsPage.serviceAccountKey(SERVICE_ACCOUNT.id))
        .catch((err) => {
          console.log(`'${SERVICE_ACCOUNT.displayName}' was not cleaned up: ` + err);
        });
    }
  });
});

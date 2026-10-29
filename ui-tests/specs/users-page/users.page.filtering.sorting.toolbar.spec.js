/**
 * Created on 28.10.2026
 */
const webDriverHelper = require('../../libs/WebDriverHelper');
const settingsUtils = require('../../libs/settings.utils');
const appConst = require('../../libs/app_const');
const assert = require('node:assert');
const UsersPage = require('../../page_objects/users/users.page');
const ConfirmationDialog = require('../../page_objects/confirmation.dialog');
const userItemsBuilder = require('../../libs/users.items.builder');

describe("users.page.filtering.sorting.toolbar.spec - Users page: the ID provider filter, the four orders of the Sort menu, the search by name, a delete in the narrowed list and 'Clear the filter'", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }
  // One random suffix for the two providers and the two users: 'a' sorts before 'b' whatever the
  // suffix is, so the orders the Sort menu produces are known in advance.
  const SUFFIX = userItemsBuilder.generateRandomNumber();
  const PROVIDER_A_NAME = `providera${SUFFIX}`;
  const PROVIDER_B_NAME = `providerb${SUFFIX}`;
  // ! Crosswise on purpose: user a lives in provider b and user b in provider a, so that the order by
  // ! ID provider is the reverse of the order by display name and the two sorts can be told apart.
  const USER_A_NAME = `usera${SUFFIX}`;
  const USER_B_NAME = `userb${SUFFIX}`;
  // What the create*ViaApi() calls return, with the keys the deletes at the end need.
  let ID_PROVIDER_A;
  let ID_PROVIDER_B;
  let USER_A;
  let USER_B;

  it('GIVEN the suite starts THEN two ID providers AND a user in each should be created via the API', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    ID_PROVIDER_A = await settingsUtils.createIdProviderViaApi(
      userItemsBuilder.buildIdProvider(PROVIDER_A_NAME, 'description', 'Standard ID Provider'),
    );
    ID_PROVIDER_B = await settingsUtils.createIdProviderViaApi(
      userItemsBuilder.buildIdProvider(PROVIDER_B_NAME, 'description', 'Standard ID Provider'),
    );
    USER_A = await settingsUtils.createUserViaApi(
      userItemsBuilder.buildUser({ displayName: USER_A_NAME, idProvider: PROVIDER_B_NAME }),
    );
    USER_B = await settingsUtils.createUserViaApi(
      userItemsBuilder.buildUser({ displayName: USER_B_NAME, idProvider: PROVIDER_A_NAME }),
    );
  });

  // The filter's 'ID provider' field offers every provider but the system one, each with the number
  // of users it holds: the suite's two, one user each, are there to pick.
  it("WHEN the 'ID provider' field of the filter has been entered THEN the suite's two providers should be offered, each counting one user and enabled", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    let usersPage = new UsersPage();
    await usersPage.waitForRowByDisplayNameDisplayed(USER_A_NAME);
    await usersPage.waitForRowByDisplayNameDisplayed(USER_B_NAME);
    // 1. A click in the search input opens the fields; 'ID provider' opens its values.
    await usersPage.openIdProviderFilterValues();
    let values = await usersPage.getFilterValues();
    await settingsUtils.saveScreenshot('users_filter_provider_values');
    // 2. Each of the suite's providers is offered with its one user, enabled and not picked.
    for (const provider of [ID_PROVIDER_A, ID_PROVIDER_B]) {
      let value = values.find(({ id }) => id === provider.key);
      assert.ok(value !== undefined, `'${provider.displayName}' should be offered by the filter`);
      assert.equal(value.label, provider.displayName);
      assert.equal(value.count, 1, `'${provider.displayName}' should count its one user`);
      assert.ok(!value.disabled, `'${provider.displayName}' should be enabled`);
      assert.ok(!value.selected, `'${provider.displayName}' should not be picked yet`);
    }
    // 3. The system ID provider is not a value of the filter.
    assert.ok(
      values.every(({ id }) => id !== userItemsBuilder.SYSTEM_ID_PROVIDER),
      'The system ID provider should not be offered by the filter',
    );
    await usersPage.closeFilterDropdown();
  });

  // A picked provider is a term: its tag names the field and the value, and the list keeps the
  // users of that provider alone. The tag's cross takes the term back.
  it("WHEN a provider has been picked in the 'ID provider' field THEN the term should be shown as a tag AND only the user of that provider should be listed", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    let usersPage = new UsersPage();
    await usersPage.waitForRowByDisplayNameDisplayed(USER_A_NAME);
    await usersPage.waitForRowByDisplayNameDisplayed(USER_B_NAME);
    // 1. Pick provider a: the tag of the term appears, reading the provider's name.
    await usersPage.filterByIdProvider(ID_PROVIDER_A.key, PROVIDER_A_NAME);
    // 2. The term is in force; the field, entered again, marks the picked value as selected.
    assert.deepEqual(await usersPage.getSearchTerms(), [PROVIDER_A_NAME]);
    await usersPage.openIdProviderFilterValues();
    let values = await usersPage.getFilterValues();
    let pickedValue = values.find(({ id }) => id === ID_PROVIDER_A.key);
    assert.ok(pickedValue?.selected, `'${PROVIDER_A_NAME}' should be marked as picked`);
    await usersPage.closeFilterDropdown();
    // 3. The list holds the user of provider a alone - user b.
    await usersPage.waitForRowByDisplayNameNotDisplayed(USER_A_NAME);
    assert.deepEqual(
      await usersPage.getUserDisplayNames(),
      [USER_B_NAME],
      'Only the user of the picked provider should be listed',
    );
    assert.equal(await usersPage.getUserIdProviderByDisplayName(USER_B_NAME), PROVIDER_A_NAME);
    // 4. The tag's cross takes the term back: both users are listed again.
    await usersPage.removeSearchTerm(UsersPage.idProviderTerm(PROVIDER_A_NAME));
    assert.deepEqual(await usersPage.getSearchTerms(), [], 'No term should be left');
    await usersPage.waitForRowByDisplayNameDisplayed(USER_A_NAME);
    await usersPage.waitForRowByDisplayNameDisplayed(USER_B_NAME);
  });

  it("WHEN Users page is loaded THEN the list should be sorted by display name (A–Z) by default AND WHEN 'Display name (Z–A)' has been selected THEN the order should be reversed", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    let usersPage = new UsersPage();
    await usersPage.waitForRowByDisplayNameDisplayed(USER_B_NAME);
    // 1. The default order is 'Display name (A–Z)' and the trigger is not lit.
    assert.equal(await usersPage.getSelectedSortOrder(), appConst.SORT_MENU_ITEM.DISPLAY_NAME_ASC);
    assert.ok(
      !(await usersPage.isSortButtonActive()),
      'The Sort by button should not be lit while the default order holds',
    );
    await usersPage.waitForRowsInOrder([USER_A_NAME, USER_B_NAME]);
    // 2. 'Display name (Z–A)': the trigger is lit and the rows are reversed.
    await usersPage.selectSortOrder(appConst.SORT_MENU_ITEM.DISPLAY_NAME_DESC);
    assert.equal(await usersPage.getSelectedSortOrder(), appConst.SORT_MENU_ITEM.DISPLAY_NAME_DESC);
    assert.ok(
      await usersPage.isSortButtonActive(),
      'The Sort by button should be lit while the order differs from the default one',
    );
    await usersPage.waitForRowsInOrder([USER_B_NAME, USER_A_NAME]);
  });

  // By ID provider the users follow their providers, not their names: user b (provider a) comes
  // before user a (provider b), and the direction flips them.
  it("WHEN 'ID provider (A–Z)' has been selected THEN the user of provider a should come first AND WHEN 'ID provider (Z–A)' has been selected THEN the user of provider b should", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    let usersPage = new UsersPage();
    await usersPage.waitForRowByDisplayNameDisplayed(USER_B_NAME);
    // 1. 'ID provider (A–Z)': provider a's user first - the reverse of the order by name.
    await usersPage.selectSortOrder(appConst.SORT_MENU_ITEM.ID_PROVIDER_ASC);
    assert.equal(await usersPage.getSelectedSortOrder(), appConst.SORT_MENU_ITEM.ID_PROVIDER_ASC);
    assert.ok(await usersPage.isSortButtonActive(), 'The Sort by button should be lit');
    await usersPage.waitForRowsInOrder([USER_B_NAME, USER_A_NAME]);
    // 2. 'ID provider (Z–A)': provider b's user first.
    await usersPage.selectSortOrder(appConst.SORT_MENU_ITEM.ID_PROVIDER_DESC);
    assert.equal(await usersPage.getSelectedSortOrder(), appConst.SORT_MENU_ITEM.ID_PROVIDER_DESC);
    await usersPage.waitForRowsInOrder([USER_A_NAME, USER_B_NAME]);
    // 3. Back to the default: the trigger is not lit and the names decide again.
    await usersPage.selectSortOrder(appConst.SORT_MENU_ITEM.DISPLAY_NAME_ASC);
    assert.ok(
      !(await usersPage.isSortButtonActive()),
      'The Sort by button should not be lit once the default order is back',
    );
    await usersPage.waitForRowsInOrder([USER_A_NAME, USER_B_NAME]);
  });

  it('WHEN the name of a user has been entered in the search input THEN that user alone should be listed, with its ID provider on the right', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    let usersPage = new UsersPage();
    await usersPage.waitForRowByDisplayNameDisplayed(USER_A_NAME);
    await usersPage.waitForRowByDisplayNameDisplayed(USER_B_NAME);
    // 1. The full name of user a, entered as a term, matches that user alone.
    await usersPage.addSearchTerm(USER_A_NAME);
    await usersPage.waitForRowByDisplayNameNotDisplayed(USER_B_NAME);
    assert.deepEqual(await usersPage.getSearchTerms(), [USER_A_NAME]);
    assert.deepEqual(
      await usersPage.getUserDisplayNames(),
      [USER_A_NAME],
      'Only the user with that name should be listed',
    );
    // 2. The row shows the display name of the user's own ID provider.
    assert.equal(
      await usersPage.getUserIdProviderByDisplayName(USER_A_NAME),
      ID_PROVIDER_B.displayName,
    );
  });

  // The search stays in force while the one user it matches is deleted: the list has nothing to
  // show and says so, and the ID provider filter offers no value, since no provider has a user the
  // search matches. 'Clear the filter' takes the term back, and the list is whole again.
  it("GIVEN the name of a user has been entered in the search input WHEN that user has been deleted THEN 'Nothing matches the search' should be shown AND every value of the ID provider filter should be disabled AND WHEN 'Clear the filter' has been clicked THEN the list should be whole again", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    let usersPage = new UsersPage();
    let confirmationDialog = new ConfirmationDialog(appConst.SECTION_ID.USERS);
    await usersPage.waitForRowByDisplayNameDisplayed(USER_A_NAME);
    await usersPage.waitForRowByDisplayNameDisplayed(USER_B_NAME);
    // The list before the search, less the user this test deletes: what the clear should bring back.
    // ! The list is one page: once there are more users than fit, the delete pulls the next one
    // ! onto the page, so the list after is a superset of this, not its equal.
    let namesBefore = (await usersPage.getUserDisplayNames()).filter(
      (name) => name !== USER_A_NAME,
    );
    // 1. Narrow the list to user a.
    await usersPage.addSearchTerm(USER_A_NAME);
    await usersPage.waitForRowByDisplayNameNotDisplayed(USER_B_NAME);
    assert.deepEqual(await usersPage.getUserDisplayNames(), [USER_A_NAME]);
    // 2. Delete user a in the narrowed list: the dialog names the user, the name typed back confirms.
    await usersPage.clickOnRowByDisplayName(USER_A_NAME);
    await usersPage.waitForDeleteButtonEnabled();
    await usersPage.clickOnDeleteButton();
    await confirmationDialog.waitForDialogOpened();
    assert.equal(await confirmationDialog.getTargetDisplayName(), USER_A_NAME);
    await confirmationDialog.typeInConfirmInput(USER_A_NAME);
    await confirmationDialog.waitForDeleteButtonEnabled();
    await confirmationDialog.clickOnDeleteButton();
    await confirmationDialog.waitForDialogClosed();
    await usersPage.waitForExpectedNotificationMessage(
      appConst.principalDeletedMessage(USER_A_NAME),
    );
    // Deleted here, so the API delete at the end has nothing to do.
    USER_A = undefined;
    // 3. The term is still in force and matches nothing now: the list says so.
    await usersPage.waitForRowByDisplayNameNotDisplayed(USER_A_NAME);
    assert.deepEqual(await usersPage.getSearchTerms(), [USER_A_NAME]);
    assert.deepEqual(await usersPage.getUserDisplayNames(), [], 'No user should be listed');
    assert.equal(
      await usersPage.getListMessage(),
      appConst.LIST_MESSAGE.NOTHING_MATCHES,
      "The list should read 'Nothing matches the search'",
    );
    // 4. The ID provider filter: no provider has a user the search matches, so every value counts 0
    //    and is disabled, the suite's two among them.
    await usersPage.openIdProviderFilterValues();
    let values = await usersPage.getFilterValues();
    await settingsUtils.saveScreenshot('users_filter_provider_values_disabled');
    for (const provider of [ID_PROVIDER_A, ID_PROVIDER_B]) {
      let value = values.find(({ id }) => id === provider.key);
      assert.ok(value !== undefined, `'${provider.displayName}' should be offered by the filter`);
      assert.equal(value.label, provider.displayName);
      assert.equal(value.count, 0, `'${provider.displayName}' should count no user`);
    }
    assert.ok(
      values.every(({ disabled }) => disabled),
      'Every value of the ID provider filter should be disabled: ' + JSON.stringify(values),
    );
    // 5. 'Clear the filter', clicked over the open dropdown: the term goes, and the dropdown steps
    //    out of the field back to its first stage - the input invites a search again, not a value.
    await usersPage.clickOnClearSearchButton();
    await usersPage.waitForFilterFieldLeft();
    assert.deepEqual(await usersPage.getSearchTerms(), [], 'No search term should be left');
    await usersPage.closeFilterDropdown();
    // 6. The list is whole again: every user listed before the search but the deleted one.
    await usersPage.waitForRowByDisplayNameDisplayed(USER_B_NAME);
    assert.equal(await usersPage.getListMessage(), undefined, 'No message should be shown');
    let namesAfter = await usersPage.getUserDisplayNames();
    assert.ok(
      namesBefore.every((name) => namesAfter.includes(name)),
      'Every user listed before the search should be listed again',
    );
    assert.ok(!namesAfter.includes(USER_A_NAME), 'The deleted user should not be listed');
    // 7. And the filter offers provider a (user b's) again: one user, not disabled; provider b,
    //    whose user was deleted, has none and stays disabled.
    await usersPage.openIdProviderFilterValues();
    values = await usersPage.getFilterValues();
    let providerA = values.find(({ id }) => id === ID_PROVIDER_A.key);
    assert.ok(providerA !== undefined, `'${PROVIDER_A_NAME}' should be offered by the filter`);
    assert.equal(providerA.count, 1, `'${PROVIDER_A_NAME}' should count its one user`);
    assert.ok(!providerA.disabled, `'${PROVIDER_A_NAME}' should be enabled once the term is gone`);
    let providerB = values.find(({ id }) => id === ID_PROVIDER_B.key);
    assert.ok(
      providerB !== undefined,
      `'${PROVIDER_B_NAME}' should still be offered by the filter`,
    );
    assert.equal(providerB.count, 0, `'${PROVIDER_B_NAME}' should count no user any more`);
    assert.ok(providerB.disabled, `'${PROVIDER_B_NAME}' should stay disabled`);
    await usersPage.closeFilterDropdown();
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
  // The users go first: a provider that still holds a user cannot be deleted. user a is deleted in
  // the browser, which unsets it, so its delete here only runs when the test did not get that far.
  after(async () => {
    for (const user of [USER_A, USER_B]) {
      if (user !== undefined) {
        await settingsUtils.deletePrincipalsViaApi(user).catch((err) => {
          console.log(`'${user.displayName}' was not cleaned up: ` + err);
        });
      }
    }
    for (const provider of [ID_PROVIDER_A, ID_PROVIDER_B]) {
      if (provider !== undefined) {
        await settingsUtils.deleteIdProviderViaApi(provider).catch((err) => {
          console.log(`The ID provider '${provider.displayName}' was not cleaned up: ` + err);
        });
      }
    }
  });
});

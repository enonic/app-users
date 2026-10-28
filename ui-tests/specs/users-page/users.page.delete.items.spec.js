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

describe('users.page.delete.items.spec - Users page: two users of one provider ticked in the narrowed list, Delete in the row menu refusing a wrong count, Delete in the toolbar removing both once the count is typed back', function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }
  const PROVIDER_NAME = userItemsBuilder.generateRandomName('provider');
  const USER1_NAME = userItemsBuilder.generateRandomName('user');
  const USER2_NAME = userItemsBuilder.generateRandomName('user');
  // The question of the delete confirmation for several items (phrases: principal.delete.*).
  const DELETE_ITEMS_QUESTION = 'Are you sure you want to delete these items?';
  // The two names, whichever order the list or the dialog gives them in.
  const byName = (a, b) => a.localeCompare(b);
  const BOTH_USERS = [USER1_NAME, USER2_NAME].sort(byName);
  // What the create*ViaApi() calls return, with the keys the deletes at the end need.
  let ID_PROVIDER;
  let USER1;
  let USER2;

  it('GIVEN the suite starts THEN an ID provider AND two users in it should be created via the API', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    ID_PROVIDER = await settingsUtils.createIdProviderViaApi(
      userItemsBuilder.buildIdProvider(PROVIDER_NAME, 'description', 'Standard ID Provider'),
    );
    USER1 = await settingsUtils.createUserViaApi(
      userItemsBuilder.buildUser({ displayName: USER1_NAME, idProvider: PROVIDER_NAME }),
    );
    USER2 = await settingsUtils.createUserViaApi(
      userItemsBuilder.buildUser({ displayName: USER2_NAME, idProvider: PROVIDER_NAME }),
    );
  });

  // The row menu offers Delete over the ticked rows, the same as the toolbar. The gate wants the
  // count of the items: a wrong number is named in the error line and holds Delete back.
  it("GIVEN the list has been narrowed to the suite's provider AND both users have been ticked WHEN Delete has been clicked in the row menu AND a wrong count has been typed THEN the mismatch should be reported AND Delete should stay disabled", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    let usersPage = new UsersPage();
    let confirmationDialog = new ConfirmationDialog(appConst.SECTION_ID.USERS);
    await usersPage.waitForRowByDisplayNameDisplayed(USER1_NAME);
    await usersPage.waitForRowByDisplayNameDisplayed(USER2_NAME);
    // 1. Pick the provider in the filter's 'ID provider' field, then tick both of its users.
    await usersPage.filterByIdProvider(ID_PROVIDER.key, PROVIDER_NAME);
    await usersPage.waitForRowByDisplayNameDisplayed(USER1_NAME);
    await usersPage.clickOnCheckboxByDisplayName(USER1_NAME);
    await usersPage.clickOnCheckboxByDisplayName(USER2_NAME);
    assert.ok(await usersPage.isRowChecked(USER1.key), `'${USER1_NAME}' should be ticked`);
    assert.ok(await usersPage.isRowChecked(USER2.key), `'${USER2_NAME}' should be ticked`);
    await usersPage.waitForDeleteButtonEnabled();
    // 2. Delete in the row menu: the confirmation lists the two users and wants their count.
    await usersPage.openContextMenu(USER1_NAME);
    await usersPage.clickOnContextMenuItem(appConst.ROW_MENU_ITEM.DELETE);
    await confirmationDialog.waitForDialogOpened();
    assert.deepEqual(
      (await confirmationDialog.getTargetDisplayNames()).sort(byName),
      BOTH_USERS,
      'The confirmation should list the two users',
    );
    assert.equal(await confirmationDialog.getExpectedValue(), '2');
    // 3. A wrong count: the error line names the mismatch and Delete stays disabled.
    await confirmationDialog.typeInConfirmInput('3');
    assert.equal(await confirmationDialog.waitForMismatchMessage(), '3 does not match 2');
    await confirmationDialog.waitForDeleteButtonDisabled();
    await settingsUtils.saveScreenshot('users_delete_two_mismatch');
    // 4. Cancel: nothing is deleted, both users are still listed.
    await confirmationDialog.clickOnCancelButton();
    await confirmationDialog.waitForDialogClosed();
    await usersPage.waitForRowByDisplayNameDisplayed(USER1_NAME);
    await usersPage.waitForRowByDisplayNameDisplayed(USER2_NAME);
  });

  // Select all ticks the rows the list shows, so with the provider picked in the filter it ticks
  // that provider's users and no one else's. The confirmation lists the two and asks for their
  // count; once it is typed back, Delete removes both and the narrowed list has nothing left.
  it("GIVEN the list has been narrowed to the suite's provider AND Select all has been clicked WHEN Delete has been clicked AND the count has been typed back THEN both users should be deleted AND 'Nothing matches the search' should be shown", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    let usersPage = new UsersPage();
    let confirmationDialog = new ConfirmationDialog(appConst.SECTION_ID.USERS);
    await usersPage.waitForRowByDisplayNameDisplayed(USER1_NAME);
    await usersPage.waitForRowByDisplayNameDisplayed(USER2_NAME);
    // 1. Pick the provider in the filter's 'ID provider' field: its two users alone are listed.
    await usersPage.filterByIdProvider(ID_PROVIDER.key, PROVIDER_NAME);
    assert.deepEqual(await usersPage.getSearchTerms(), [PROVIDER_NAME]);
    await usersPage.waitForRowByDisplayNameDisplayed(USER1_NAME);
    assert.deepEqual(
      (await usersPage.getUserDisplayNames()).sort(byName),
      BOTH_USERS,
      'The two users of the provider alone should be listed',
    );
    // 2. Select all ticks both rows: Delete gets enabled.
    await usersPage.waitForDeleteButtonDisabled();
    await usersPage.clickOnSelectAllCheckbox();
    assert.ok(await usersPage.isRowChecked(USER1.key), `'${USER1_NAME}' should be ticked`);
    assert.ok(await usersPage.isRowChecked(USER2.key), `'${USER2_NAME}' should be ticked`);
    assert.ok(await usersPage.isSelectAllCheckboxSelected(), 'Select all should be ticked');
    await usersPage.waitForDeleteButtonEnabled();
    // 3. Delete: the confirmation asks about 'these items', lists the two users and wants their
    //    count typed back; Delete stays disabled until then.
    await usersPage.clickOnDeleteButton();
    await confirmationDialog.waitForDialogOpened();
    assert.equal(await confirmationDialog.getTitle(), 'Confirmation');
    assert.equal(await confirmationDialog.getQuestion(), DELETE_ITEMS_QUESTION);
    assert.deepEqual(
      (await confirmationDialog.getTargetDisplayNames()).sort(byName),
      BOTH_USERS,
      'The confirmation should list the two users',
    );
    assert.equal(await confirmationDialog.getExpectedValue(), '2');
    assert.equal(await confirmationDialog.getGateText(), 'Type 2 to confirm');
    await confirmationDialog.waitForDeleteButtonDisabled();
    await confirmationDialog.typeInConfirmInput('2');
    await confirmationDialog.waitForDeleteButtonEnabled();
    await settingsUtils.saveScreenshot('users_delete_two_confirmation');
    // 4. Confirm: the dialog closes, the notification message counts the deleted items.
    await confirmationDialog.clickOnDeleteButton();
    await confirmationDialog.waitForDialogClosed();
    await usersPage.waitForExpectedNotificationMessage(appConst.principalsDeletedMessage(2));
    // Deleted here, so the API deletes at the end have nothing to do.
    USER1 = undefined;
    USER2 = undefined;
    // 5. The term is still in force and the provider has no user left: the list says so.
    await usersPage.waitForRowByDisplayNameNotDisplayed(USER1_NAME);
    await usersPage.waitForRowByDisplayNameNotDisplayed(USER2_NAME);
    assert.deepEqual(await usersPage.getSearchTerms(), [PROVIDER_NAME]);
    assert.deepEqual(await usersPage.getUserDisplayNames(), [], 'No user should be listed');
    assert.equal(
      await usersPage.getListMessage(),
      appConst.LIST_MESSAGE.NOTHING_MATCHES,
      "The list should read 'Nothing matches the search'",
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
  // The users go first: a provider that still holds a user cannot be deleted. Both are deleted in
  // the browser, which unsets them, so their deletes here only run when the test did not get that
  // far.
  after(async () => {
    for (const user of [USER1, USER2]) {
      if (user !== undefined) {
        await settingsUtils.deletePrincipalsViaApi(user).catch((err) => {
          console.log(`'${user.displayName}' was not cleaned up: ` + err);
        });
      }
    }
    if (ID_PROVIDER !== undefined) {
      await settingsUtils.deleteIdProviderViaApi(ID_PROVIDER).catch((err) => {
        console.log('The ID provider was not cleaned up: ' + err);
      });
    }
  });
});

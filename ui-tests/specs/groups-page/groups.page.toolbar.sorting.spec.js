/**
 * Created on 01.10.2026
 */
const webDriverHelper = require('../../libs/WebDriverHelper');
const settingsUtils = require('../../libs/settings.utils');
const appConst = require('../../libs/app_const');
const assert = require('node:assert');
const GroupsPage = require('../../page_objects/groups/groups.page');
const userItemsBuilder = require('../../libs/users.items.builder');

describe("groups.page.toolbar.sorting.spec - Groups page: the toolbar with nothing selected, the four orders of the Sort menu, and the search: it narrows the list, keeps the order, follows groups made in the editor and is taken back by its tag's cross", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }
  const PROVIDER_NAME = userItemsBuilder.generateRandomName('provider');
  // One random suffix for the three groups: the names then sort among themselves in the order
  // they are numbered, whatever the suffix is.
  const SUFFIX = userItemsBuilder.generateRandomNumber();
  const GROUP1_NAME = `group1-${SUFFIX}`;
  const GROUP2_NAME = `group2-${SUFFIX}`;
  const GROUP3_NAME = `group3-${SUFFIX}`;
  // ! The search matches a word from its start and splits a name on punctuation, so 'test-group'
  // ! would answer to 'group' by its second part. One word keeps this group out of that search.
  const TEST_GROUP_NAME = `testgroup-${SUFFIX}`;
  // Made in the editor, in the suite's own provider, while a search is in force.
  const GROUP4_NAME = `group4-${SUFFIX}`;
  const GROUP5_NAME = `group5-${SUFFIX}`;
  // What the create*ViaApi() calls return, with the keys the deletes at the end need.
  let ID_PROVIDER;
  let GROUP1;
  let GROUP2;
  let GROUP3;
  let TEST_GROUP;

  // The suite's own groups: the rows waitForRowsInOrder looks at, the rest of the list passed over.
  const OWN_GROUP_NAMES = [GROUP1_NAME, GROUP2_NAME, GROUP3_NAME, GROUP4_NAME, GROUP5_NAME];

  // The groups are made in two ID providers: the suite's own, whose name ('provider...') sorts
  // before 'system', and the system one. By display name the order is group1, group2, group3; by
  // ID provider the groups of the suite's provider come first or last, and the names inside each
  // provider stay ascending in both directions.
  it('GIVEN the suite starts THEN an ID provider AND two groups in the system ID provider AND a group in the new provider should be created via the API', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    ID_PROVIDER = await settingsUtils.createIdProviderViaApi(
      userItemsBuilder.buildIdProvider(PROVIDER_NAME, 'description', 'Standard ID Provider'),
    );
    GROUP1 = await settingsUtils.createGroupViaApi(
      userItemsBuilder.buildGroup({
        idProvider: userItemsBuilder.SYSTEM_ID_PROVIDER_DISPLAY_NAME,
        displayName: GROUP1_NAME,
      }),
    );
    GROUP2 = await settingsUtils.createGroupViaApi(
      userItemsBuilder.buildGroup({
        idProvider: userItemsBuilder.SYSTEM_ID_PROVIDER_DISPLAY_NAME,
        displayName: GROUP2_NAME,
      }),
    );
    GROUP3 = await settingsUtils.createGroupViaApi(
      userItemsBuilder.buildGroup({ idProvider: PROVIDER_NAME, displayName: GROUP3_NAME }),
    );
  });

  it('WHEN Groups page is loaded THEN New button should be enabled AND Delete is disabled AND the list is sorted by display name (A–Z) by default', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.GROUPS);
    let groupsPage = new GroupsPage();
    // 1. Verify that New button is enabled.
    await groupsPage.waitForNewButtonEnabled();
    // 2. Verify that Delete button is disabled.
    await groupsPage.waitForDeleteButtonDisabled();
    // 3. The default order is 'Display name (A–Z)': the trigger's tooltip names it and the trigger
    // is not lit, since the order is the default one.
    let actual = await groupsPage.getSelectedSortOrder();
    assert.equal(actual, appConst.SORT_MENU_ITEM.DISPLAY_NAME_ASC);
    assert.ok(
      !(await groupsPage.isSortButtonActive()),
      'The Sort by button should not be lit while the default order holds',
    );
    // 4. The rows follow the display names, the ID provider of a group playing no part.
    await groupsPage.waitForRowByDisplayNameDisplayed(GROUP3_NAME);
    await groupsPage.waitForRowsInOrder([GROUP1_NAME, GROUP2_NAME, GROUP3_NAME], OWN_GROUP_NAMES);
    // 5. Each row shows the name of its own ID provider on the right ('system', not its display name).
    assert.equal(
      await groupsPage.getGroupIdProviderByDisplayName(GROUP1_NAME),
      userItemsBuilder.SYSTEM_ID_PROVIDER,
    );
    assert.equal(await groupsPage.getGroupIdProviderByDisplayName(GROUP3_NAME), ID_PROVIDER.key);
  });

  it("WHEN 'Display name (Z–A)' has been selected in the Sort menu THEN the list should be sorted by display name in reverse order", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.GROUPS);
    let groupsPage = new GroupsPage();
    await groupsPage.waitForRowByDisplayNameDisplayed(GROUP3_NAME);
    // 1. Select 'Display name (Z–A)' in the Sort menu.
    await groupsPage.selectSortOrder(appConst.SORT_MENU_ITEM.DISPLAY_NAME_DESC);
    // 2. The trigger's tooltip names the picked order and the trigger is lit.
    let actual = await groupsPage.getSelectedSortOrder();
    assert.equal(actual, appConst.SORT_MENU_ITEM.DISPLAY_NAME_DESC);
    assert.ok(
      await groupsPage.isSortButtonActive(),
      'The Sort by button should be lit while the order differs from the default one',
    );
    // 3. The rows follow the display names, reversed.
    await groupsPage.waitForRowsInOrder([GROUP3_NAME, GROUP2_NAME, GROUP1_NAME], OWN_GROUP_NAMES);
  });

  it("WHEN 'ID provider (A–Z)' has been selected in the Sort menu THEN the groups should be grouped by ID provider, the new provider's group first", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.GROUPS);
    let groupsPage = new GroupsPage();
    await groupsPage.waitForRowByDisplayNameDisplayed(GROUP3_NAME);
    // 1. Select 'ID provider (A–Z)' in the Sort menu.
    await groupsPage.selectSortOrder(appConst.SORT_MENU_ITEM.ID_PROVIDER_ASC);
    let actual = await groupsPage.getSelectedSortOrder();
    assert.equal(actual, appConst.SORT_MENU_ITEM.ID_PROVIDER_ASC);
    assert.ok(await groupsPage.isSortButtonActive(), 'The Sort by button should be lit');
    // 2. 'provider...' sorts before 'system': group3 comes first, then the system groups by name.
    await groupsPage.waitForRowsInOrder([GROUP3_NAME, GROUP1_NAME, GROUP2_NAME], OWN_GROUP_NAMES);
  });

  it("WHEN 'ID provider (Z–A)' has been selected in the Sort menu THEN the groups should be grouped by ID provider, the system groups first and still ascending by name", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.GROUPS);
    let groupsPage = new GroupsPage();
    await groupsPage.waitForRowByDisplayNameDisplayed(GROUP3_NAME);
    // 1. Select 'ID provider (Z–A)' in the Sort menu.
    await groupsPage.selectSortOrder(appConst.SORT_MENU_ITEM.ID_PROVIDER_DESC);
    let actual = await groupsPage.getSelectedSortOrder();
    assert.equal(actual, appConst.SORT_MENU_ITEM.ID_PROVIDER_DESC);
    assert.ok(await groupsPage.isSortButtonActive(), 'The Sort by button should be lit');
    // 2. The direction flips the providers alone: 'system' comes first, and its groups keep the
    // ascending order of their names.
    await groupsPage.waitForRowsInOrder([GROUP1_NAME, GROUP2_NAME, GROUP3_NAME], OWN_GROUP_NAMES);
  });

  it("GIVEN 'Display name (Z–A)' is selected WHEN 'Display name (A–Z)' has been selected THEN the default order should be restored", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.GROUPS);
    let groupsPage = new GroupsPage();
    await groupsPage.waitForRowByDisplayNameDisplayed(GROUP3_NAME);
    // 1. Leave the default order.
    await groupsPage.selectSortOrder(appConst.SORT_MENU_ITEM.DISPLAY_NAME_DESC);
    assert.ok(await groupsPage.isSortButtonActive(), 'The Sort by button should be lit');
    // 2. Pick the default order back.
    await groupsPage.selectSortOrder(appConst.SORT_MENU_ITEM.DISPLAY_NAME_ASC);
    let actual = await groupsPage.getSelectedSortOrder();
    assert.equal(actual, appConst.SORT_MENU_ITEM.DISPLAY_NAME_ASC);
    assert.ok(
      !(await groupsPage.isSortButtonActive()),
      'The Sort by button should not be lit once the default order is back',
    );
    await groupsPage.waitForRowsInOrder([GROUP1_NAME, GROUP2_NAME, GROUP3_NAME], OWN_GROUP_NAMES);
  });

  // The search narrows the list before the order applies: the groups 'group' matches keep the order
  // the Sort menu sets, and a group that has 'group' inside a word only is left out.
  it("GIVEN a group named 'testgroup-...' has been created via the API WHEN 'group' has been typed in the search input THEN that group should not be listed AND the groups that match should keep the selected order", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.GROUPS);
    let groupsPage = new GroupsPage();
    TEST_GROUP = await settingsUtils.createGroupViaApi(
      userItemsBuilder.buildGroup({
        idProvider: userItemsBuilder.SYSTEM_ID_PROVIDER_DISPLAY_NAME,
        displayName: TEST_GROUP_NAME,
      }),
    );
    await groupsPage.waitForRowByDisplayNameDisplayed(TEST_GROUP_NAME);
    // 1. 'group', entered as a term: the three groups stay, 'testgroup-...' goes.
    await groupsPage.addSearchTerm('group');
    await groupsPage.waitForRowByDisplayNameNotDisplayed(TEST_GROUP_NAME);
    await groupsPage.waitForRowsInOrder([GROUP1_NAME, GROUP2_NAME, GROUP3_NAME], OWN_GROUP_NAMES);
    // 2. The search stays in force while the order changes, and the narrowed list follows it.
    await groupsPage.selectSortOrder(appConst.SORT_MENU_ITEM.DISPLAY_NAME_DESC);
    assert.deepEqual(await groupsPage.getSearchTerms(), ['group']);
    await groupsPage.waitForRowsInOrder([GROUP3_NAME, GROUP2_NAME, GROUP1_NAME], OWN_GROUP_NAMES);
    assert.ok(
      !(await groupsPage.isRowByDisplayNameDisplayed(TEST_GROUP_NAME)),
      "'testgroup-...' should stay out of the narrowed list whatever the order",
    );
  });

  it("GIVEN 'group' has been typed in the search input WHEN a group that matches has been created in the editor THEN the narrowed list should show one group more", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.GROUPS);
    let groupsPage = new GroupsPage();
    await groupsPage.waitForRowByDisplayNameDisplayed(GROUP3_NAME);
    // 1. Narrow the list to the groups that start with 'group'.
    await groupsPage.addSearchTerm('group');
    await groupsPage.waitForRowByDisplayNameNotDisplayed(TEST_GROUP_NAME);
    let countBefore = (await groupsPage.getGroupDisplayNames()).length;
    // 2. Create a fourth group in the editor, in the suite's own provider, with the search in force.
    await settingsUtils.createGroup(
      userItemsBuilder.buildGroup({ idProvider: PROVIDER_NAME, displayName: GROUP4_NAME }),
    );
    // 3. The new group matches the search, so the narrowed list grows by one and keeps its order.
    await groupsPage.waitForRowByDisplayNameDisplayed(GROUP4_NAME);
    assert.deepEqual(await groupsPage.getSearchTerms(), ['group']);
    assert.equal(
      (await groupsPage.getGroupDisplayNames()).length,
      countBefore + 1,
      'The narrowed list should show one group more',
    );
    await groupsPage.waitForRowsInOrder(
      [GROUP1_NAME, GROUP2_NAME, GROUP3_NAME, GROUP4_NAME],
      OWN_GROUP_NAMES,
    );
    assert.ok(
      !(await groupsPage.isRowByDisplayNameDisplayed(TEST_GROUP_NAME)),
      "'testgroup-...' should still be out of the narrowed list",
    );
  });

  it('GIVEN the full name of a group has been typed in the search input WHEN another group has been created in the editor THEN the list should still show that one group only', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.GROUPS);
    let groupsPage = new GroupsPage();
    await groupsPage.waitForRowByDisplayNameDisplayed(GROUP3_NAME);
    // 1. The full name of group1 matches that group alone.
    await groupsPage.addSearchTerm(GROUP1_NAME);
    await groupsPage.waitForRowByDisplayNameNotDisplayed(GROUP2_NAME);
    assert.deepEqual(
      await groupsPage.getGroupDisplayNames(),
      [GROUP1_NAME],
      'Only the group with that name should be listed',
    );
    // 2. Create a fifth group in the editor: it does not match the search.
    await settingsUtils.createGroup(
      userItemsBuilder.buildGroup({ idProvider: PROVIDER_NAME, displayName: GROUP5_NAME }),
    );
    // 3. The search is still in force and the list still shows the one group.
    assert.deepEqual(await groupsPage.getSearchTerms(), [GROUP1_NAME]);
    await groupsPage.waitForRowByDisplayNameNotDisplayed(GROUP5_NAME);
    assert.deepEqual(
      await groupsPage.getGroupDisplayNames(),
      [GROUP1_NAME],
      'The list should still show the one group the search matches',
    );
  });

  // A term's cross takes the term back: the list is whole again, in the order it had.
  it("GIVEN the name of 'testgroup-...' has been entered as a search term AND that group alone is listed WHEN the term's Remove button has been clicked THEN every group should be listed again", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.GROUPS);
    let groupsPage = new GroupsPage();
    await groupsPage.waitForRowByDisplayNameDisplayed(TEST_GROUP_NAME);
    let namesBefore = await groupsPage.getGroupDisplayNames();
    // 1. The group's full name matches that group alone.
    await groupsPage.addSearchTerm(TEST_GROUP_NAME);
    await groupsPage.waitForRowByDisplayNameNotDisplayed(GROUP1_NAME);
    assert.deepEqual(
      await groupsPage.getGroupDisplayNames(),
      [TEST_GROUP_NAME],
      'Only the group with that name should be listed',
    );
    // 2. Remove the term by its cross: no term is in force.
    await groupsPage.removeSearchTerm(TEST_GROUP_NAME);
    assert.deepEqual(await groupsPage.getSearchTerms(), [], 'No search term should be left');
    // 3. The list is what it was before the search.
    await groupsPage.waitForRowByDisplayNameDisplayed(GROUP1_NAME);
    assert.deepEqual(
      await groupsPage.getGroupDisplayNames(),
      namesBefore,
      'Every group should be listed again, in the same order',
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
  // The groups go first: a provider that still holds a group cannot be deleted. The two made in the
  // editor are named by the key they got, whether or not they were created.
  after(async () => {
    const madeInEditor = [GROUP4_NAME, GROUP5_NAME].map((name) => ({
      displayName: name,
      key: GroupsPage.groupKey(userItemsBuilder.nameOf(name), ID_PROVIDER?.key),
    }));
    for (const group of [GROUP1, GROUP2, GROUP3, TEST_GROUP, ...madeInEditor]) {
      if (group !== undefined) {
        await settingsUtils.deleteGroupViaApi(group).catch((err) => {
          console.log(`'${group.displayName}' was not cleaned up: ` + err);
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

/**
 * Created on 02.11.2026
 */
const webDriverHelper = require('../../libs/WebDriverHelper');
const settingsUtils = require('../../libs/settings.utils');
const appConst = require('../../libs/app_const');
const assert = require('node:assert');
const IdProvidersPage = require('../../page_objects/providers/id.providers.page');
const userItemsBuilder = require('../../libs/users.items.builder');

describe('idprovider.page.filtering.spec - ID Providers page: a provider made in the editor with an id of its own is found by its display name, by its id and by its application, the three terms together leaving it alone in the list', function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }
  // The id is typed over the one the editor derives from the display name, so the two differ and
  // the search can be shown to match either.
  const SUFFIX = userItemsBuilder.generateRandomNumber();
  const PROVIDER_NAME = `provider${SUFFIX}`;
  const PROVIDER_ID = `id${SUFFIX}`;
  const APPLICATION = 'Standard ID Provider';
  // The provider as built; the key of its application is resolved through the API once the suite
  // runs - the filter's value carries the key, its label the display name.
  const ID_PROVIDER = userItemsBuilder.buildIdProvider({
    displayName: PROVIDER_NAME,
    id: PROVIDER_ID,
    description: 'filtering test',
    application: APPLICATION,
  });
  let APPLICATION_KEY;
  let created = false;

  it("GIVEN the suite starts THEN an ID provider with an id of its own and 'Standard ID Provider' as its application should be created in the editor AND listed with its id under its display name and the application on the right", async () => {
    let idProvidersPage = new IdProvidersPage();
    // 1. Create the provider in the editor (not via the API): the id typed over the derived one.
    await settingsUtils.createIdProvider(ID_PROVIDER);
    created = true;
    APPLICATION_KEY = await settingsUtils.resolveIdProviderApplicationKey(APPLICATION);
    // 2. The row shows the id under the display name, the application on the right.
    assert.equal(
      await idProvidersPage.getRowNameByDisplayName(PROVIDER_NAME),
      PROVIDER_ID,
      'The row should show the id typed in the editor, not one derived from the display name',
    );
    assert.equal(
      await idProvidersPage.getProviderApplicationByDisplayName(PROVIDER_NAME),
      APPLICATION,
    );
  });

  it('WHEN the display name of the provider has been entered in the search input THEN that provider alone should be listed AND WHEN its id has been entered instead THEN the same', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ID_PROVIDERS);
    let idProvidersPage = new IdProvidersPage();
    await idProvidersPage.waitForRowByDisplayNameDisplayed(PROVIDER_NAME);
    // 1. The display name, entered as a term, leaves the provider alone - the system one is gone.
    await idProvidersPage.addSearchTerm(PROVIDER_NAME);
    await idProvidersPage.waitForRowByDisplayNameNotDisplayed(
      userItemsBuilder.SYSTEM_ID_PROVIDER_DISPLAY_NAME,
    );
    assert.deepEqual(await idProvidersPage.getSearchTerms(), [PROVIDER_NAME]);
    assert.deepEqual(
      await idProvidersPage.getProviderDisplayNames(),
      [PROVIDER_NAME],
      'Only the provider with that display name should be listed',
    );
    // 2. The term taken back, the id entered instead: the key is searched too, so the same one row.
    await idProvidersPage.removeSearchTerm(PROVIDER_NAME);
    await idProvidersPage.waitForRowByDisplayNameDisplayed(
      userItemsBuilder.SYSTEM_ID_PROVIDER_DISPLAY_NAME,
    );
    await idProvidersPage.addSearchTerm(PROVIDER_ID);
    await idProvidersPage.waitForRowByDisplayNameNotDisplayed(
      userItemsBuilder.SYSTEM_ID_PROVIDER_DISPLAY_NAME,
    );
    await settingsUtils.saveScreenshot('idproviders_search_by_id');
    assert.deepEqual(await idProvidersPage.getSearchTerms(), [PROVIDER_ID]);
    assert.deepEqual(
      await idProvidersPage.getProviderDisplayNames(),
      [PROVIDER_NAME],
      'Only the provider with that id should be listed',
    );
    assert.deepEqual(await idProvidersPage.getProviderNames(), [PROVIDER_ID]);
  });

  // Every term must match: the display name and the id both name the one provider, and the
  // application picked beside them narrows to the same row. The field counts the provider under its
  // application alone; every other value - another application, 'Bound to no application' - counts
  // none and is disabled.
  it("WHEN the display name AND the id of the provider have been entered in the search input AND 'Standard ID Provider' has been picked in 'Application' THEN the three terms should be shown as tags AND that provider alone should be listed", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ID_PROVIDERS);
    let idProvidersPage = new IdProvidersPage();
    await idProvidersPage.waitForRowByDisplayNameDisplayed(PROVIDER_NAME);
    // 1. Two terms, the display name and the id: still the one row.
    await idProvidersPage.addSearchTerm(PROVIDER_NAME);
    await idProvidersPage.addSearchTerm(PROVIDER_ID);
    await idProvidersPage.waitForRowByDisplayNameNotDisplayed(
      userItemsBuilder.SYSTEM_ID_PROVIDER_DISPLAY_NAME,
    );
    assert.deepEqual(await idProvidersPage.getSearchTerms(), [PROVIDER_NAME, PROVIDER_ID]);
    assert.deepEqual(await idProvidersPage.getProviderDisplayNames(), [PROVIDER_NAME]);
    // 2. 'Application', entered: 'Standard ID Provider' counts the one provider, enabled; every
    //    other value counts none and is disabled.
    await idProvidersPage.openFilterDropdown();
    assert.ok(
      await idProvidersPage.isApplicationFilterFieldOffered(),
      "'Application' should be offered",
    );
    await idProvidersPage.openApplicationFilterValues();
    let values = await idProvidersPage.getFilterValues();
    await settingsUtils.saveScreenshot('idproviders_filter_application_values');
    let standard = values.find(({ id }) => id === APPLICATION_KEY);
    assert.ok(standard !== undefined, `'${APPLICATION}' should be offered by the filter`);
    assert.equal(standard.label, APPLICATION);
    assert.equal(
      standard.count,
      1,
      `'${APPLICATION}' should count the one provider the search left`,
    );
    assert.ok(!standard.disabled, `'${APPLICATION}' should be enabled`);
    assert.ok(!standard.selected, `'${APPLICATION}' should not be picked yet`);
    for (const value of values.filter(({ id }) => id !== APPLICATION_KEY)) {
      assert.equal(value.count, 0, `'${value.label}' should count no provider`);
      assert.ok(value.disabled, `'${value.label}' should be disabled`);
    }
    // 3. Pick the application: a third term, its tag reading the application's name, and the one
    //    row stays, the application on its right.
    await idProvidersPage.clickOnFilterValue(
      APPLICATION_KEY,
      IdProvidersPage.applicationTerm(APPLICATION),
    );
    await idProvidersPage.closeFilterDropdown();
    await settingsUtils.saveScreenshot('idproviders_search_name_id_application');
    assert.deepEqual(await idProvidersPage.getSearchTerms(), [
      PROVIDER_NAME,
      PROVIDER_ID,
      APPLICATION,
    ]);
    assert.deepEqual(
      await idProvidersPage.getProviderDisplayNames(),
      [PROVIDER_NAME],
      'The provider should be the one row with the three terms in force',
    );
    assert.equal(
      await idProvidersPage.getProviderApplicationByDisplayName(PROVIDER_NAME),
      APPLICATION,
    );
    // 4. The field, entered again, marks the application as picked.
    await idProvidersPage.openApplicationFilterValues();
    values = await idProvidersPage.getFilterValues();
    standard = values.find(({ id }) => id === APPLICATION_KEY);
    assert.ok(standard?.selected, `'${APPLICATION}' should be marked as picked`);
    await idProvidersPage.closeFilterDropdown();
    // 5. 'Clear the filter' takes every term back: the system provider is listed again.
    await idProvidersPage.clickOnClearSearchButton();
    assert.deepEqual(await idProvidersPage.getSearchTerms(), [], 'No term should be left');
    await idProvidersPage.waitForRowByDisplayNameDisplayed(
      userItemsBuilder.SYSTEM_ID_PROVIDER_DISPLAY_NAME,
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
  // The provider was made in the editor; its id is its key, which the API delete takes.
  after(async () => {
    if (created) {
      await settingsUtils.deleteIdProviderViaApi(ID_PROVIDER).catch((err) => {
        console.log(`The ID provider '${PROVIDER_NAME}' was not cleaned up: ` + err);
      });
    }
  });
});

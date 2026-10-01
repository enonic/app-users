/**
 * Created on 01.10.2026.
 *
 * 'Permissions' step of the ID provider editor: a principal picker over users, groups and roles
 * alike. The picker's search input has the placeholder 'Search users, groups and roles'; each picked
 * principal is a row with its provider, an access selector ('Access for <display name>', one of
 * appConst.ID_PROVIDER_ACCESS.*) and a Remove button. A new provider opens with the default
 * permissions (Administrator, Users Administrator, Authenticated) already in place; those rows are
 * pinned - their selector and Remove button are disabled.
 */
const IdProviderEditorStepDialog = require('./provider.editor.step.dialog');
const appConst = require('../../../libs/app_const');

const PERMISSIONS_PLACEHOLDER = 'Search users, groups and roles';

const DIALOG = IdProviderEditorStepDialog.css.container;
const PANEL = `${DIALOG} [data-registry-id='permissions']`;
const ROW = `${PANEL} [data-component='GridList.Row']`;

const css = {
  rows: ROW,
  // A picked row carries the principal's key in its id ('<key>-picked'), e.g. 'role:system.admin-picked'.
  rowByKey: (key) => `${ROW}[id='${key}-picked']`,
  accessSelectorTrigger: (displayName) =>
    `${ROW} [data-component='Selector.Trigger'][aria-label='Access for ${displayName}']`,
  accessSelectorValue: (displayName) =>
    `${ROW} [data-component='Selector.Trigger'][aria-label='Access for ${displayName}'] ` +
    "[data-component='Selector.Value']",
  // The popup is portalled beside the dialog, not inside it: no DIALOG prefix.
  accessOptions: "[data-component='SelectorPopup'] [data-component='Selector.Item']",
  accessOptionByValue: (value) =>
    `[data-component='SelectorPopup'] [data-component='Selector.Item'][data-value='${value}']`,
};

class IdProviderEditorPermissionsStepDialog extends IdProviderEditorStepDialog {
  get step() {
    return IdProviderEditorStepDialog.STEP.PERMISSIONS;
  }

  get permissionsFilterInput() {
    return IdProviderEditorStepDialog.css.pickerInput(PERMISSIONS_PLACEHOLDER);
  }

  typeInPermissionsFilterInput(text) {
    return this.filterPrincipals(PERMISSIONS_PLACEHOLDER, text);
  }

  clickOnPermissionsDropdownHandle() {
    return this.clickOnPickerToggle(PERMISSIONS_PLACEHOLDER);
  }

  // Display names of the principals offered in the opened popup.
  getPrincipalOptions() {
    return this.getPickerOptions();
  }

  clickOnPrincipalOption(displayName) {
    return this.clickOnPickerOption(displayName);
  }

  clickOnApplyButton() {
    return this.clickOnPickerApply(PERMISSIONS_PLACEHOLDER);
  }

  // Filter → tick the principal → Apply. The new row gets the lowest access, 'Read'.
  addPrincipal(displayName) {
    return super.addPrincipal(PERMISSIONS_PLACEHOLDER, displayName);
  }

  async addPrincipals(displayNames) {
    for (const displayName of displayNames) {
      await this.addPrincipal(displayName);
    }
  }

  // Display names of the principals with a permission, in display order.
  getSelectedPrincipals() {
    return this.getPickedPrincipals();
  }

  waitForPrincipalSelected(displayName) {
    return this.waitForPrincipalPicked(displayName);
  }

  // Clicks on the Remove button of the principal's row.
  removePrincipal(displayName) {
    return this.removePickedPrincipal(displayName);
  }

  isPermissionsFilterInputDisplayed() {
    return this.isElementDisplayed(this.permissionsFilterInput);
  }

  // A pinned (default) row keeps its Remove button, disabled.
  isRemoveButtonEnabled(displayName) {
    return this.isElementEnabled(
      IdProviderEditorStepDialog.css.pickedRemoveButton(this.step, displayName),
    );
  }

  isPrincipalRowDisplayed(key) {
    return this.isElementDisplayed(css.rowByKey(key));
  }

  // Access

  // The access shown in the row's selector, one of appConst.ID_PROVIDER_ACCESS.*.
  async getAccess(displayName) {
    await this.waitForElementDisplayed(css.accessSelectorValue(displayName));
    return await this.getText(css.accessSelectorValue(displayName));
  }

  isAccessSelectorEnabled(displayName) {
    return this.isElementEnabled(css.accessSelectorTrigger(displayName));
  }

  async clickOnAccessSelector(displayName) {
    try {
      await this.waitForElementEnabled(css.accessSelectorTrigger(displayName));
      await this.clickOnElement(css.accessSelectorTrigger(displayName));
      await this.waitForElementDisplayed(css.accessOptions);
      return await this.pause(200);
    } catch (err) {
      await this.handleError(
        `Permissions step - access selector of '${displayName}'`,
        'err_access_selector',
        err,
      );
    }
  }

  // Labels of the levels offered in the opened selector, widening: Read … Administrator.
  async getAccessOptions() {
    await this.waitForElementDisplayed(css.accessOptions);
    return await this.getTextInDisplayedElements(css.accessOptions);
  }

  // Opens the row's selector and picks the level by its label (appConst.ID_PROVIDER_ACCESS.*).
  async selectAccess(displayName, access) {
    try {
      await this.clickOnAccessSelector(displayName);
      const options = await this.getDisplayedElements(css.accessOptions);
      for (const option of options) {
        if ((await option.getText()) === access) {
          await option.click();
          return await this.pause(300);
        }
      }
      throw new Error(`no access level '${access}'`);
    } catch (err) {
      await this.handleError(
        `Permissions step - access '${access}' was not selected for '${displayName}'`,
        'err_select_access',
        err,
      );
    }
  }

  // Opens the row's selector and picks the level by its value, e.g. 'WRITE_USERS'.
  async selectAccessByValue(displayName, value) {
    try {
      await this.clickOnAccessSelector(displayName);
      await this.waitForElementDisplayed(css.accessOptionByValue(value));
      await this.clickOnElement(css.accessOptionByValue(value));
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `Permissions step - access '${value}' was not selected for '${displayName}'`,
        'err_select_access',
        err,
      );
    }
  }

  async waitForAccess(displayName, access, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.getBrowser().waitUntil(
        async () => (await this.getAccess(displayName)) === access,
        { timeout: ms, timeoutMsg: `'${displayName}' should have the access '${access}'` },
      );
    } catch (err) {
      await this.handleError(`Permissions step - access of '${displayName}'`, 'err_access', err);
    }
  }

  // The rows as { displayName: access }.
  async getPermissions() {
    const names = await this.getSelectedPrincipals();
    const permissions = {};
    for (const name of names) {
      permissions[name] = await this.getAccess(name);
    }
    return permissions;
  }

  // Flows

  // Adds the principal and gives it the access.
  async addPrincipalWithAccess(displayName, access) {
    await this.addPrincipal(displayName);
    await this.waitForPrincipalSelected(displayName);
    await this.selectAccess(displayName, access);
  }

  // Moves on to Summary.
  async clickOnNextAndWaitForSummaryStep() {
    await this.clickOnNextButton();
    await this.waitForElementDisplayed(
      IdProviderEditorStepDialog.css.stepPanel(IdProviderEditorStepDialog.STEP.SUMMARY),
      appConst.TIMEOUT.MEDIUM,
    );
  }
}

module.exports = IdProviderEditorPermissionsStepDialog;

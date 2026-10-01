/**
 * Created on 01.10.2026.
 *
 * 'Summary' step of the ID provider editor: reads the answers back as a label/value grid
 * (`dl` with `dt`/`dd` pairs): ID provider ('Display name (id)'), Description and Application (when
 * given), and Permissions - one icon, name and access level per line. The last step, so the footer
 * button reads 'Create' (new provider) or 'Save' (existing provider).
 */
const IdProviderEditorStepDialog = require('./provider.editor.step.dialog');
const appConst = require('../../../libs/app_const');

const DIALOG = IdProviderEditorStepDialog.css.container;
const PANEL = `${DIALOG} [data-registry-id='summary']`;

const css = {
  summary: `${PANEL} [data-component='StepDialogSummary']`,
  labels: `${PANEL} [data-component='StepDialogSummary'] > dt`,
  values: `${PANEL} [data-component='StepDialogSummary'] > dd`,
  // The permissions row: one line per principal - its name and, after it, its access level.
  permissionLines: `${PANEL} [data-component='PrincipalsSummaryRow'] > span`,
  principalName: 'span.truncate',
  accessLevel: 'span.text-subtle',
};

const LABEL = Object.freeze({
  ID_PROVIDER: 'ID provider',
  DESCRIPTION: 'Description',
  APPLICATION: 'Application',
  PERMISSIONS: 'Permissions',
});

class IdProviderEditorSummaryStepDialog extends IdProviderEditorStepDialog {
  get step() {
    return IdProviderEditorStepDialog.STEP.SUMMARY;
  }

  static get LABEL() {
    return LABEL;
  }

  async waitForLoaded(ms = appConst.TIMEOUT.MEDIUM) {
    await super.waitForLoaded(ms);
    await this.waitForElementDisplayed(css.summary, ms);
  }

  // Labels of the rows, in display order, e.g. ['ID provider', 'Permissions'].
  getLabels() {
    return this.getTextInDisplayedElements(css.labels);
  }

  // The rows as { label: value }; the permissions row's value is its lines joined with '\n'.
  async getRows() {
    const labels = await this.getTextInDisplayedElements(css.labels);
    const values = await this.getTextInDisplayedElements(css.values);
    const rows = {};
    labels.forEach((label, index) => {
      rows[label] = values[index];
    });
    return rows;
  }

  // The value shown for the label, one of LABEL.* - or undefined when the row is absent.
  async getValue(label) {
    const rows = await this.getRows();
    return rows[label];
  }

  // 'Display name (id)'
  getIdProvider() {
    return this.getValue(LABEL.ID_PROVIDER);
  }

  // Absent when no description was typed: the row is not rendered at all.
  getDescription() {
    return this.getValue(LABEL.DESCRIPTION);
  }

  // Display name of the bound application; absent when none is bound.
  getApplication() {
    return this.getValue(LABEL.APPLICATION);
  }

  // The permissions as { displayName: access }, access one of appConst.ID_PROVIDER_ACCESS.*.
  // Absent when no principal has access: the row is not rendered at all.
  async getPermissions() {
    const lines = await this.getDisplayedElements(css.permissionLines);
    const permissions = {};
    for (const line of lines) {
      const name = await line.$(css.principalName).getText();
      permissions[name] = await line.$(css.accessLevel).getText();
    }
    return permissions;
  }

  // Display names of the principals with a permission, in display order.
  async getPrincipals() {
    return Object.keys(await this.getPermissions());
  }

  async getAccess(displayName) {
    const permissions = await this.getPermissions();
    return permissions[displayName];
  }

  async isRowDisplayed(label) {
    const labels = await this.getTextInDisplayedElements(css.labels);
    return labels.includes(label);
  }

  // The last-step button: 'Create' for a new provider, 'Save' for an existing one.
  async clickOnCreateButton() {
    try {
      await this.waitForNextButtonEnabled();
      await this.clickOnElement(this.nextButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError('Summary step - Create button', 'err_summary_create_btn', err);
    }
  }

  clickOnSaveButton() {
    return this.clickOnCreateButton();
  }

  // Create/Save, then the dialog goes away.
  async clickOnCreateButtonAndWaitForClosed() {
    await this.clickOnCreateButton();
    await this.waitForClosed();
  }
}

module.exports = IdProviderEditorSummaryStepDialog;
module.exports.LABEL = LABEL;

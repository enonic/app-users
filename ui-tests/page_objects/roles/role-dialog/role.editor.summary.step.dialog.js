/**
 * Created on 01.10.2026.
 *
 * 'Summary' step of the role editor: reads the answers back as a label/value grid
 * (`dl` with `dt`/`dd` pairs): Role ('Display name (id)'), Description (when typed), and the picked
 * Users and Groups, one icon and name per line. The last step, so the footer button reads 'Create'
 * (new role) or 'Save' (existing role).
 */
const RoleEditorStepDialog = require('./role.editor.step.dialog');
const appConst = require('../../../libs/app_const');

const DIALOG = RoleEditorStepDialog.css.container;
const PANEL = `${DIALOG} [data-registry-id='summary']`;

const css = {
  summary: `${PANEL} [data-component='StepDialogSummary']`,
  labels: `${PANEL} [data-component='StepDialogSummary'] > dt`,
  values: `${PANEL} [data-component='StepDialogSummary'] > dd`,
  // A principals row: the names inside the value cell, one span per principal
  principalRows: `${PANEL} [data-component='PrincipalsSummaryRow']`,
  principalName: 'span.truncate',
};

const LABEL = Object.freeze({
  ROLE: 'Role',
  DESCRIPTION: 'Description',
  USERS: 'Users',
  GROUPS: 'Groups',
});

class RoleEditorSummaryStepDialog extends RoleEditorStepDialog {
  get step() {
    return RoleEditorStepDialog.STEP.SUMMARY;
  }

  static get LABEL() {
    return LABEL;
  }

  async waitForLoaded(ms = appConst.TIMEOUT.MEDIUM) {
    await super.waitForLoaded(ms);
    await this.waitForElementDisplayed(css.summary, ms);
  }

  // Labels of the rows, in display order, e.g. ['Role', 'Users'].
  getLabels() {
    return this.getTextInDisplayedElements(css.labels);
  }

  // The rows as { label: value }; a principals row's value is its names joined with '\n'.
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
  getRole() {
    return this.getValue(LABEL.ROLE);
  }

  // Absent when no description was typed: the row is not rendered at all.
  getDescription() {
    return this.getValue(LABEL.DESCRIPTION);
  }

  // Display names of the principals in the row with the label (LABEL.USERS or LABEL.GROUPS).
  // Absent when no principal was picked: the row is not rendered at all.
  async getPrincipals(label) {
    const labels = await this.getTextInDisplayedElements(css.labels);
    const index = labels.indexOf(label);
    if (index === -1) {
      return [];
    }
    const values = await this.getDisplayedElements(css.values);
    const names = await values[index].$$(css.principalName);
    const result = [];
    for (const name of names) {
      result.push(await name.getText());
    }
    return result;
  }

  getUsers() {
    return this.getPrincipals(LABEL.USERS);
  }

  getGroups() {
    return this.getPrincipals(LABEL.GROUPS);
  }

  async isRowDisplayed(label) {
    const labels = await this.getTextInDisplayedElements(css.labels);
    return labels.includes(label);
  }

  // The last-step button: 'Create' for a new role, 'Save' for an existing one.
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

module.exports = RoleEditorSummaryStepDialog;
module.exports.LABEL = LABEL;

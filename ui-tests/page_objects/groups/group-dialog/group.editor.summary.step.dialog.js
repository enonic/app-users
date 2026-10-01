/**
 * Created on 01.10.2026.
 *
 * 'Summary' step of the group editor: reads the answers back as a label/value grid
 * (`dl` with `dt`/`dd` pairs): ID provider, Group ('Display name (id)'), Description (when typed),
 * and the picked Members and Roles, one icon and name per line. The last step, so the footer button
 * reads 'Create' (new group) or 'Save' (existing group).
 */
const GroupEditorStepDialog = require('./group.editor.step.dialog');
const appConst = require('../../../libs/app_const');

const DIALOG = GroupEditorStepDialog.css.container;
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
  ID_PROVIDER: 'ID provider',
  GROUP: 'Group',
  DESCRIPTION: 'Description',
  MEMBERS: 'Members',
  ROLES: 'Roles',
});

class GroupEditorSummaryStepDialog extends GroupEditorStepDialog {
  get step() {
    return GroupEditorStepDialog.STEP.SUMMARY;
  }

  static get LABEL() {
    return LABEL;
  }

  async waitForLoaded(ms = appConst.TIMEOUT.MEDIUM) {
    await super.waitForLoaded(ms);
    await this.waitForElementDisplayed(css.summary, ms);
  }

  // Labels of the rows, in display order, e.g. ['ID provider', 'Group', 'Members'].
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

  getIdProvider() {
    return this.getValue(LABEL.ID_PROVIDER);
  }

  // 'Display name (id)'
  getGroup() {
    return this.getValue(LABEL.GROUP);
  }

  // Absent when no description was typed: the row is not rendered at all.
  getDescription() {
    return this.getValue(LABEL.DESCRIPTION);
  }

  // Display names of the principals in the row with the label (LABEL.MEMBERS or LABEL.ROLES).
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

  getMembers() {
    return this.getPrincipals(LABEL.MEMBERS);
  }

  getRoles() {
    return this.getPrincipals(LABEL.ROLES);
  }

  async isRowDisplayed(label) {
    const labels = await this.getTextInDisplayedElements(css.labels);
    return labels.includes(label);
  }

  // The last-step button: 'Create' for a new group, 'Save' for an existing one.
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

module.exports = GroupEditorSummaryStepDialog;
module.exports.LABEL = LABEL;

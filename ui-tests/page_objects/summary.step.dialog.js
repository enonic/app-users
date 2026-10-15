/**
 * Created on 06.10.2026.
 *
 * The 'Summary' step every editor ends with: the answers read back as a label/value grid (`dl`
 * with `dt`/`dd` pairs), rows of principals as one icon and name per line, and in the footer the
 * last-step button - 'Create' for a new item, 'Save' for an existing one. On that step
 * Dialog.StepIndicator renders a plain Button in place of Stepper.Next (StepDialogFooter:
 * lastStepLabel), so the button is located by its label.
 *
 * `withSummaryStep(EditorStepDialog, LABEL)` makes the Summary class of an editor: it extends the
 * editor's base class (which carries the steps and the section) and takes the row labels the editor
 * uses. The editor's own summary file adds the getters named after its rows.
 */
const appConst = require('../libs/app_const');

function withSummaryStep(EditorStepDialog, LABEL) {
  const DIALOG = EditorStepDialog.css.container;
  const PANEL = `${DIALOG} [data-registry-id='${EditorStepDialog.STEP.SUMMARY}']`;
  const INDICATOR = `${DIALOG} [data-component='Dialog.StepIndicator']`;

  const css = {
    summary: `${PANEL} [data-component='StepDialogSummary']`,
    labels: `${PANEL} [data-component='StepDialogSummary'] > dt`,
    values: `${PANEL} [data-component='StepDialogSummary'] > dd`,
    // A principals row: the names inside the value cell, one span per principal
    principalName: 'span.truncate',
    createButton: `${INDICATOR} button[aria-label='Create']`,
    saveButton: `${INDICATOR} button[aria-label='Save']`,
  };

  return class SummaryStepDialog extends EditorStepDialog {
    get step() {
      return EditorStepDialog.STEP.SUMMARY;
    }

    static get LABEL() {
      return LABEL;
    }

    get createButton() {
      return css.createButton;
    }

    get saveButton() {
      return css.saveButton;
    }

    async waitForLoaded(ms = appConst.TIMEOUT.MEDIUM) {
      await super.waitForLoaded(ms);
      await this.waitForElementDisplayed(css.summary, ms);
    }

    // Labels of the rows, in display order, e.g. ['ID provider', 'User', 'Email', 'Roles'].
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

    // Display names of the principals in the row with the label. Absent when no principal was
    // picked: the row is not rendered at all.
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

    async isRowDisplayed(label) {
      const labels = await this.getTextInDisplayedElements(css.labels);
      return labels.includes(label);
    }

    // Create - the last-step button of a new item

    async clickOnCreateButton() {
      try {
        await this.waitForCreateButtonEnabled();
        await this.clickOnElement(css.createButton);
        return await this.pause(300);
      } catch (err) {
        await this.handleError('Summary step - Create button', 'err_summary_create_btn', err);
      }
    }

    async waitForCreateButtonDisplayed(ms = appConst.TIMEOUT.MEDIUM) {
      try {
        await this.waitForElementDisplayed(css.createButton, ms);
      } catch (err) {
        await this.handleError(
          'Summary step - Create button should be displayed',
          'err_summary_create_btn',
          err,
        );
      }
    }

    async waitForCreateButtonEnabled(ms = appConst.TIMEOUT.MEDIUM) {
      try {
        await this.waitForElementEnabled(css.createButton, ms);
      } catch (err) {
        await this.handleError(
          'Summary step - Create button should be enabled',
          'err_summary_create_btn',
          err,
        );
      }
    }

    async waitForCreateButtonDisabled(ms = appConst.TIMEOUT.MEDIUM) {
      try {
        await this.waitForElementDisabled(css.createButton, ms);
      } catch (err) {
        await this.handleError(
          'Summary step - Create button should be disabled',
          'err_summary_create_btn',
          err,
        );
      }
    }

    isCreateButtonDisplayed() {
      return this.isElementDisplayed(css.createButton);
    }

    isCreateButtonEnabled() {
      return this.isElementEnabled(css.createButton);
    }

    // Save - the last-step button of an existing item

    async clickOnSaveButton() {
      try {
        await this.waitForSaveButtonEnabled();
        await this.clickOnElement(css.saveButton);
        return await this.pause(300);
      } catch (err) {
        await this.handleError('Summary step - Save button', 'err_summary_save_btn', err);
      }
    }

    async waitForSaveButtonDisplayed(ms = appConst.TIMEOUT.MEDIUM) {
      try {
        await this.waitForElementDisplayed(css.saveButton, ms);
      } catch (err) {
        await this.handleError(
          'Summary step - Save button should be displayed',
          'err_summary_save_btn',
          err,
        );
      }
    }

    async waitForSaveButtonEnabled(ms = appConst.TIMEOUT.MEDIUM) {
      try {
        await this.waitForElementEnabled(css.saveButton, ms);
      } catch (err) {
        await this.handleError(
          'Summary step - Save button should be enabled',
          'err_summary_save_btn',
          err,
        );
      }
    }

    async waitForSaveButtonDisabled(ms = appConst.TIMEOUT.MEDIUM) {
      try {
        await this.waitForElementDisabled(css.saveButton, ms);
      } catch (err) {
        await this.handleError(
          'Summary step - Save button should be disabled',
          'err_summary_save_btn',
          err,
        );
      }
    }

    isSaveButtonDisplayed() {
      return this.isElementDisplayed(css.saveButton);
    }

    isSaveButtonEnabled() {
      return this.isElementEnabled(css.saveButton);
    }

    // Create, then the dialog goes away.
    async clickOnCreateButtonAndWaitForClosed() {
      await this.clickOnCreateButton();
      await this.waitForClosed();
    }

    // Save, then the dialog goes away.
    async clickOnSaveButtonAndWaitForClosed() {
      await this.clickOnSaveButton();
      await this.waitForClosed();
    }
  };
}

module.exports = withSummaryStep;

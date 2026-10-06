/**
 * Created on 01.10.2026.
 *
 * 'Summary' step of the ID provider editor: ID provider ('Display name (id)'), Description and
 * Application (when given), and Permissions - one principal per line with its access level after
 * the name. The generic part is withSummaryStep (summary.step.dialog.js); this file names the rows
 * and reads the access levels.
 */
const withSummaryStep = require('../../summary.step.dialog');
const IdProviderEditorStepDialog = require('./provider.editor.step.dialog');

const LABEL = Object.freeze({
  ID_PROVIDER: 'ID provider',
  DESCRIPTION: 'Description',
  APPLICATION: 'Application',
  PERMISSIONS: 'Permissions',
});

const DIALOG = IdProviderEditorStepDialog.css.container;
const css = {
  // The permissions row: one line per principal - its name and, after it, its access level.
  permissionLines: `${DIALOG} [data-registry-id='summary'] [data-component='PrincipalsSummaryRow'] > span`,
  principalName: 'span.truncate',
  accessLevel: 'span.text-subtle',
};

class IdProviderEditorSummaryStepDialog extends withSummaryStep(IdProviderEditorStepDialog, LABEL) {
  // 'Display name (id)'
  getIdProvider() {
    return this.getValue(LABEL.ID_PROVIDER);
  }

  // Absent when no description was typed.
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
  async getPrincipalNames() {
    return Object.keys(await this.getPermissions());
  }

  async getAccess(displayName) {
    const permissions = await this.getPermissions();
    return permissions[displayName];
  }
}

module.exports = IdProviderEditorSummaryStepDialog;
module.exports.LABEL = LABEL;

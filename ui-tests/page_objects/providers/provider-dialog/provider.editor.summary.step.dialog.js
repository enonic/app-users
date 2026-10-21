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
const PERMISSIONS = `${DIALOG} [data-registry-id='summary'] [data-component='PrincipalsSummaryRow']`;

// The permissions row is one line per principal: its name and, after it, its access level. Read as
// two flat lists rather than line by line - a lookup below the section's shadow root drops the '>'
// combinator and matches every descendant, so 'row > span' finds the lines *and* the spans inside
// them. The two lists come back in display order, one entry each per line.
const css = {
  principalNames: `${PERMISSIONS} span.truncate`,
  accessLevels: `${PERMISSIONS} span.text-subtle`,
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
    const names = await this.getTextInDisplayedElements(css.principalNames);
    const levels = await this.getTextInDisplayedElements(css.accessLevels);
    const permissions = {};
    names.forEach((name, index) => {
      permissions[name] = levels[index];
    });
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

/**
 * Created on 01.10.2026.
 *
 * 'Summary' step of the role editor: Role ('Display name (id)'), Description (when typed), and the
 * picked Users and Groups. The generic part is withSummaryStep (summary.step.dialog.js); this file
 * names the rows.
 */
const withSummaryStep = require('../../summary.step.dialog');
const RoleEditorStepDialog = require('./role.editor.step.dialog');

const LABEL = Object.freeze({
  ROLE: 'Role',
  DESCRIPTION: 'Description',
  USERS: 'Users',
  GROUPS: 'Groups',
});

class RoleEditorSummaryStepDialog extends withSummaryStep(RoleEditorStepDialog, LABEL) {
  // 'Display name (id)'
  getRole() {
    return this.getValue(LABEL.ROLE);
  }

  // Absent when no description was typed.
  getDescription() {
    return this.getValue(LABEL.DESCRIPTION);
  }

  getUsers() {
    return this.getPrincipals(LABEL.USERS);
  }

  getGroups() {
    return this.getPrincipals(LABEL.GROUPS);
  }
}

module.exports = RoleEditorSummaryStepDialog;
module.exports.LABEL = LABEL;

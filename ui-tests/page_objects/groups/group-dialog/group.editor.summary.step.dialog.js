/**
 * Created on 01.10.2026.
 *
 * 'Summary' step of the group editor: ID provider, Group ('Display name (id)'), Description (when
 * typed), and the picked Members and Roles. The generic part is withSummaryStep
 * (summary.step.dialog.js); this file names the rows.
 */
const withSummaryStep = require('../../summary.step.dialog');
const GroupEditorStepDialog = require('./group.editor.step.dialog');

const LABEL = Object.freeze({
  ID_PROVIDER: 'ID provider',
  GROUP: 'Group',
  DESCRIPTION: 'Description',
  MEMBERS: 'Members',
  ROLES: 'Roles',
});

class GroupEditorSummaryStepDialog extends withSummaryStep(GroupEditorStepDialog, LABEL) {
  getIdProvider() {
    return this.getValue(LABEL.ID_PROVIDER);
  }

  // 'Display name (id)'
  getGroup() {
    return this.getValue(LABEL.GROUP);
  }

  // Absent when no description was typed.
  getDescription() {
    return this.getValue(LABEL.DESCRIPTION);
  }

  getMembers() {
    return this.getPrincipals(LABEL.MEMBERS);
  }

  getRoles() {
    return this.getPrincipals(LABEL.ROLES);
  }
}

module.exports = GroupEditorSummaryStepDialog;
module.exports.LABEL = LABEL;

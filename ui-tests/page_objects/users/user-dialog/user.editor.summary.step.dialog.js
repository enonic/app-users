/**
 * Created on 25.09.2026.
 *
 * 'Summary' step of the user editor: ID provider, User ('Display name (name)'), Email, Credentials
 * (what the Credentials step says will happen), and the picked Roles and Groups. The generic part
 * is withSummaryStep (summary.step.dialog.js); this file names the rows.
 */
const withSummaryStep = require('../../summary.step.dialog');
const UserEditorStepDialog = require('./user.editor.step.dialog');

const LABEL = Object.freeze({
  ID_PROVIDER: 'ID provider',
  USER: 'User',
  EMAIL: 'Email',
  CREDENTIALS: 'Credentials',
  ROLES: 'Roles',
  GROUPS: 'Groups',
});

class UserEditorSummaryStepDialog extends withSummaryStep(UserEditorStepDialog, LABEL) {
  getIdProvider() {
    return this.getValue(LABEL.ID_PROVIDER);
  }

  // 'Display name (name)'
  getUser() {
    return this.getValue(LABEL.USER);
  }

  getEmail() {
    return this.getValue(LABEL.EMAIL);
  }

  // What the Credentials step says will happen, e.g. 'A password will be set' - absent when nothing
  // was set.
  getCredentials() {
    return this.getValue(LABEL.CREDENTIALS);
  }

  getRoles() {
    return this.getPrincipals(LABEL.ROLES);
  }

  getGroups() {
    return this.getPrincipals(LABEL.GROUPS);
  }
}

module.exports = UserEditorSummaryStepDialog;
module.exports.LABEL = LABEL;

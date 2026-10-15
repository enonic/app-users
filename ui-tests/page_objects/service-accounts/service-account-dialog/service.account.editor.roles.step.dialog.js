/**
 * Created on 01.10.2026.
 *
 * 'Roles' step: the principal picker over the roles ('Search roles').
 *
 * A service account is edited in the user editor (UserEditorDialog) mounted in the Service Accounts
 * section: the same dialog, the same steps minus ID provider, so this class only binds the user
 * editor's page object to that section's shadow root. Locators, methods and STEP/LABEL constants are
 * inherited from user.editor.roles.step.dialog.js.
 */
const UserEditorRolesStepDialog = require('../../users/user-dialog/user.editor.roles.step.dialog');
const appConst = require('../../../libs/app_const');

class ServiceAccountEditorRolesStepDialog extends UserEditorRolesStepDialog {
  constructor() {
    super(appConst.SECTION_ID.SERVICE_ACCOUNTS);
  }
}

module.exports = ServiceAccountEditorRolesStepDialog;

/**
 * Created on 01.10.2026.
 *
 * 'Credentials' step: the password and, since a service account is a system-provider user, the
 * Public keys block (Add opens add.public.key.dialog.js).
 *
 * A service account is edited in the user editor (UserEditorDialog) mounted in the Service Accounts
 * section: the same dialog, the same steps minus ID provider, so this class only binds the user
 * editor's page object to that section's shadow root. Locators, methods and STEP/LABEL constants are
 * inherited from user.editor.credentials.step.dialog.js.
 */
const UserEditorCredentialsStepDialog = require('../../users/user-dialog/user.editor.credentials.step.dialog');
const appConst = require('../../../libs/app_const');

class ServiceAccountEditorCredentialsStepDialog extends UserEditorCredentialsStepDialog {
  constructor() {
    super(appConst.SECTION_ID.SERVICE_ACCOUNTS);
  }
}

module.exports = ServiceAccountEditorCredentialsStepDialog;

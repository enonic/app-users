/**
 * Created on 01.10.2026.
 *
 * 'General' step: Display name, ID, Email. The first step - a service account lives in the system
 * ID provider, so there is no ID provider step to pick one.
 *
 * A service account is edited in the user editor (UserEditorDialog) mounted in the Service Accounts
 * section: the same dialog, the same steps minus ID provider, so this class only binds the user
 * editor's page object to that section's shadow root. Locators, methods and STEP/LABEL constants are
 * inherited from user.editor.general.step.dialog.js.
 */
const UserEditorGeneralStepDialog = require('../../users/user-dialog/user.editor.general.step.dialog');
const appConst = require('../../../libs/app_const');

class ServiceAccountEditorGeneralStepDialog extends UserEditorGeneralStepDialog {
  constructor() {
    super(appConst.SECTION_ID.SERVICE_ACCOUNTS);
  }
}

module.exports = ServiceAccountEditorGeneralStepDialog;

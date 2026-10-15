/**
 * Created on 01.10.2026.
 *
 * 'Groups' step: the principal picker over the groups ('Search groups'), with the
 * 'Show groups from all ID providers' toggle above it.
 *
 * A service account is edited in the user editor (UserEditorDialog) mounted in the Service Accounts
 * section: the same dialog, the same steps minus ID provider, so this class only binds the user
 * editor's page object to that section's shadow root. Locators, methods and STEP/LABEL constants are
 * inherited from user.editor.groups.step.dialog.js.
 */
const UserEditorGroupsStepDialog = require('../../users/user-dialog/user.editor.groups.step.dialog');
const appConst = require('../../../libs/app_const');

class ServiceAccountEditorGroupsStepDialog extends UserEditorGroupsStepDialog {
  constructor() {
    super(appConst.SECTION_ID.SERVICE_ACCOUNTS);
  }
}

module.exports = ServiceAccountEditorGroupsStepDialog;

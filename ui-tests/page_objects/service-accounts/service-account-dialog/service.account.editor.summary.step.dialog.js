/**
 * Created on 01.10.2026.
 *
 * 'Summary' step: User ('Display name (id)'), Email, Credentials, Roles, Groups; the footer button
 * reads 'Create' or 'Save'.
 *
 * A service account is edited in the user editor (UserEditorDialog) mounted in the Service Accounts
 * section: the same dialog, the same steps minus ID provider, so this class only binds the user
 * editor's page object to that section's shadow root. Locators, methods and STEP/LABEL constants are
 * inherited from user.editor.summary.step.dialog.js.
 */
const UserEditorSummaryStepDialog = require('../../users/user-dialog/user.editor.summary.step.dialog');
const appConst = require('../../../libs/app_const');

class ServiceAccountEditorSummaryStepDialog extends UserEditorSummaryStepDialog {
  constructor() {
    super(appConst.SECTION_ID.SERVICE_ACCOUNTS);
  }
}

module.exports = ServiceAccountEditorSummaryStepDialog;

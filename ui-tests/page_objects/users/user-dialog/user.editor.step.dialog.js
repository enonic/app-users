/**
 * Created on 25.09.2026.
 *
 * Base class of the user editor's steps: ID provider → General → Credentials → Roles → Groups →
 * Summary. A service account skips the ID provider step (its provider is the system store), and an
 * existing user is edited without it: the provider is then read-only on General. Everything shared
 * is in StepDialog (step.dialog.js); one child class per step (user.editor.<step>.step.dialog.js)
 * adds the step's own controls.
 */
const StepDialog = require('../../step.dialog');
const appConst = require('../../../libs/app_const');

const STEP = Object.freeze({
  ID_PROVIDER: 'idProvider',
  GENERAL: 'general',
  CREDENTIALS: 'credentials',
  ROLES: 'roles',
  GROUPS: 'groups',
  SUMMARY: 'summary',
});

const css = StepDialog.buildStepDialogCss('UserEditorDialog');

class UserEditorStepDialog extends StepDialog {
  // The same dialog serves the Service Accounts section; pass its SECTION_ID for that copy.
  constructor(sectionId = appConst.SECTION_ID.USERS) {
    super(sectionId, 'User editor dialog');
  }

  static get STEP() {
    return STEP;
  }

  static get css() {
    return css;
  }
}

module.exports = UserEditorStepDialog;

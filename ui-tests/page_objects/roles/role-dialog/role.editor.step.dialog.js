/**
 * Created on 01.10.2026.
 *
 * Base class of the role editor's steps: General → Users → Groups → Summary. A role lives in the
 * system store, so there is no ID provider step. Everything shared is in StepDialog
 * (step.dialog.js); one child class per step (role.editor.<step>.step.dialog.js) adds the step's own
 * controls.
 */
const StepDialog = require('../../step.dialog');
const appConst = require('../../../libs/app_const');

const STEP = Object.freeze({
  GENERAL: 'general',
  USERS: 'users',
  GROUPS: 'groups',
  SUMMARY: 'summary',
});

const css = StepDialog.buildStepDialogCss('RoleEditorDialog');

class RoleEditorStepDialog extends StepDialog {
  constructor(sectionId = appConst.SECTION_ID.ROLES) {
    super(sectionId, 'Role editor dialog');
  }

  static get STEP() {
    return STEP;
  }

  static get css() {
    return css;
  }
}

module.exports = RoleEditorStepDialog;

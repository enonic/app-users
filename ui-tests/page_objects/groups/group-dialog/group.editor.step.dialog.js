/**
 * Created on 01.10.2026.
 *
 * Base class of the group editor's steps: ID provider → General → Members → Roles → Summary. An
 * existing group is edited without the ID provider step: the provider is then read-only on
 * General. Everything shared is in StepDialog (step.dialog.js); one child class per step
 * (group.editor.<step>.step.dialog.js) adds the step's own controls.
 */
const StepDialog = require('../../step.dialog');
const appConst = require('../../../libs/app_const');

const STEP = Object.freeze({
  ID_PROVIDER: 'idProvider',
  GENERAL: 'general',
  MEMBERS: 'members',
  ROLES: 'roles',
  SUMMARY: 'summary',
});

const css = StepDialog.buildStepDialogCss('GroupEditorDialog');

class GroupEditorStepDialog extends StepDialog {
  constructor(sectionId = appConst.SECTION_ID.GROUPS) {
    super(sectionId, 'Group editor dialog');
  }

  static get STEP() {
    return STEP;
  }

  static get css() {
    return css;
  }
}

module.exports = GroupEditorStepDialog;

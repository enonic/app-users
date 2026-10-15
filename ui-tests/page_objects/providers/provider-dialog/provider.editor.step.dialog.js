/**
 * Created on 01.10.2026.
 *
 * Base class of the ID provider editor's steps: General → Permissions → Summary. Everything shared
 * is in StepDialog (step.dialog.js); one child class per step (provider.editor.<step>.step.dialog.js)
 * adds the step's own controls.
 */
const StepDialog = require('../../step.dialog');
const appConst = require('../../../libs/app_const');

const STEP = Object.freeze({
  GENERAL: 'general',
  PERMISSIONS: 'permissions',
  SUMMARY: 'summary',
});

const css = StepDialog.buildStepDialogCss('IdProviderEditorDialog');

class IdProviderEditorStepDialog extends StepDialog {
  constructor(sectionId = appConst.SECTION_ID.ID_PROVIDERS) {
    super(sectionId, 'ID provider editor dialog');
  }

  static get STEP() {
    return STEP;
  }

  static get css() {
    return css;
  }
}

module.exports = IdProviderEditorStepDialog;

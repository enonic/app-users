import type { ComponentType } from 'preact';

import { USER_EDITOR_STEPS, type UserEditorStep } from '../../model/user-editor-steps';
import { UserEditorDialogCredentialStep } from './UserEditorDialogCredentialStep';
import { UserEditorDialogGroupsStep } from './UserEditorDialogGroupsStep';
import { UserEditorDialogIdentityStep } from './UserEditorDialogIdentityStep';
import { UserEditorDialogRoleStep } from './UserEditorDialogRoleStep';
import { UserEditorDialogSummaryStep } from './UserEditorDialogSummaryStep';

/** The panel behind each step, so the dialog can render the wizard's whole order or one step alone. */
export const USER_EDITOR_STEP_PANELS: Record<UserEditorStep, ComponentType> = {
  [USER_EDITOR_STEPS.identity]: UserEditorDialogIdentityStep,
  [USER_EDITOR_STEPS.credentials]: UserEditorDialogCredentialStep,
  [USER_EDITOR_STEPS.roles]: UserEditorDialogRoleStep,
  [USER_EDITOR_STEPS.groups]: UserEditorDialogGroupsStep,
  [USER_EDITOR_STEPS.summary]: UserEditorDialogSummaryStep,
};

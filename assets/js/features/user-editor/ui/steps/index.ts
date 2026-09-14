import type { ComponentType } from 'preact';

import type { UserEditorStep } from '../../model/user-editor-steps';
import { UserEditorDialogCredentialStep } from './UserEditorDialogCredentialStep';
import { UserEditorDialogGeneralStep } from './UserEditorDialogGeneralStep';
import { UserEditorDialogGroupsStep } from './UserEditorDialogGroupsStep';
import { UserEditorDialogRoleStep } from './UserEditorDialogRoleStep';
import { UserEditorDialogSummaryStep } from './UserEditorDialogSummaryStep';

export const USER_EDITOR_STEP_PANELS: Record<UserEditorStep, ComponentType> = {
  general: UserEditorDialogGeneralStep,
  credentials: UserEditorDialogCredentialStep,
  roles: UserEditorDialogRoleStep,
  groups: UserEditorDialogGroupsStep,
  summary: UserEditorDialogSummaryStep,
};

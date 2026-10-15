import type { ComponentType } from 'preact';

import type { RoleEditorStep } from '../../model/role-editor-steps';
import { RoleEditorDialogGeneralStep } from './RoleEditorDialogGeneralStep';
import { RoleEditorDialogGroupsStep } from './RoleEditorDialogGroupsStep';
import { RoleEditorDialogSummaryStep } from './RoleEditorDialogSummaryStep';
import { RoleEditorDialogUsersStep } from './RoleEditorDialogUsersStep';

export const ROLE_EDITOR_STEP_PANELS: Record<RoleEditorStep, ComponentType> = {
  general: RoleEditorDialogGeneralStep,
  users: RoleEditorDialogUsersStep,
  groups: RoleEditorDialogGroupsStep,
  summary: RoleEditorDialogSummaryStep,
};

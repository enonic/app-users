import type { ComponentType } from 'preact';

import type { RoleEditorStep } from '../../model/role-editor-steps';
import { RoleEditorDialogGeneralStep } from './RoleEditorDialogGeneralStep';
import { RoleEditorDialogMembersStep } from './RoleEditorDialogMembersStep';
import { RoleEditorDialogSummaryStep } from './RoleEditorDialogSummaryStep';

export const ROLE_EDITOR_STEP_PANELS: Record<RoleEditorStep, ComponentType> = {
  general: RoleEditorDialogGeneralStep,
  members: RoleEditorDialogMembersStep,
  summary: RoleEditorDialogSummaryStep,
};

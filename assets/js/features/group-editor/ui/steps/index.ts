import type { ComponentType } from 'preact';

import type { GroupEditorStep } from '../../model/group-editor-steps';
import { GroupEditorDialogIdentityStep } from './GroupEditorDialogIdentityStep';
import { GroupEditorDialogMembersStep } from './GroupEditorDialogMembersStep';
import { GroupEditorDialogRolesStep } from './GroupEditorDialogRolesStep';
import { GroupEditorDialogSummaryStep } from './GroupEditorDialogSummaryStep';

export const GROUP_EDITOR_STEP_PANELS: Record<GroupEditorStep, ComponentType> = {
  identity: GroupEditorDialogIdentityStep,
  members: GroupEditorDialogMembersStep,
  roles: GroupEditorDialogRolesStep,
  summary: GroupEditorDialogSummaryStep,
};

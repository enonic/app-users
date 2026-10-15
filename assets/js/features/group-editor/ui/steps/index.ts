import type { ComponentType } from 'preact';

import type { GroupEditorStep } from '../../model/group-editor-steps';
import { GroupEditorDialogGeneralStep } from './GroupEditorDialogGeneralStep';
import { GroupEditorDialogIdProviderStep } from './GroupEditorDialogIdProviderStep';
import { GroupEditorDialogMembersStep } from './GroupEditorDialogMembersStep';
import { GroupEditorDialogRolesStep } from './GroupEditorDialogRolesStep';
import { GroupEditorDialogSummaryStep } from './GroupEditorDialogSummaryStep';

export const GROUP_EDITOR_STEP_PANELS: Record<GroupEditorStep, ComponentType> = {
  idProvider: GroupEditorDialogIdProviderStep,
  general: GroupEditorDialogGeneralStep,
  members: GroupEditorDialogMembersStep,
  roles: GroupEditorDialogRolesStep,
  summary: GroupEditorDialogSummaryStep,
};

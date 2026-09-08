import type { ComponentType } from 'preact';

import type { GroupEditorStep } from '../../model/group-editor-steps';
import { GroupEditorDialogIdentityStep } from './GroupEditorDialogIdentityStep';
import { GroupEditorDialogMembersStep } from './GroupEditorDialogMembersStep';
import { GroupEditorDialogRolesStep } from './GroupEditorDialogRolesStep';

// TODO: [#2665] Summary lands in the next phase.
const NotYet: ComponentType = () => null;

export const GROUP_EDITOR_STEP_PANELS: Record<GroupEditorStep, ComponentType> = {
  identity: GroupEditorDialogIdentityStep,
  members: GroupEditorDialogMembersStep,
  roles: GroupEditorDialogRolesStep,
  summary: NotYet,
};

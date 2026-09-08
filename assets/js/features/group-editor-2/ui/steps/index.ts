import type { ComponentType } from 'preact';

import type { GroupEditorStep } from '../../model/group-editor-steps';
import { GroupEditorDialogIdentityStep } from './GroupEditorDialogIdentityStep';
import { GroupEditorDialogMembersStep } from './GroupEditorDialogMembersStep';

// TODO: [#2665] Roles and Summary land one phase each.
const NotYet: ComponentType = () => null;

export const GROUP_EDITOR_STEP_PANELS: Record<GroupEditorStep, ComponentType> = {
  identity: GroupEditorDialogIdentityStep,
  members: GroupEditorDialogMembersStep,
  roles: NotYet,
  summary: NotYet,
};

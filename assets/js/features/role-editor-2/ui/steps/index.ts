import type { ComponentType } from 'preact';

import type { RoleEditorStep } from '../../model/role-editor-steps';
import { RoleEditorDialogIdentityStep } from './RoleEditorDialogIdentityStep';
import { RoleEditorDialogMembersStep } from './RoleEditorDialogMembersStep';

// TODO: [#2664] Summary lands in its own phase.
const NotYet: ComponentType = () => null;

export const ROLE_EDITOR_STEP_PANELS: Record<RoleEditorStep, ComponentType> = {
  identity: RoleEditorDialogIdentityStep,
  members: RoleEditorDialogMembersStep,
  summary: NotYet,
};

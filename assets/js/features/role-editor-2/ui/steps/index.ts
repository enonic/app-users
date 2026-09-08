import type { ComponentType } from 'preact';

import type { RoleEditorStep } from '../../model/role-editor-steps';
import { RoleEditorDialogIdentityStep } from './RoleEditorDialogIdentityStep';

// TODO: [#2664] Members and Summary land one phase each.
const NotYet: ComponentType = () => null;

export const ROLE_EDITOR_STEP_PANELS: Record<RoleEditorStep, ComponentType> = {
  identity: RoleEditorDialogIdentityStep,
  members: NotYet,
  summary: NotYet,
};

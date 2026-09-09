import { defineSteps } from '../../../shared/step-dialog';
import type { RoleFormField } from './role-form';

export type RoleEditorStep = 'identity' | 'members' | 'summary';

export const ROLE_EDITOR_STEPS = defineSteps<RoleEditorStep, RoleFormField>({
  identity: { title: 'roles.dialog.identity', fields: ['displayName', 'name'] },
  members: { title: 'roles.dialog.members', fields: [] },
  summary: { title: 'roles.dialog.summary', fields: [] },
});

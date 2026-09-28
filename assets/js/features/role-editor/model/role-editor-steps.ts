import { defineSteps } from '../../../shared/step-dialog';
import type { RoleFormField } from './role-form';

export type RoleEditorStep = 'general' | 'users' | 'groups' | 'summary';

export const ROLE_EDITOR_STEPS = defineSteps<RoleEditorStep, RoleFormField>({
  general: { title: 'roles.dialog.general', fields: ['displayName', 'name'] },
  users: { title: 'roles.dialog.users', fields: [] },
  groups: { title: 'roles.dialog.groups', fields: [] },
  summary: { title: 'roles.dialog.summary', fields: [] },
});

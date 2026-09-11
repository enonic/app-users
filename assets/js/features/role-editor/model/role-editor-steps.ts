import { defineSteps } from '../../../shared/step-dialog';
import type { RoleFormField } from './role-form';

export type RoleEditorStep = 'general' | 'members' | 'summary';

export const ROLE_EDITOR_STEPS = defineSteps<RoleEditorStep, RoleFormField>({
  general: { title: 'roles.dialog.general', fields: ['displayName', 'name'] },
  members: { title: 'roles.dialog.members', fields: [] },
  summary: { title: 'roles.dialog.summary', fields: [] },
});

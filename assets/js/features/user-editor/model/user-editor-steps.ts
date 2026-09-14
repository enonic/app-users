import { defineSteps } from '../../../shared/step-dialog';
import type { UserFormField } from './user-form';

export type UserEditorStep = 'general' | 'credentials' | 'roles' | 'groups' | 'summary';

export const USER_EDITOR_STEPS = defineSteps<UserEditorStep, UserFormField>({
  general: {
    title: 'users.dialog.general',
    fields: ['idProvider', 'displayName', 'name', 'email'],
  },
  credentials: { title: 'users.dialog.credentials', fields: ['password'] },
  roles: { title: 'users.dialog.roles', fields: [] },
  groups: { title: 'users.dialog.groups', fields: [] },
  summary: { title: 'users.dialog.summary', fields: [] },
});

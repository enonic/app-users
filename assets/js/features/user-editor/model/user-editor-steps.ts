import { defineSteps } from '../../../shared/step-dialog';
import type { UserFormField } from './user-form';

export type UserEditorStep = 'identity' | 'credentials' | 'roles' | 'groups' | 'summary';

export const USER_EDITOR_STEPS = defineSteps<UserEditorStep, UserFormField>({
  identity: {
    title: 'users.dialog.identity',
    fields: ['idProvider', 'displayName', 'name', 'email'],
  },
  credentials: { title: 'users.dialog.credentials', fields: ['password'] },
  roles: { title: 'users.dialog.roles', fields: [] },
  groups: { title: 'users.dialog.groups', fields: [] },
  summary: { title: 'users.dialog.summary', fields: [] },
});

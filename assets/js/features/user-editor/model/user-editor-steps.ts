import { defineSteps } from '../../../shared/step-dialog';
import type { UserFormField } from './user-form';

export type UserEditorStep =
  | 'idProvider'
  | 'general'
  | 'credentials'
  | 'roles'
  | 'groups'
  | 'summary';

export const USER_EDITOR_STEPS = defineSteps<UserEditorStep, UserFormField>({
  idProvider: { title: 'users.dialog.idProvider', fields: ['idProvider'] },
  general: { title: 'users.dialog.general', fields: ['displayName', 'name', 'email'] },
  credentials: { title: 'users.dialog.credentials', fields: ['password'] },
  roles: { title: 'users.dialog.roles', fields: [] },
  groups: { title: 'users.dialog.groups', fields: [] },
  summary: { title: 'users.dialog.summary', fields: [] },
});
